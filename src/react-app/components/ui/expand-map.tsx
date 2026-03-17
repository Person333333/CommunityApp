"use client"

import type React from "react"
import { useState, useRef } from "react"
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring } from "framer-motion"

interface LocationMapProps {
  location?: string
  coordinates?: string
  className?: string
}

export function LocationMap({
  location = "Location Details",
  coordinates,
  className,
}: LocationMapProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  // Tilt effect
  const rotateX = useTransform(mouseY, [-50, 50], [8, -8])
  const rotateY = useTransform(mouseX, [-50, 50], [-8, 8])

  const springRotateX = useSpring(rotateX, { stiffness: 300, damping: 30 })
  const springRotateY = useSpring(rotateY, { stiffness: 300, damping: 30 })

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    mouseX.set(e.clientX - centerX)
    mouseY.set(e.clientY - centerY)
  }

  const handleMouseLeave = () => {
    mouseX.set(0)
    mouseY.set(0)
    setIsHovered(false)
  }

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsExpanded(!isExpanded)
  }

  return (
    <motion.div
      ref={containerRef}
      className={`relative cursor-pointer select-none w-full ${className}`}
      style={{
        perspective: 1000,
        zIndex: isExpanded ? 50 : 1,
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
    >
      <motion.div
        className="relative overflow-hidden rounded-2xl bg-slate-900 border border-white/10 shadow-2xl w-full"
        style={{
          rotateX: springRotateX,
          rotateY: springRotateY,
          transformStyle: "preserve-3d",
        }}
        animate={{
          height: isExpanded ? 240 : 110,
        }}
        transition={{
          type: "spring",
          stiffness: 400,
          damping: 35,
        }}
      >
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-indigo-500/10" />

        {/* Fake Map Grid Background */}
        <div className="absolute inset-0 opacity-20">
          <svg className="w-full h-full" preserveAspectRatio="none">
            <line x1="0%" y1="35%" x2="100%" y2="35%" className="stroke-blue-400/20" strokeWidth="2" />
            <line x1="0%" y1="65%" x2="100%" y2="65%" className="stroke-blue-400/20" strokeWidth="2" />
            <line x1="30%" y1="0%" x2="30%" y2="100%" className="stroke-blue-500/20" strokeWidth="2" />
            <line x1="70%" y1="0%" x2="70%" y2="100%" className="stroke-blue-500/20" strokeWidth="2" />
          </svg>
        </div>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              className="absolute inset-0 pointer-events-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
            >
              <div className="absolute inset-0 bg-slate-900/40" />
              
              {/* Stylized Blocks */}
              <div className="absolute top-[20%] left-[20%] w-[10%] h-[15%] rounded-sm bg-blue-500/10 border border-blue-500/20" />
              <div className="absolute top-[50%] left-[60%] w-[15%] h-[10%] rounded-sm bg-indigo-500/10 border border-indigo-500/20" />
              
              <motion.div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                initial={{ scale: 0, y: -20 }}
                animate={{ scale: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 400, damping: 20, delay: 0.1 }}
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  className="drop-shadow-[0_0_8px_rgba(96,165,250,0.6)]"
                >
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="#60A5FA" />
                  <circle cx="12" cy="9" r="2.5" fill="#0f172a" />
                </svg>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Content Overlay */}
        <div className="relative z-10 h-full flex flex-col justify-between p-4">
          <div className="flex items-start justify-between">
            <motion.div
              animate={{ opacity: isExpanded ? 0 : 1 }}
              className="text-blue-400"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21" />
              </svg>
            </motion.div>

            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/5 backdrop-blur-sm border border-white/10">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
              <span className="text-[9px] font-black text-slate-400 tracking-widest uppercase">Live View</span>
            </div>
          </div>

          <div className="space-y-1">
            <h3 className="text-white font-black text-[11px] tracking-wider uppercase truncate max-w-full drop-shadow-md">
              {location}
            </h3>

            {coordinates ? (
              <p className="text-slate-400 text-[9px] font-bold font-mono tracking-wider">
                {coordinates}
              </p>
            ) : (
                <div className="h-3" /> // Spacer
            )}

            <motion.div
              className="h-px bg-gradient-to-r from-blue-500/60 via-blue-400/40 to-transparent w-full"
              initial={{ scaleX: 0.3, originX: 0 }}
              animate={{
                scaleX: isHovered || isExpanded ? 1 : 0.4,
              }}
            />
          </div>
        </div>
      </motion.div>

      {/* Expand Hint */}
      <AnimatePresence>
        {isHovered && !isExpanded && (
          <motion.p
            className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[9px] font-black uppercase tracking-[0.2em] text-blue-400 drop-shadow-[0_0_5px_rgba(96,165,250,0.5)]"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
          >
            Expand Map Preview
          </motion.p>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
