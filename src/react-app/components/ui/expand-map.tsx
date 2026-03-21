"use client"

import type React from "react"
import { useState, useRef } from "react"
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring } from "framer-motion"
import { MapContainer, TileLayer, Marker } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix default leaflet icons for dynamic imports
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface LocationMapProps {
  location?: string
  lat?: number
  lng?: number
  coordinates?: string
  className?: string
}

export function LocationMap({
  location = "Location Details",
  lat,
  lng,
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

        {/* Real Embedded Map */}
        <div className={`absolute inset-0 overflow-hidden ${isExpanded ? '' : 'pointer-events-none'}`}>
          {lat !== undefined && lng !== undefined ? (
            <MapContainer
              center={[lat, lng]}
              zoom={15}
              style={{ height: '100%', width: '100%', filter: 'invert(90%) hue-rotate(180deg) opacity(0.8)' }}
              zoomControl={false}
              dragging={isExpanded}
              scrollWheelZoom={isExpanded}
              doubleClickZoom={isExpanded}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; OpenStreetMap contributors'
              />
              <Marker position={[lat, lng]} />
            </MapContainer>
          ) : location && (
            <iframe
              width="100%"
              height="100%"
              style={{ border: 0, filter: 'invert(90%) hue-rotate(180deg) opacity(0.8)' }}
              loading="lazy"
              allowFullScreen
              src={`https://maps.google.com/maps?q=${encodeURIComponent(location)}&t=&z=13&ie=UTF8&iwloc=&output=embed`}
            />
          )}
        </div>

        {/* Click Catcher & Gradient Overlay */}
        <div 
          onClick={handleClick}
          className={`absolute inset-0 z-20 cursor-pointer flex justify-center pb-8 items-end bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent transition-opacity duration-300 ${isExpanded ? 'opacity-0 pointer-events-none' : 'opacity-100'}`} 
        >
          <div className="px-4 py-2 mt-4 rounded-full bg-slate-900/80 backdrop-blur border border-white/20 text-white text-[10px] font-black tracking-widest uppercase shadow-xl hover:bg-emerald-500 hover:text-black transition-colors">
            Click to Expand Map
          </div>
        </div>

        {/* Content Overlay */}
        <div className={`relative z-10 h-full flex flex-col justify-between p-4 pointer-events-none transition-opacity duration-300 ${isExpanded ? 'opacity-0' : 'opacity-100'}`}>
          <div className="flex items-start justify-between">
            <div className="text-emerald-400">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21" />
              </svg>
            </div>

            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-900/50 backdrop-blur-sm border border-white/10">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[9px] font-black text-slate-300 tracking-widest uppercase">Live View</span>
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
              className="h-px bg-gradient-to-r from-emerald-500/60 via-emerald-400/40 to-transparent w-full"
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
            className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[9px] font-black uppercase tracking-[0.2em] text-emerald-400 drop-shadow-[0_0_5px_rgba(16,185,129,0.5)] whitespace-nowrap"
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
