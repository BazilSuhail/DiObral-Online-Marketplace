/* eslint-disable react/prop-types */
import { useEffect, useRef } from "react"
import { animate, motionValue } from "motion/react"

const DPR_CAP = 1.5
const FOV_DEG = 42
const TAU = Math.PI * 2

const MAX_COLORS = 5
const DEFAULT_COLORS = ["#FF3300", "#0055FF"]

const VERT_SPHERE = `
precision highp float;

attribute vec2 aPolar;

attribute vec2 aRnd;

uniform vec2  uRes;
uniform float uFocal;
uniform float uTime;
uniform float uRadius;
uniform float uWaveHeight;
uniform float uWaveLength;
uniform float uWaveSpeed;
uniform vec2  uWaveDir;
uniform float uCamDist;
uniform float uCamYaw;
uniform float uCamPitch;
uniform float uTilt;
uniform float uRimPower;
uniform float uCenter;

uniform float uColorCount;
uniform vec3  uColors[${MAX_COLORS}];
uniform vec3  uHotspot;

uniform vec3  uCamDir;

uniform vec3  uHoverDir;
uniform float uHoverRadius;
uniform float uHoverPush;
uniform float uHoverActive;

varying vec3  vCol;
varying float vAlpha;

float hash2(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise2(vec2 p) {
    vec2 i = floor(p); vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash2(i),            hash2(i + vec2(1,0)), u.x),
               mix(hash2(i + vec2(0,1)), hash2(i + vec2(1,1)), u.x), u.y);
}
float fbm(vec2 p) {
    float v = 0.0, a = 0.5;
    for (int i = 0; i < 3; i++) {
        v += a * noise2(p);
        p   = p * 2.3 + vec2(1.7, 9.2);
        a  *= 0.5;
    }
    return v;
}

vec3 rampColor(float x) {
    float p  = clamp(x, 0.0, 1.0) * max(uColorCount - 1.0, 0.0);
    float i0 = floor(p);
    float f  = p - i0;
    vec3 a = uColors[0];
    vec3 b = uColors[0];
    for (int i = 0; i < ${MAX_COLORS}; i++) {
        if (float(i) == i0)       a = uColors[i];
        if (float(i) == i0 + 1.0) b = uColors[i];
    }
    return mix(a, b, f);
}

void main() {
    float phi   = aPolar.x;
    float theta = aPolar.y;

    float sp  = sin(phi); float cp2 = cos(phi);
    float st  = sin(theta); float ct = cos(theta);

    vec3 norm = vec3(cp2 * ct, sp, cp2 * st);
    vec3 pos  = norm * uRadius;

    float wFreq = 6.2831853 / max(100.0, uWaveLength);
    float proj1 = norm.x * uWaveDir.x + norm.z * uWaveDir.y;
    float proj2 = norm.x * uWaveDir.y - norm.z * uWaveDir.x;

    float ts = uTime * (uWaveSpeed / 120.0);
    float wave1 = sin(proj1 * wFreq * 800.0 + ts * 1.2) * cos(norm.y * wFreq * 600.0 + ts * 0.3);
    float wave2 = sin(proj2 * wFreq * 600.0 + norm.y * 1.5 - ts * 0.5);
    float smoothWave = (wave1 + wave2 * 0.5) * uWaveHeight;
    pos += norm * smoothWave;

    float hFalloff = mix(22.0, 1.5, clamp(uHoverRadius / 100.0, 0.0, 1.0));
    float hDot     = max(0.0, dot(norm, uHoverDir));
    float hEffect  = exp(-(1.0 - hDot) * hFalloff) * uHoverActive;
    float hBulge   = hEffect * uHoverPush;
    pos += norm * hBulge;

    float cy  = cos(uCamYaw); float sy = sin(uCamYaw);
    float tp  = uCamPitch + uTilt;
    float ctp = cos(tp);      float stp = sin(tp);

    float x1  =  pos.x * cy + pos.z * sy;
    float z1  = -pos.x * sy + pos.z * cy;
    float y2  =  pos.y * ctp - z1 * stp;
    float z2  =  pos.y * stp + z1 * ctp;
    float rz  =  uCamDist - z2;

    if (rz < 1.0) {
        gl_Position = vec4(2.0, 2.0, 0.0, 1.0);
        vAlpha = 0.0; vCol = vec3(0.0); return;
    }

    float sx  = x1 * uFocal / rz;
    float sy2 = y2 * uFocal / rz;
    gl_Position  = vec4(sx / (uRes.x * 0.5), sy2 / (uRes.y * 0.5), 0.0, 1.0);

    float rimDot  = abs(dot(norm, uCamDir));
    float fresnel = pow(max(1.0 - rimDot, 0.0), uRimPower);

    fresnel = max(fresnel, uCenter * rimDot);

    float hoverAlpha = hEffect * 0.95;
    float finalAlpha = max(fresnel, hoverAlpha);

    float bri = 0.50 + aRnd.x * 0.50;

    float t      = sp * 0.5 + 0.5;

    vec3 baseCol = rampColor(1.0 - t);

    float polar  = min(pow(abs(sp), 4.0), 1.0);
    vec3 col     = mix(baseCol, uHotspot, polar * 0.88);

    vCol   = col;
    vAlpha = finalAlpha * bri;
}
`

