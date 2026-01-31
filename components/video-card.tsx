"use client"

import { useState, useRef, useEffect } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface Project {
  id: number
  title: string
  category: string
  year: string
  thumbnail: string
  video: string
  githubUrl?: string
  moreInfoUrl?: string
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

  return (
    <div
      ref={cardRef}
      className={cn(
        "group relative rounded-[2.5rem] overflow-hidden",
        "cursor-none",
        "transition-all duration-[800ms] ease-[cubic-bezier(0.4,0,0.2,1)]",
        "w-full",
        isHovered ? "h-[405px] shadow-2xl shadow-white/10" : "h-[162px] opacity-90",
      )}
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

      {/* Full-width blur gradient overlay */}
      <div
        className={cn(
          "absolute inset-0",
          "transition-all duration-700",
          isHovered ? "opacity-100" : "opacity-0 pointer-events-none",
        )}
      >
        {/* Gradient blur overlay - starts at 40% and covers 40% of height */}
        <div
          className={cn(
            "absolute inset-0 backdrop-blur-xl",
            "bg-black/30",
            "transition-all duration-700 ease-out",
            isHovered ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0",
          )}
          style={{
            maskImage: "linear-gradient(to bottom, transparent 0%, transparent 40%, rgba(0,0,0,0.5) 50%, rgba(0,0,0,0.7) 70%, rgba(0,0,0,1) 80%, rgba(0,0,0,1) 100%)",
            WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, transparent 30%, rgba(0,0,0,0.5) 50%, rgba(0,0,0,0.7) 70%, rgba(0,0,0,1) 80%, rgba(0,0,0,1) 100%)",
          }}
        />
        
        {/* Content overlay at bottom */}
        <div
          className={cn(
            "absolute bottom-0 left-0 right-0 p-8",
            "transition-all duration-700 ease-out",
            isHovered ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0",
          )}
        >
          <div className="space-y-4 text-left">
            <div className="space-y-1">
              <h3 className="text-white font-mono text-sm tracking-[0.3em] uppercase font-medium leading-relaxed">
                {project.title}
              </h3>
              <p className="text-white/80 font-mono text-xs tracking-[0.25em] uppercase leading-relaxed">
                {project.category}
              </p>
              <div className="pt-3 mt-3 border-t border-white/10">
                <p className="text-white/60 font-mono text-xs tracking-widest">{project.year}</p>
              </div>
            </div>
            
            {/* Buttons */}
            <div className="flex gap-3 pt-2">
              {project.githubUrl && (
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white backdrop-blur-sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    window.open(project.githubUrl, '_blank')
                  }}
                >
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                      clipRule="evenodd"
                    />
                  </svg>
                  GitHub
                </Button>
              )}
              {project.moreInfoUrl && (
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white backdrop-blur-sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    window.open(project.moreInfoUrl, '_blank')
                  }}
                >
                  More Info
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
