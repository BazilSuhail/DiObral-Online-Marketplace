import { useCallback, useEffect, useRef, useState } from "react"

// Browser speech in and out, plus a live mic level for the orb.
// levelRef / kickRef are refs (not state) so the canvas reads them every frame without re-renders.

const SpeechRecognition =
  typeof window !== "undefined" ? window.SpeechRecognition || window.webkitSpeechRecognition || null : null
const synth = typeof window !== "undefined" ? window.speechSynthesis : null

// Natural/neural voices (Edge, newer Chrome) sound far better than the defaults.
function pickVoice(lang = "en-US") {
  const voices = synth?.getVoices() || []
  const prefix = String(lang).slice(0, 2).toLowerCase()
  const match = voices.filter((v) => v.lang?.toLowerCase().startsWith(prefix))
  const en = voices.filter((v) => /^en/i.test(v.lang))
  const pool = match.length ? match : en.length ? en : voices
  const rank = (v) =>
    /natural|neural|online/i.test(v.name) ? 0
      : /google/i.test(v.name) ? 1
        : /samantha|premium|enhanced|daniel|serena/i.test(v.name) ? 2
          : 3
  return [...pool].sort((a, b) => rank(a) - rank(b))[0] || null
}

const sentences = (text) =>
  (String(text).match(/[^.!?]+[.!?]*/g) || []).map((s) => s.trim()).filter(Boolean)

const LANG_KEY = "diobral-assistant-lang"
const MUTE_KEY = "diobral-assistant-muted"
const LANGS = ["en-US", "ur-PK"]
const SILENCE_LEVEL = 0.04
const SILENCE_MS = 1600

const readLS = (k) => { try { return localStorage.getItem(k) } catch { return null } }
const writeLS = (k, v) => { try { localStorage.setItem(k, v) } catch { /* storage blocked */ } }

// One AudioContext for the whole app; suspended between listens.
let sharedCtx = null
function getAudioCtx() {
  if (!sharedCtx || sharedCtx.state === "closed") {
    const Ctx = window.AudioContext || window.webkitAudioContext
    if (!Ctx) return null
    sharedCtx = new Ctx()
  }
  return sharedCtx
}

