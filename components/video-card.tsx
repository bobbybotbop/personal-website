"use client"

import { useState, useRef, useEffect } from "react"
import { cn } from "@/lib/utils"
import { Github, Info } from "lucide-react"
import { ProjectActionButton } from "@/components/project-action-button"

interface Project {
  id: number
  year: string
  thumbnail: string
  video: string
  githubUrl?: string
  moreInfoUrl?: string
  projectName?: string
  company?: string
  description?: string
  tech?: string[]
}

interface VideoCardProps {
  project: Project
  isHovered: boolean
  onHoverChange: (hovered: boolean) => void
}

export function VideoCard({ project, isHovered, onHoverChange }: VideoCardProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const cardRef = useRef<HTMLDivElement>(null)
  const [isVideoLoaded, setIsVideoLoaded] = useState(false)
  const [gradientOpacity, setGradientOpacity] = useState(0)

  useEffect(() => {
    if (isHovered && videoRef.current) {
      videoRef.current.currentTime = 0
      videoRef.current.play().catch(() => {})
    } else if (videoRef.current) {
      videoRef.current.pause()
      videoRef.current.currentTime = 0
    }
  }, [isHovered])

  // Set video to first frame when loaded
  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const setFirstFrame = () => {
      video.currentTime = 0
    }

    video.addEventListener('loadedmetadata', setFirstFrame)
    return () => {
      video.removeEventListener('loadedmetadata', setFirstFrame)
    }
  }, [])

  // Track expansion progress for smooth gradient fade-in
  useEffect(() => {
    if (!cardRef.current) return

    const card = cardRef.current
    const minHeight = 162
    const maxHeight = 405
    const heightRange = maxHeight - minHeight

    const updateOpacity = () => {
      const currentHeight = card.offsetHeight
      const progress = Math.max(0, Math.min(1, (currentHeight - minHeight) / heightRange))
      setGradientOpacity(progress)
    }

    // Update opacity continuously during transition
    let animationFrame: number
    const startTime = performance.now()
    const duration = 800 // Match the transition duration

    const animate = () => {
      const elapsed = performance.now() - startTime
      
      // Update based on actual height
      updateOpacity()
      
      // Continue animating until transition completes
      if (elapsed < duration) {
        animationFrame = requestAnimationFrame(animate)
      } else {
        // Final update to ensure we reach target state
        updateOpacity()
      }
    }

    // Start animation when hover state changes
    animationFrame = requestAnimationFrame(animate)

    // Also update on transition end as fallback
    const handleTransitionEnd = () => {
      updateOpacity()
    }
    card.addEventListener('transitionend', handleTransitionEnd)

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame)
      }
      card.removeEventListener('transitionend', handleTransitionEnd)
    }
  }, [isHovered])

  return (
    <div
      ref={cardRef}
      className={cn(
        "group relative rounded-[2.5rem] overflow-hidden",
        "cursor-none",
        "transition-all duration-[800ms] ease-[cubic-bezier(0.4,0,0.2,1)]",
        "w-full",
        isHovered ? "h-[405px]" : "h-[162px] opacity-90",
      )}
      style={isHovered ? {
        boxShadow: "0 25px 50px -12px rgba(255, 255, 255, 0.4), 0 0 60px rgba(255, 255, 255, 0.2), 0 0 100px rgba(255, 255, 255, 0.1)"
      } : undefined}
      onMouseEnter={() => onHoverChange(true)}
      onMouseLeave={() => onHoverChange(false)}
      data-video-card-id={project.id}
    >
      {/* Video with poster - shows first frame as thumbnail */}
      <div className="absolute inset-0">
        <video
          ref={videoRef}
          poster={project.thumbnail || undefined}
          className={cn(
            "w-full h-full object-cover transition-all duration-700",
            !isHovered && "grayscale brightness-75 blur-[2px]",
          )}
          loop
          muted
          playsInline
          preload="metadata"
          onLoadedData={() => {
            setIsVideoLoaded(true)
            if (videoRef.current && !isHovered) {
              videoRef.current.currentTime = 0
            }
          }}
        >
          <source src={project.video} type="video/mp4" />
        </video>
      </div>

      {/* Preview overlay - animates from center to bottom on hover */}
      <div
        className={cn(
          "absolute inset-0 z-10",
          "transition-all duration-700",
        )}
      >
        {/* Gradient blur overlay - covers full card for better text readability */}
        <div
          className={cn(
            "absolute inset-0",
            "bg-black/50",
            !isHovered ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0",
          )}
        />
        
        {/* Content overlay - sticky to bottom during expansion */}
        <div
          className={cn(
            "absolute left-0 right-0 flex flex-col h-[162px] ",
            "bottom-0 px-8",
            "transition-all duration-[800ms] ease-[cubic-bezier(0.4,0,0.2,1)]",
            isHovered && "pl-8 pb-5",
          )}
        >
          <div className="my-auto h-fit">
          {/* Year at top */}
          {project.year && (
            <div className="text-white/60 font-mono text-xs tracking-widest uppercase pb-1">
              {project.year}
            </div>
          )}
          
          {/* Main content */}
          <div className="text-left space-y-4">
            {/* Project Name and Company */}
            <div className="space-y-3">
              {project.projectName && (
                <h3 className="text-white font-mono text-lg sm:text-xl uppercase font-medium leading-tight">
                  {project.projectName}
                </h3>
              )}
              {project.company && (
                <div className="flex items-center gap-4 flex-wrap">
                  <p className="text-white/80 font-mono text-sm tracking-[0.15em] uppercase leading-relaxed">
                    {project.company}
                  </p>
                  {/* Tech stack - only visible on hover */}
                  {isHovered && project.tech && project.tech.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {project.tech.map((tech, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 text-xs text-white/80 bg-white/10 border border-white/20 rounded-full backdrop-blur-sm"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
            
            {/* Description with buttons */}
            {project.description && (
              <div className="flex items-start space-between gap-6 w-full">
                <p className="text-white/70 text-sm leading-tight flex-[0_0_70%]">
                  {project.description}
                </p>
                <div className="flex items-center justify-end gap-3 flex-[0_0_30%] relative z-20 pr-4">
                  <ProjectActionButton
                    icon={<Github className="size-5" />}
                    url={project.githubUrl}
                    expanded={isHovered}
                  />
                  {/* <ProjectActionButton
                    icon={<Info className="size-5" />}
                    url={project.moreInfoUrl}
                    expanded={isHovered}
                  /> */}
                </div>
              </div>
            )}
            </div>
          </div>
        </div>
      </div>

      {/* Full-width blur gradient overlay - fades in gradually as card expands */}
      <div
        className={cn(
          "absolute inset-0 z-0",
          gradientOpacity === 0 && "pointer-events-none",
        )}
        style={{
          opacity: gradientOpacity,
          transition: 'opacity 50ms ease-out',
        }}
      >
        {/* Gradient overlay - starts at 40% and covers 40% of height */}
        <div
          className={cn(
            "absolute inset-0",
            "bg-black/30",
            "transition-transform duration-[800ms] ease-[cubic-bezier(0.4,0,0.2,1)]",
            isHovered ? "translate-y-0" : "translate-y-8",
          )}
          style={{
            maskImage: "linear-gradient(to bottom, transparent 0%, transparent 40%, rgba(0,0,0,0.5) 50%, rgba(0,0,0,0.7) 70%, rgba(0,0,0,1) 80%, rgba(0,0,0,1) 100%)",
            WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, transparent 30%, rgba(0,0,0,0.5) 50%, rgba(0,0,0,0.7) 70%, rgba(0,0,0,1) 80%, rgba(0,0,0,1) 100%)",
          }}
        />
      </div>
    </div>
  )
}