const FRAG = `
precision highp float;
varying vec3  vCol;
varying float vAlpha;
void main() {
    gl_FragColor = vec4(vCol * vAlpha, vAlpha);
}
`

function parseColor(input) {
    if (!input) return [0, 0, 0]
    const s = input.trim()
    const fn = s.match(/rgba?\(([^)]+)\)/i)
    if (fn) {
        const p = fn[1].split(",").map((v) => parseFloat(v.trim()))
        return [(p[0] || 0) / 255, (p[1] || 0) / 255, (p[2] || 0) / 255]
    }
    let h = s.replace("#", "")
    if (h.length === 3 || h.length === 4)
        h = h.split("").map((c) => c + c).join("")
    h = h.padEnd(6, "0")
    return [
        parseInt(h.slice(0, 2), 16) / 255,
        parseInt(h.slice(2, 4), 16) / 255,
        parseInt(h.slice(4, 6), 16) / 255,
    ]
}

function mulberry32(a) {
    return () => {
        a |= 0
        a = (a + 0x6d2b79f5) | 0
        let t = Math.imul(a ^ (a >>> 15), 1 | a)
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296
    }
}

function compile(gl, type, src) {
    const sh = gl.createShader(type)
    gl.shaderSource(sh, src)
    gl.compileShader(sh)
    if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS))
        console.warn("PlasmaRing shader:", gl.getShaderInfoLog(sh))
    return sh
}

function linkProg(gl, vs, fs) {
    const prog = gl.createProgram()
    gl.attachShader(prog, compile(gl, gl.VERTEX_SHADER, vs))
    gl.attachShader(prog, compile(gl, gl.FRAGMENT_SHADER, fs))
    gl.linkProgram(prog)
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS))
        console.warn("PlasmaRing link:", gl.getProgramInfoLog(prog))
    return prog
}

const RIM_POWER = 3

const RADIUS = 280
const TILT = 20
const HOVER_RADIUS = 35
const HOVER_PUSH = 90
const ORBIT_DAMPING = 50

const WAVE_AT_50 = 120

const WAVE_DIRECTION = 45
const WAVE_LENGTH = 200

const CAM_FAR = 2100
const CAM_PER_SCALE = 15

