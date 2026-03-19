import { useRef } from 'react';
import { motion, useInView } from 'motion/react';

const FadeIn = ({ children, className = "" }) => {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 60 }} animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 60 }} transition={{ duration: 0.8, ease: "easeOut" }} className={className}>
      {children}
    </motion.div>
  )
}

export default FadeIn;
