"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";
import { Github, Play, Pause, RotateCcw, RotateCw, X } from "lucide-react";
import { ProjectActionButton } from "@/components/project-action-button";

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

interface Project {
  id: number;
  year: string;
  thumbnail: string;
  video: string;
  githubUrl?: string;
  moreInfoUrl?: string;
  projectName?: string;
  company?: string;
  shortDescription?: string;
  fullDescription?: string;
  tech?: string[];
}

interface VideoCardProps {
  project: Project;
  isHovered: boolean;
  isExpanded: boolean;
  onHoverChange: (hovered: boolean) => void;
  onExpandToggle: () => void;
}

const EASE = "cubic-bezier(0.4,0,0.2,1)";
const DURATION = 800;

export function VideoCard({
  project,
  isHovered,
  isExpanded,
  onHoverChange,
  onExpandToggle,
}: VideoCardProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const isManuallyPausedRef = useRef(false);
  const [shouldLoadVideo, setShouldLoadVideo] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  const [originRect, setOriginRect] = useState<DOMRect | null>(null);
  const [animatingIn, setAnimatingIn] = useState(false);
  const [showExpanded, setShowExpanded] = useState(false);

  const togglePlayPause = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      isManuallyPausedRef.current = false;
      video.play().catch(() => {});
      setIsPlaying(true);
    } else {
      isManuallyPausedRef.current = true;
      video.pause();
      setIsPlaying(false);
    }
  }, []);

  const skip = useCallback((seconds: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = Math.max(0, Math.min(video.duration || 0, video.currentTime + seconds));
  }, []);

  const handleScrub = useCallback((value: number) => {
    const video = videoRef.current;
    if (!video || !Number.isFinite(video.duration)) return;
    video.currentTime = value * video.duration;
  }, []);

  useEffect(() => {
    if (isHovered || isExpanded) {
      setShouldLoadVideo(true);
    }
  }, [isHovered, isExpanded]);

  useEffect(() => {
    if ((isHovered || isExpanded) && videoRef.current && shouldLoadVideo) {
      isManuallyPausedRef.current = false;
      const timer = setTimeout(() => {
        if (videoRef.current && !isManuallyPausedRef.current) {
          videoRef.current.currentTime = 0;
          videoRef.current.play().catch(() => {});
          setIsPlaying(true);
        }
      }, 100);
      return () => clearTimeout(timer);
    } else if (videoRef.current && !isHovered && !isExpanded) {
      isManuallyPausedRef.current = false;
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
      setIsPlaying(false);
    }
  }, [isHovered, isExpanded, shouldLoadVideo]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !shouldLoadVideo) return;

    const onTimeUpdate = () => {
      const dur = video.duration;
      const curr = video.currentTime;
      if (Number.isFinite(dur) && dur > 0) {
        setProgress(curr / dur);
      }
      setCurrentTime(curr);
    };

    const onLoadedMetadata = () => {
      if (Number.isFinite(video.duration)) {
        setDuration(video.duration);
      }
    };

    video.addEventListener("timeupdate", onTimeUpdate);
    video.addEventListener("loadedmetadata", onLoadedMetadata);
    if (video.readyState >= 1) onLoadedMetadata();

    return () => {
      video.removeEventListener("timeupdate", onTimeUpdate);
      video.removeEventListener("loadedmetadata", onLoadedMetadata);
    };
  }, [shouldLoadVideo]);

  useEffect(() => {
    if (!isHovered && !isExpanded) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (isExpanded && e.key === "Escape") {
        e.preventDefault();
        onExpandToggle();
        return;
      }
      if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
      e.preventDefault();
      if (e.key === "ArrowLeft") skip(-5);
      else skip(5);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isHovered, isExpanded, skip, onExpandToggle]);

  // FLIP: capture origin rect and trigger expand animation
  useEffect(() => {
    if (isExpanded) {
      const rect = cardRef.current?.getBoundingClientRect();
      if (rect) {
        setOriginRect(rect);
        setAnimatingIn(true);
        setShowExpanded(true);
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            setAnimatingIn(false);
          });
        });
      }
    } else {
      setAnimatingIn(true);
      const timer = setTimeout(() => {
        setShowExpanded(false);
        setOriginRect(null);
        setAnimatingIn(false);
      }, DURATION);
      return () => clearTimeout(timer);
    }
  }, [isExpanded]);

  const handleCardClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest("[data-video-controls]")) return;
    if ((e.target as HTMLElement).closest("button")) return;
    if ((e.target as HTMLElement).closest("a")) return;
    onExpandToggle();
  };

  const isActive = isHovered || isExpanded;

  const videoControls = isActive && (
    <div
      data-video-controls
      className="absolute bottom-0 left-0 right-0 z-20 flex items-center gap-2 px-4 py-1.5 bg-black/50 backdrop-blur-sm cursor-pointer transition-opacity duration-300"
      onClick={(e) => e.stopPropagation()}
      onMouseEnter={(e) => e.stopPropagation()}
      onMouseLeave={(e) => e.stopPropagation()}
    >
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); skip(-5); }}
        className="p-2 rounded-full text-white/90 hover:text-white hover:bg-white/10 transition-colors"
        aria-label="Back 5 seconds"
      >
        <RotateCcw className="size-4" />
      </button>
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); togglePlayPause(); }}
        className="p-2 rounded-full text-white/90 hover:text-white hover:bg-white/10 transition-colors"
        aria-label={isPlaying ? "Pause" : "Play"}
      >
        {isPlaying ? <Pause className="size-4" /> : <Play className="size-4" />}
      </button>
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); skip(5); }}
        className="p-2 rounded-full text-white/90 hover:text-white hover:bg-white/10 transition-colors"
        aria-label="Forward 5 seconds"
      >
        <RotateCw className="size-4" />
      </button>
      <div className="flex-1 flex items-center gap-3 min-w-0">
        <input
          type="range"
          min={0}
          max={1}
          step={0.001}
          value={progress}
          onChange={(e) => handleScrub(parseFloat(e.target.value))}
          className="flex-1 h-1.5 bg-white/30 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:cursor-pointer"
        />
        <span className="text-xs text-white/90 font-mono tabular-nums shrink-0">
          {formatTime(currentTime)} / {formatTime(duration)}
        </span>
      </div>
    </div>
  );

  const infoPanel = (expanded: boolean) => (
    <div className={cn("relative px-8 flex flex-col justify-center py-5", expanded ? "min-h-0" : "min-h-[162px]")}>
      {project.year && (
        <div className="font-mono text-xs tracking-widest uppercase pb-1 text-muted-foreground">
          {project.year}
        </div>
      )}

      <div className="space-y-3">
        {project.projectName && (
          <h3 className={cn(
            "font-mono uppercase font-medium leading-tight text-foreground",
            expanded ? "text-xl sm:text-2xl" : "text-lg sm:text-xl",
          )}>
            {project.projectName}
          </h3>
        )}
        {project.company && (
          <div className="flex items-center gap-4 flex-wrap">
            <p className="font-mono text-sm tracking-[0.15em] uppercase leading-relaxed text-muted-foreground">
              {project.company}
            </p>
            {project.tech && project.tech.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {project.tech.map((tech, index) => (
                  <span
                    key={index}
                    className="rounded-full border border-border bg-secondary px-2 py-1 text-xs text-muted-foreground"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {expanded && project.fullDescription ? (
        <div className="flex items-start justify-between gap-6 pt-4">
          <p className="flex-1 text-sm leading-relaxed text-muted-foreground">
            {project.fullDescription}
          </p>
          <div className="flex shrink-0 items-center gap-3 pr-4">
            <ProjectActionButton
              icon={<Github className="size-5" />}
              url={project.githubUrl}
              expanded
            />
          </div>
        </div>
      ) : (
        project.shortDescription && (
          <div className="flex items-start justify-between gap-6 pt-4">
            <p className={cn(
              "flex-[0_0_70%] text-sm leading-tight transition-colors duration-[800ms]",
              isHovered ? "text-muted-foreground" : "text-white/70 line-clamp-2 md:line-clamp-none",
            )}>
              {project.shortDescription}
            </p>
            <div className="flex flex-[0_0_30%] items-center justify-end gap-3 pr-4">
              <ProjectActionButton
                icon={<Github className="size-5" />}
                url={project.githubUrl}
                expanded={isHovered}
              />
            </div>
          </div>
        )
      )}
    </div>
  );

  // Compute expanded overlay style with FLIP animation
  const expandedStyle = (): React.CSSProperties => {
    const vw = typeof window !== "undefined" ? window.innerWidth : 1200;
    const vh = typeof window !== "undefined" ? window.innerHeight : 800;

    const targetLeft = vw * 0.1;
    const targetWidth = vw * 0.8;
    const targetTop = vh * 0.05;
    const targetMaxHeight = vh * 0.9;

    if (animatingIn && isExpanded && originRect) {
      return {
        position: "fixed",
        top: originRect.top,
        left: originRect.left,
        width: originRect.width,
        maxHeight: originRect.height,
        zIndex: 60,
        transition: `all ${DURATION}ms ${EASE}`,
        overflow: "hidden",
        borderRadius: "2.5rem",
      };
    }

    if (!isExpanded && animatingIn && originRect) {
      return {
        position: "fixed",
        top: originRect.top,
        left: originRect.left,
        width: originRect.width,
        maxHeight: originRect.height,
        zIndex: 60,
        transition: `all ${DURATION}ms ${EASE}`,
        overflow: "hidden",
        borderRadius: "2.5rem",
      };
    }

    return {
      position: "fixed",
      top: targetTop,
      left: targetLeft,
      width: targetWidth,
      maxHeight: targetMaxHeight,
      zIndex: 60,
      transition: `all ${DURATION}ms ${EASE}`,
      overflowY: "auto",
      borderRadius: "2.5rem",
    };
  };

  const expandedOverlay = showExpanded
    ? createPortal(
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-50"
            style={{
              backgroundColor: `rgba(0,0,0,${isExpanded && !animatingIn ? 0.6 : 0})`,
              transition: `background-color ${DURATION}ms ${EASE}`,
            }}
            onClick={onExpandToggle}
          />
          {/* Expanded card */}
          <div
            style={expandedStyle()}
            className="bg-background shadow-2xl"
          >
            {/* Close button */}
            <button
              type="button"
              onClick={onExpandToggle}
              className="absolute top-4 right-4 z-30 p-2 rounded-full bg-black/50 text-white/90 hover:text-white hover:bg-black/70 transition-colors backdrop-blur-sm"
              aria-label="Close expanded view"
            >
              <X className="size-5" />
            </button>

            {/* Video region */}
            <div className="relative w-full overflow-hidden" style={{ height: "clamp(300px, 50vh, 600px)" }}>
              {shouldLoadVideo ? (
                <>
                  <video
                    ref={isExpanded ? videoRef : undefined}
                    poster={project.thumbnail || undefined}
                    className="absolute inset-0 h-full w-full object-cover"
                    loop
                    muted
                    playsInline
                    preload="metadata"
                  >
                    <source src={project.video} type="video/mp4" />
                  </video>
                  {videoControls}
                </>
              ) : (
                <img
                  src={project.thumbnail || "/placeholder-user.jpg"}
                  alt={project.projectName || "Project thumbnail"}
                  className="absolute inset-0 h-full w-full object-cover"
                />
              )}
            </div>

            {/* Info panel */}
            <div className="bg-background border-t border-border rounded-b-[2.5rem]">
              {infoPanel(true)}
            </div>
          </div>
        </>,
        document.body,
      )
    : null;

  return (
    <>
      <div
        ref={cardRef}
        className={cn(
          "group relative rounded-[2.5rem] overflow-hidden",
          "cursor-none",
          "w-full",
          "will-change-transform",
          !isActive && "opacity-90",
          showExpanded && "invisible",
        )}
        style={{
          transition: `opacity ${DURATION}ms ${EASE}, box-shadow ${DURATION}ms ${EASE}`,
          boxShadow: isActive
            ? "0 25px 50px -12px rgba(255, 255, 255, 0.4), 0 0 60px rgba(255, 255, 255, 0.2), 0 0 100px rgba(255, 255, 255, 0.1)"
            : undefined,
        }}
        onMouseEnter={() => onHoverChange(true)}
        onMouseLeave={() => { if (!isExpanded) onHoverChange(false); }}
        onClick={handleCardClick}
        data-video-card-id={project.id}
      >
        {/* Video region */}
        <div
          className={cn(
            "relative w-full overflow-hidden transition-[height] duration-[800ms] ease-[cubic-bezier(0.4,0,0.2,1)]",
            isHovered ? "h-[445px]" : "h-[202px]",
          )}
        >
          {shouldLoadVideo ? (
            <>
              <video
                ref={!showExpanded ? videoRef : undefined}
                poster={project.thumbnail || undefined}
                className={cn(
                  "absolute inset-0 h-full w-full object-cover transition-all duration-700",
                  !isActive && "grayscale brightness-75",
                )}
                loop
                muted
                playsInline
                preload="metadata"
              >
                <source src={project.video} type="video/mp4" />
              </video>
              {!showExpanded && videoControls}
            </>
          ) : (
            <img
              src={project.thumbnail || "/placeholder-user.jpg"}
              alt={project.projectName || "Project thumbnail"}
              className={cn(
                "absolute inset-0 h-full w-full object-cover transition-all duration-700",
                !isActive && "grayscale brightness-75",
              )}
            />
          )}
        </div>

        {/* Content block */}
        <div
          className={cn(
            "relative z-10 overflow-hidden transition-[margin-top] duration-[800ms] ease-[cubic-bezier(0.4,0,0.2,1)]",
            isHovered ? "mt-0" : "-mt-[202px]",
          )}
        >
          <div
            className={cn(
              "absolute inset-0 bg-background border-t border-border rounded-b-[2.5rem] transition-opacity duration-0",
              isHovered ? "opacity-100 delay-[800ms]" : "opacity-0 delay-0",
            )}
          />

          <div className="relative px-8 flex flex-col justify-center min-h-[162px] py-5">
            {project.year && (
              <div
                className={cn(
                  "font-mono text-xs tracking-widest uppercase pb-1 transition-colors duration-[800ms]",
                  isHovered ? "text-muted-foreground" : "text-white/60",
                )}
              >
                {project.year}
              </div>
            )}

            <div className="space-y-3">
              {project.projectName && (
                <h3
                  className={cn(
                    "font-mono text-lg sm:text-xl uppercase font-medium leading-tight transition-colors duration-[800ms]",
                    isHovered ? "text-foreground" : "text-white",
                  )}
                >
                  {project.projectName}
                </h3>
              )}
              {project.company && (
                <div className="flex items-center gap-4 flex-wrap">
                  <p
                    className={cn(
                      "font-mono text-sm tracking-[0.15em] uppercase leading-relaxed transition-colors duration-[800ms]",
                      isHovered ? "text-muted-foreground" : "text-white/80",
                    )}
                  >
                    {project.company}
                  </p>
                  {isHovered && project.tech && project.tech.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {project.tech.map((tech, index) => (
                        <span
                          key={index}
                          className="rounded-full border border-border bg-secondary px-2 py-1 text-xs text-muted-foreground"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {project.shortDescription && (
              <div className="flex items-start justify-between gap-6 pt-4">
                <p
                  className={cn(
                    "flex-[0_0_70%] text-sm leading-tight transition-colors duration-[800ms]",
                    isHovered
                      ? "text-muted-foreground"
                      : "text-white/70 line-clamp-2 md:line-clamp-none",
                  )}
                >
                  {project.shortDescription}
                </p>
                <div className="flex flex-[0_0_30%] items-center justify-end gap-3 pr-4">
                  <ProjectActionButton
                    icon={<Github className="size-5" />}
                    url={project.githubUrl}
                    expanded={isHovered}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {expandedOverlay}
    </>
  );
}