export default function PlasmaRing(props) {
    const {
        background = "#000000",
        colors = ["#FF3300", "#0055FF", "#E200FF"],
        density = 120,
        speed = 100,
        waveHeight = 20,
        centerOpacity = 100,
        scale = 36,
        dragSensitivity = 100,
        transition = { ease: [0, 0, 0.58, 1], mass: 1, type: "tween", delay: 0, damping: 60, duration: 1, stiffness: 800 },
        style,
    } = props

    const hoverMV = useRef(motionValue(0)).current
    const transitionRef = useRef(transition)
    useEffect(() => {
        transitionRef.current = transition
    }, [transition])

    const cameraDistance = CAM_FAR - CAM_PER_SCALE * scale

    const radius = RADIUS
    const tilt = TILT
    const rimPower = RIM_POWER

    const center = centerOpacity / 100
    const waveLength = WAVE_LENGTH
    const waveDirection = WAVE_DIRECTION

    const waveSpeed = (speed / 50) * WAVE_AT_50
    const hoverRadius = HOVER_RADIUS
    const hoverPush = HOVER_PUSH

    const orbitSpeed = dragSensitivity
    const orbitDamping = ORBIT_DAMPING

    const hostRef = useRef(null)
    const canvasRef = useRef(null)

    const live = useRef({
        colors, density, cameraDistance,
        radius, tilt, rimPower, center,
        waveHeight, waveLength, waveSpeed, waveDirection,
        hoverRadius, hoverPush,
        orbitSpeed, orbitDamping,
    })
    useEffect(() => {
        live.current = {
            colors, density, cameraDistance,
            radius, tilt, rimPower, center,
            waveHeight, waveLength, waveSpeed, waveDirection,
            hoverRadius, hoverPush,
            orbitSpeed, orbitDamping,
        }
    })

    const cam = useRef({ yaw: 0, pitch: 0, yawV: 0, pitchV: 0 })

    const drag = useRef({ active: false, lastX: 0, lastY: 0 })

    const hov = useRef({ active: 0, target: 0, miss: 1, dirX: 0, dirY: 1, dirZ: 0, mx: 0, my: 0 })

    useEffect(() => {
        const host = hostRef.current
        const canvas = canvasRef.current
        if (!host || !canvas) return

        const gl = canvas.getContext("webgl", {
            alpha: true, antialias: false, premultipliedAlpha: true, depth: false,
        })
        if (!gl) return

        const sphereProg = linkProg(gl, VERT_SPHERE, FRAG)

        const U = (p, n) => gl.getUniformLocation(p, n)

        const palBuf = new Float32Array(MAX_COLORS * 3)

        const sA = {
            polar: gl.getAttribLocation(sphereProg, "aPolar"),
            rnd: gl.getAttribLocation(sphereProg, "aRnd"),
        }
        const sU = {
            res: U(sphereProg, "uRes"), focal: U(sphereProg, "uFocal"),
            time: U(sphereProg, "uTime"), radius: U(sphereProg, "uRadius"),
            waveHeight: U(sphereProg, "uWaveHeight"), waveLength: U(sphereProg, "uWaveLength"),
            waveSpeed: U(sphereProg, "uWaveSpeed"), waveDir: U(sphereProg, "uWaveDir"),
            camDist: U(sphereProg, "uCamDist"),
            camYaw: U(sphereProg, "uCamYaw"), camPitch: U(sphereProg, "uCamPitch"),
            tilt: U(sphereProg, "uTilt"), rimPow: U(sphereProg, "uRimPower"),
            center: U(sphereProg, "uCenter"),
            colorCount: U(sphereProg, "uColorCount"),
            colors: U(sphereProg, "uColors[0]"),
            hotspot: U(sphereProg, "uHotspot"), camDir: U(sphereProg, "uCamDir"),
            hoverDir: U(sphereProg, "uHoverDir"), hoverRadius: U(sphereProg, "uHoverRadius"),
            hoverPush: U(sphereProg, "uHoverPush"), hoverActive: U(sphereProg, "uHoverActive"),
        }

        const polarBuf = gl.createBuffer()
        const rndBuf = gl.createBuffer()
        const idxBuf = gl.createBuffer()
        let builtDensity = -1
        let count = 0
        let indexCount = 0

        const buildBuffers = (d) => {
            const N_theta = Math.max(60, Math.round(d * 2.5))
            const N_phi = Math.max(40, Math.round(d * 1.8))
            count = N_theta * N_phi

            const polarA = new Float32Array(count * 2)
            const rndA = new Float32Array(count * 2)
            const rnd = mulberry32(0xc0ffee7)
            let i = 0
            for (let ti = 0; ti < N_theta; ti++) {
                const theta = (ti + 0.5) / N_theta * TAU
                for (let pi = 0; pi < N_phi; pi++) {
                    const phi = ((pi + 0.5) / N_phi - 0.5) * Math.PI
                    polarA[i * 2] = phi
                    polarA[i * 2 + 1] = theta
                    rndA[i * 2] = rnd()
                    rndA[i * 2 + 1] = rnd()
                    i++
                }
            }

            const numMeridianSegments = N_theta * (N_phi - 1)
            const numParallelSegments = N_phi * N_theta
            indexCount = (numMeridianSegments + numParallelSegments) * 2
            const indices = new Uint16Array(indexCount)
            let idx = 0

            for (let ti = 0; ti < N_theta; ti++) {
                for (let pi = 0; pi < N_phi - 1; pi++) {
                    const curr = ti * N_phi + pi
                    const next = ti * N_phi + (pi + 1)
                    indices[idx++] = curr
                    indices[idx++] = next
                }
            }

            for (let pi = 0; pi < N_phi; pi++) {
                for (let ti = 0; ti < N_theta; ti++) {
                    const curr = ti * N_phi + pi
                    const next = ((ti + 1) % N_theta) * N_phi + pi
                    indices[idx++] = curr
                    indices[idx++] = next
                }
            }

            gl.bindBuffer(gl.ARRAY_BUFFER, polarBuf)
            gl.bufferData(gl.ARRAY_BUFFER, polarA, gl.STATIC_DRAW)
            gl.bindBuffer(gl.ARRAY_BUFFER, rndBuf)
            gl.bufferData(gl.ARRAY_BUFFER, rndA, gl.STATIC_DRAW)
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, idxBuf)
            gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW)
            builtDensity = d
        }

        gl.disable(gl.DEPTH_TEST)
        gl.enable(gl.BLEND)
        gl.blendFunc(gl.ONE, gl.ONE)

        let cssW = 0, cssH = 0, dpr = 1
        const resize = () => {
            dpr = Math.min(window.devicePixelRatio || 1, DPR_CAP)
            cssW = canvas.clientWidth || host.clientWidth || 1
            cssH = canvas.clientHeight || host.clientHeight || 1
            const w = Math.max(1, Math.round(cssW * dpr))
            const h = Math.max(1, Math.round(cssH * dpr))
            if (canvas.width !== w || canvas.height !== h) {
                canvas.width = w
                canvas.height = h
            }
            gl.viewport(0, 0, w, h)
        }
        resize()
        const ro = new ResizeObserver(resize)
        ro.observe(canvas)

        let hoverAnim = null
        const gateHover = (to) => {
            if (hov.current.target === to) return
            hov.current.target = to
            hoverAnim?.stop()
            hoverAnim = animate(hoverMV, to, transitionRef.current)
        }
        const onPointerDown = (e) => {
            drag.current = { active: true, lastX: e.clientX, lastY: e.clientY }
            host.setPointerCapture(e.pointerId)
        }
        const onPointerMove = (e) => {
            const r = host.getBoundingClientRect()
            hov.current.mx = e.clientX - r.left
            hov.current.my = e.clientY - r.top
            gateHover(1)

            if (!drag.current.active) return
            const L = live.current
            const dx = e.clientX - drag.current.lastX
            const dy = e.clientY - drag.current.lastY
            drag.current.lastX = e.clientX
            drag.current.lastY = e.clientY
            const spd = (L.orbitSpeed / 100) * (Math.PI / 180)
            cam.current.yawV += dx * spd
            cam.current.pitchV += dy * spd
        }
        const onPointerLeave = () => gateHover(0)
        const onPointerUp = () => { drag.current.active = false }

        host.addEventListener("pointerdown", onPointerDown)
        host.addEventListener("pointermove", onPointerMove)
        host.addEventListener("pointerleave", onPointerLeave)

        window.addEventListener("pointermove", onPointerMove)
        window.addEventListener("pointerup", onPointerUp)

        const raySphereHit = (mx_css, my_css, focal, yaw, totalPitch, camDist, R) => {
            const cy = Math.cos(yaw), sy = Math.sin(yaw)
            const ctp = Math.cos(totalPitch), stp = Math.sin(totalPitch)

            const Ox = -sy * ctp * camDist
            const Oy = stp * camDist
            const Oz = cy * ctp * camDist

            const px = mx_css * dpr - canvas.width / 2
            const py = canvas.height / 2 - my_css * dpr
            const dcx = px / focal
            const dcy = py / focal
            const dcz = -1.0

            let Dx = dcx * cy + dcy * sy * stp + dcz * (-sy * ctp)
            let Dy = dcy * ctp + dcz * stp
            let Dz = dcx * sy + dcy * (-cy * stp) + dcz * (cy * ctp)
            const DLen = Math.sqrt(Dx * Dx + Dy * Dy + Dz * Dz)
            Dx /= DLen; Dy /= DLen; Dz /= DLen

            const OdotD = Ox * Dx + Oy * Dy + Oz * Dz
            const OdotO = Ox * Ox + Oy * Oy + Oz * Oz
            const disc = OdotD * OdotD - (OdotO - R * R)
            if (disc < 0) return null

            const t = -OdotD - Math.sqrt(disc)
            if (t < 0) return null

            const hx = Ox + t * Dx
            const hy = Oy + t * Dy
            const hz = Oz + t * Dz
            const hl = Math.sqrt(hx * hx + hy * hy + hz * hz) || 1
            return [hx / hl, hy / hl, hz / hl]
        }

        let raf = 0
        let last = performance.now()
        let elapsed = 0

        const frame = (now) => {
            raf = requestAnimationFrame(frame)
            const dt = Math.min((now - last) / 1000, 0.05)
            last = now
            elapsed += dt

            if (cssW <= 0 || cssH <= 0) { resize(); return }

            const L = live.current

            if (L.density !== builtDensity) buildBuffers(L.density)
            if (count === 0) return

            const damp = 1 - Math.pow(L.orbitDamping / 100, dt * 10)
            cam.current.yaw += cam.current.yawV * damp
            cam.current.pitch += cam.current.pitchV * damp

            cam.current.yaw = ((cam.current.yaw + Math.PI) % TAU + TAU) % TAU - Math.PI
            cam.current.pitch = ((cam.current.pitch + Math.PI) % TAU + TAU) % TAU - Math.PI
            cam.current.yawV *= (1 - damp * 1.4)
            cam.current.pitchV *= (1 - damp * 1.4)

            const h = hov.current
            h.active = hoverMV.get() * h.miss

            const wDev = canvas.width
            const hDev = canvas.height
            const focal = hDev / (2 * Math.tan((FOV_DEG / 2) * Math.PI / 180))
            const totalPitch = cam.current.pitch + (L.tilt * Math.PI) / 180

            if (h.active > 0.001) {
                const hit = raySphereHit(
                    h.mx, h.my, focal, cam.current.yaw, totalPitch, L.cameraDistance, L.radius
                )
                if (hit) {
                    h.dirX = hit[0]; h.dirY = hit[1]; h.dirZ = hit[2]

                    h.miss = Math.min(1, h.miss / 0.8)
                } else {
                    h.miss *= 0.8
                }
                h.active = hoverMV.get() * h.miss
            }

            const cy = Math.cos(cam.current.yaw), sy = Math.sin(cam.current.yaw)
            const ctp = Math.cos(totalPitch), stp = Math.sin(totalPitch)
            const cdx = -sy * ctp
            const cdy = stp
            const cdz = cy * ctp
            const cdl = Math.sqrt(cdx * cdx + cdy * cdy + cdz * cdz) || 1

            const pal =
                Array.isArray(L.colors) && L.colors.length > 0
                    ? L.colors.slice(0, MAX_COLORS)
                    : DEFAULT_COLORS
            for (let i = 0; i < MAX_COLORS; i++) {
                const [pr, pg, pb] = parseColor(pal[Math.min(i, pal.length - 1)])
                palBuf[i * 3] = pr
                palBuf[i * 3 + 1] = pg
                palBuf[i * 3 + 2] = pb
            }

            const [tr, tg, tb] = parseColor(pal[0])

            const hr = Math.min(1, tr * 0.6 + 0.8)
            const hg = Math.min(1, tg * 0.4 + 0.7)
            const hb = Math.min(1, tb * 0.5 + 0.8)

            const tiltRad = (L.tilt * Math.PI) / 180
            const timeVal = elapsed * (L.waveSpeed / 50)

            gl.clearColor(0, 0, 0, 0)
            gl.clear(gl.COLOR_BUFFER_BIT)

            gl.useProgram(sphereProg)
            gl.uniform2f(sU.res, wDev, hDev)
            gl.uniform1f(sU.focal, focal)
            gl.uniform1f(sU.time, timeVal)
            gl.uniform1f(sU.radius, L.radius)
            gl.uniform1f(sU.waveHeight, L.waveHeight)
            gl.uniform1f(sU.waveLength, L.waveLength)
            gl.uniform1f(sU.waveSpeed, L.waveSpeed)
            const da = (L.waveDirection * Math.PI) / 180
            gl.uniform2f(sU.waveDir, Math.sin(da), Math.cos(da))
            gl.uniform1f(sU.camDist, L.cameraDistance)
            gl.uniform1f(sU.camYaw, cam.current.yaw)
            gl.uniform1f(sU.camPitch, cam.current.pitch)
            gl.uniform1f(sU.tilt, tiltRad)
            gl.uniform1f(sU.rimPow, L.rimPower)
            gl.uniform1f(sU.center, L.center)
            gl.uniform1f(sU.colorCount, pal.length)
            gl.uniform3fv(sU.colors, palBuf)
            gl.uniform3f(sU.hotspot, hr, hg, hb)
            gl.uniform3f(sU.camDir, cdx / cdl, cdy / cdl, cdz / cdl)
            gl.uniform3f(sU.hoverDir, h.dirX, h.dirY, h.dirZ)
            gl.uniform1f(sU.hoverRadius, L.hoverRadius)
            gl.uniform1f(sU.hoverPush, L.hoverPush)
            gl.uniform1f(sU.hoverActive, h.active)

            gl.bindBuffer(gl.ARRAY_BUFFER, polarBuf)
            gl.enableVertexAttribArray(sA.polar)
            gl.vertexAttribPointer(sA.polar, 2, gl.FLOAT, false, 0, 0)
            gl.bindBuffer(gl.ARRAY_BUFFER, rndBuf)
            gl.enableVertexAttribArray(sA.rnd)
            gl.vertexAttribPointer(sA.rnd, 2, gl.FLOAT, false, 0, 0)
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, idxBuf)
            gl.drawElements(gl.LINES, indexCount, gl.UNSIGNED_SHORT, 0)

        }
        raf = requestAnimationFrame(frame)

        return () => {
            cancelAnimationFrame(raf)
            ro.disconnect()
            hoverAnim?.stop()
            host.removeEventListener("pointerdown", onPointerDown)
            host.removeEventListener("pointermove", onPointerMove)
            host.removeEventListener("pointerleave", onPointerLeave)
            window.removeEventListener("pointermove", onPointerMove)
            window.removeEventListener("pointerup", onPointerUp)

        }
    }, [])

    const stops = colors?.length ? colors : DEFAULT_COLORS
    const topGlow = stops[0] + "28"
    const botGlow = stops[stops.length - 1] + "28"

    return (
        <div
            ref={hostRef}
            style={{
                minWidth: 1200,
                minHeight: 800,
                width: "100%",
                height: "100%",
                position: "relative",
                overflow: "hidden",
                background: `radial-gradient(55% 40% at 68% 6%, ${topGlow} 0%, transparent 72%), radial-gradient(50% 38% at 25% 94%, ${botGlow} 0%, transparent 70%), ${background}`,
                cursor: "grab",
                ...style,
            }}
        >
            <canvas
                ref={canvasRef}
                style={{
                    position: "absolute",
                    inset: 0,
                    width: "100%",
                    height: "100%",
                    display: "block",
                }}
            />
        </div>
    )
}