export function useVoice({ onInterim, onFinal, onSilence } = {}) {
  const [lang, setLangState] = useState(() => {
    const v = readLS(LANG_KEY)
    return LANGS.includes(v) ? v : "en-US"
  })
  const [muted, setMutedState] = useState(() => readLS(MUTE_KEY) === "1")
  const langRef = useRef(lang)
  const mutedRef = useRef(muted)
  langRef.current = lang
  mutedRef.current = muted
  const setLang = useCallback((l) => {
    if (!LANGS.includes(l)) return
    langRef.current = l
    setLangState(l)
    writeLS(LANG_KEY, l)
    voiceRef.current = pickVoice(l)
  }, [])
  const setMuted = useCallback((m) => {
    const next = typeof m === "function" ? m(mutedRef.current) : !!m
    mutedRef.current = next
    setMutedState(next)
    writeLS(MUTE_KEY, next ? "1" : "0")
    if (next) { speakIdRef.current++; synth?.cancel(); setState((s) => (s === "speaking" ? "idle" : s)) }
  }, [])

  const [state, setState] = useState("idle") // idle | listening | speaking
  const levelRef = useRef(0)
  const kickRef = useRef(0)
  const recRef = useRef(null)
  const micRef = useRef(null) // { stream, source, timer }
  const voiceRef = useRef(null)
  const speakIdRef = useRef(0)
  const handlers = useRef({ onInterim, onFinal, onSilence })
  handlers.current = { onInterim, onFinal, onSilence }

  useEffect(() => {
    if (!synth) return
    const load = () => { voiceRef.current = pickVoice(langRef.current) }
    load()
    synth.addEventListener("voiceschanged", load)
    return () => synth.removeEventListener("voiceschanged", load)
  }, [])

  const stopMic = useCallback(() => {
    const mic = micRef.current
    micRef.current = null
    if (!mic) return
    clearInterval(mic.timer)
    try { mic.source?.disconnect() } catch { /* already disconnected */ }
    mic.stream?.getTracks().forEach((t) => t.stop())
    sharedCtx?.suspend?.().catch(() => {})
    levelRef.current = 0
  }, [])

  // Mic level from an AnalyserNode, sampled at ~30fps. Optional: if permission or Web Audio fails, the orb just uses no level.
  // onSilentTick runs each sample with the current level so listen() can auto-stop on silence.
  const startMic = useCallback(async (onLevel) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      if (!recRef.current) { stream.getTracks().forEach((t) => t.stop()); return }
      const ctx = getAudioCtx()
      if (!ctx) { stream.getTracks().forEach((t) => t.stop()); return }
      await ctx.resume().catch(() => {})
      const analyser = ctx.createAnalyser()
      analyser.fftSize = 256
      analyser.smoothingTimeConstant = 0.6
      const source = ctx.createMediaStreamSource(stream)
      source.connect(analyser)
      const buf = new Uint8Array(analyser.fftSize)
      const mic = { stream, source, timer: 0 }
      mic.timer = setInterval(() => {
        analyser.getByteTimeDomainData(buf)
        let sum = 0
        for (let i = 0; i < buf.length; i++) {
          const v = (buf[i] - 128) / 128
          sum += v * v
        }
        const rms = Math.sqrt(sum / buf.length)
        levelRef.current += (Math.min(1, rms * 3) - levelRef.current) * 0.3
        onLevel?.(levelRef.current)
      }, 33)
      micRef.current = mic
    } catch {
      /* no mic level, recognition may still work */
    }
  }, [])

  const stopListening = useCallback(() => {
    const rec = recRef.current
    recRef.current = null
    if (rec) {
      rec.onend = rec.onerror = rec.onresult = null
      try { rec.abort() } catch { /* already stopped */ }
    }
    stopMic()
    setState((s) => (s === "listening" ? "idle" : s))
  }, [stopMic])

  const cancelSpeech = useCallback(() => {
    speakIdRef.current++
    synth?.cancel()
    setState((s) => (s === "speaking" ? "idle" : s))
  }, [])

  const listen = useCallback(() => {
    if (!SpeechRecognition) return
    cancelSpeech()
    stopListening()

    const rec = new SpeechRecognition()
    rec.lang = langRef.current
    rec.interimResults = true
    rec.continuous = false
    let heard = ""
    let done = false
    let spoke = false
    let quietSince = 0

    // auto-stop once speech has been heard and the mic has then been quiet for 1.6s
    const onLevel = (lv) => {
      if (done || recRef.current !== rec) return
      if (lv >= SILENCE_LEVEL) { spoke = true; quietSince = 0; return }
      if (!spoke || !heard.trim()) return
      const now = performance.now()
      if (!quietSince) quietSince = now
      else if (now - quietSince > SILENCE_MS) {
        done = true
        const text = heard.trim()
        stopListening()
        handlers.current.onFinal?.(text)
      }
    }

    rec.onresult = (e) => {
      let text = ""
      for (let i = 0; i < e.results.length; i++) text += e.results[i][0].transcript
      heard = text
      handlers.current.onInterim?.(text)
      if (e.results[e.results.length - 1].isFinal && text.trim()) {
        done = true
        stopListening()
        handlers.current.onFinal?.(text.trim())
      }
    }
    rec.onerror = (e) => {
      if (e.error === "not-allowed" || e.error === "service-not-allowed") {
        done = true
        stopListening()
        handlers.current.onSilence?.("denied")
      }
    }
    rec.onend = () => {
      if (done) return
      const text = heard.trim()
      stopListening()
      if (text) handlers.current.onFinal?.(text)
      else handlers.current.onSilence?.("no-speech")
    }

    try {
      rec.start()
      recRef.current = rec
      setState("listening")
      startMic(onLevel)
    } catch {
      setState("idle")
    }
  }, [cancelSpeech, stopListening, startMic])

  // Speak sentence by sentence: Chrome cuts long utterances off after ~15s, and it gives the orb a beat per sentence.
  const speak = useCallback((text, onDone) => {
    if (mutedRef.current || !synth || !text) { onDone?.(); return }
    stopListening()
    synth.cancel()
    const id = ++speakIdRef.current
    const parts = sentences(text)
    if (!parts.length) { onDone?.(); return }
    setState("speaking")

    parts.forEach((part, i) => {
      const u = new SpeechSynthesisUtterance(part)
      if (voiceRef.current) u.voice = voiceRef.current
      u.lang = voiceRef.current?.lang || langRef.current
      u.rate = 1.03
      u.onstart = () => { kickRef.current = 1 }
      u.onboundary = (e) => { if (e.name === "word") kickRef.current = 1 }
      const finish = () => {
        if (speakIdRef.current !== id) return // interrupted
        if (i === parts.length - 1) {
          setState("idle")
          onDone?.()
        }
      }
      u.onend = finish
      u.onerror = finish
      synth.speak(u)
    })
  }, [stopListening])

  useEffect(() => () => {
    stopListening()
    speakIdRef.current++
    synth?.cancel()
  }, [stopListening])

  return {
    state,
    levelRef,
    kickRef,
    listen,
    stopListening,
    speak,
    cancelSpeech,
    canListen: !!SpeechRecognition,
    canSpeak: !!synth,
    lang,
    setLang,
    muted,
    setMuted,
  }
}
