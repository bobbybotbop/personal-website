"use client"

import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import { VideoCard } from "@/components/video-card"
import { CustomCursor } from "@/components/custom-cursor"

export default function Home() {
  const [isDark, setIsDark] = useState(true)
  const [activeSection, setActiveSection] = useState("")
  const sectionsRef = useRef<(HTMLElement | null)[]>([])
  const [hoveredId, setHoveredId] = useState<number | null>(null)
  const mousePositionRef = useRef({ x: 0, y: 0 })

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark)
  }, [isDark])

  // Track mouse position and check hover on move/scroll (throttled for performance)
  useEffect(() => {
    let rafId: number | null = null
    let pendingCheck = false

    const checkHoveredCard = () => {
      const element = document.elementFromPoint(
        mousePositionRef.current.x,
        mousePositionRef.current.y
      )
      
      if (element) {
        // Find the video card element (might be nested)
        const videoCard = element.closest('[data-video-card-id]') as HTMLElement
        if (videoCard) {
          const cardId = parseInt(videoCard.getAttribute('data-video-card-id') || '0')
          if (cardId > 0) {
            setHoveredId(cardId)
            pendingCheck = false
            return
          }
        }
      }
      
      // If no card is under cursor, clear hover state
      setHoveredId(null)
      pendingCheck = false
    }

    const throttledCheck = () => {
      if (!pendingCheck) {
        pendingCheck = true
        rafId = requestAnimationFrame(() => {
          checkHoveredCard()
          rafId = null
        })
      }
    }

    const handleMouseMove = (e: MouseEvent) => {
      mousePositionRef.current = { x: e.clientX, y: e.clientY }
      throttledCheck()
    }

    const handleScroll = () => {
      throttledCheck()
    }

    window.addEventListener("mousemove", handleMouseMove, { passive: true })
    window.addEventListener("scroll", handleScroll, { passive: true })
    
    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("scroll", handleScroll)
      if (rafId !== null) {
        cancelAnimationFrame(rafId)
      }
    }
  }, [])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.remove("opacity-0")
            entry.target.classList.add("animate-fade-in-up")
            // Map "test" section to "work" for navigation consistency
            const sectionId = entry.target.id === "test" ? "work" : entry.target.id
            setActiveSection(sectionId)
          }
        })
      },
      { threshold: 0.1, rootMargin: "0px 0px -10% 0px" },
    )

    // Use setTimeout to ensure refs are set after render
    const timeoutId = setTimeout(() => {
      sectionsRef.current.forEach((section) => {
        if (section) {
          observer.observe(section)
          // Check if section is already in viewport
          const rect = section.getBoundingClientRect()
          const isInViewport = rect.top < window.innerHeight && rect.bottom > 0
          if (isInViewport) {
            section.classList.remove("opacity-0")
            section.classList.add("animate-fade-in-up")
          }
        }
      })
    }, 0)

    return () => {
      clearTimeout(timeoutId)
      observer.disconnect()
    }
  }, [])

  const toggleTheme = () => {
    setIsDark(!isDark)
  }

  return (
    <div className="min-h-screen bg-background text-foreground relative">
      <CustomCursor isActive={hoveredId !== null} />
      <nav className="fixed left-8 top-1/2 -translate-y-1/2 z-10 hidden lg:block">
        <div className="flex flex-col gap-4">
          {["intro", "work", "connect"].map((section) => (
            <button
              key={section}
              onClick={() => {
                const targetId = section === "work" ? "test" : section
                document.getElementById(targetId)?.scrollIntoView({ behavior: "smooth" })
              }}
              className={`w-2 h-8 rounded-full transition-all duration-500 ${
                activeSection === section || (section === "work" && activeSection === "test") ? "bg-foreground" : "bg-muted-foreground/30 hover:bg-muted-foreground/60"
              }`}
              aria-label={`Navigate to ${section}`}
            />
          ))}
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-16">
        <header
          id="intro"
          ref={(el) => {
            sectionsRef.current[0] = el
          }}
          className="min-h-screen flex items-center opacity-0"
        >
          <div className="grid lg:grid-cols-5 gap-12 sm:gap-16 w-full">
            <div className="lg:col-span-3 space-y-6 sm:space-y-8">
              <div className="space-y-3 sm:space-y-2">
                <div className="text-sm text-muted-foreground font-mono tracking-wider">PORTFOLIO / 2026</div>
                <h1 className="text-5xl sm:text-6xl lg:text-7xl font-light tracking-tight">
                  William
                  <br />
                  <span className="text-muted-foreground">Chen</span>
                </h1>
              </div>

              <div className="space-y-6 max-w-md">
                <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed">
                Passionate  <span className="text-foreground"> full-stack</span> web developer with a creative edge, bringing ideas with  <span className="text-foreground"> software engineering.</span>

                </p>

                <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    Available for work
                  </div>
                  <div>New York, New York</div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-2 flex flex-col justify-end space-y-6 sm:space-y-8 mt-8 lg:mt-0">
              <div className="space-y-4">
                <div className="text-sm text-muted-foreground font-mono">CURRENTLY</div>
                <div className="space-y-2">
                  <div className="text-foreground">Student</div>
                  <div className="text-muted-foreground">@ Cornell University</div>
                  <div className="text-xs text-muted-foreground">Graduating 2027</div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="text-sm text-muted-foreground font-mono">FOCUS</div>
                <div className="flex flex-wrap gap-2">
                  {["Typescript", "React", "Python", "API Integration", "Database Integration"].map((skill) => (
                    <span
                      key={skill}
                      className="px-3 py-1 text-xs border border-border rounded-full hover:border-muted-foreground/50 transition-colors duration-300"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </header>

        <section
          id="test"
          ref={(el) => {
            sectionsRef.current[1] = el
          }}
          className="min-h-screen py-20 sm:py-32 opacity-0"
        >
          <div className="space-y-12 sm:space-y-16">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
              <h2 className="text-3xl sm:text-4xl font-light">Previous Experience</h2>
              <div className="text-sm text-muted-foreground font-mono">2025 — 2026</div>
            </div>

            <div className="w-full">
              <div className="flex flex-col gap-4">
                {[
                  {
                    id: 1,
                    year: "2026",
                    projectName: "AXIS RESEARCHER",
                    company: "Personal Project",
                    description: "End to End eBay AI automation pipeline that researches, generates titles, descriptions and photos, and autonomously lists products.",
                    thumbnail: "/placeholder-user.jpg",
                    video: "/videos/AxisEdited.mp4",
                    githubUrl: "https://github.com/bobbybotbop/AxisResearcher",
                    tech: ["Python", "eBay API", "AI", "Automation", "Image Generation"],
                  },
                  {
                    id: 2,
                    year: "2025",
                    projectName: "AnyCard",
                    company: "Cornell DTI Trends Final Project",
                    description: "Full-stack platform w/ AI-generated trading cards via Claude API, Three.js 3D pack animations, image search integration & trading.",
                    thumbnail: "/placeholder-user.jpg",
                    video: "/videos/AnyCardEdited.mp4",
                    githubUrl: "https://github.com/bobbybotbop/AnyCard",
                    tech: ["React", "Three.js", "Claude API", "Node.js", "Full-stack"],
                  },
                  {
                    id: 3,
                    year: "2025",
                    projectName: "Memory Box",
                    company: "Hawl Technologies Intern",
                    description: "Full-stack Chrome extension aggregating multi-platform LLM conversations with semantic search, hallucination detection & cloud sync.",
                    thumbnail: "/placeholder-user.jpg",
                    video: "/videos/memoryboxEdited.mp4",
                    githubUrl: "",
                    tech: ["Chrome Extension", "TypeScript", "LLM", "Semantic Search", "Cloud Sync"],
                  },
                  {
                    id: 4,
                    year: "2025",
                    projectName: "BOND BUDDY",
                    company: "Personal Project",
                    description: "Desktop pet app built with Electron & React featuring draggable UI, tray integration, and custom image/GIF support.",
                    thumbnail: "/placeholder-user.jpg",
                    video: "/videos/bondBuddyEdited.mp4",
                    githubUrl: "https://github.com/bobbybotbop/BondBuddy",
                    tech: ["Electron", "React", "TypeScript", "Desktop App"],
                  },
                  {
                    id: 5,
                    year: "2025",
                    projectName: "DataVision",
                    company: "Bitcamp Hackathon Project",
                    description: "Agentic data platform using LangGraph + Gemini API for automated statistical analysis, hypothesis testing & real-time visualization.",
                    thumbnail: "/placeholder-user.jpg",
                    video: "/videos/dataVisionEdited.mp4",
                    githubUrl: "https://github.com/aadia1234/DataVision",
                    tech: ["Python", "LangGraph", "Gemini API", "Data Visualization", "Statistics"],
                  },
                  {
                    id: 6,
                    year: "2025",
                    projectName: "CORNELL HOBBYSWAP",
                    company: "Personal Project",
                    description: "Full-stack social platform with recommendation algorithms, user profiles, and real-time messaging for skill exchange.",
                    thumbnail: "/placeholder-user.jpg",
                    video: "/videos/hobbyswapEdited.mp4",
                    githubUrl: "https://github.com/bobbybotbop/HobbySwap",
                    tech: ["React", "Node.js", "WebSocket", "Database", "Recommendation Algorithms"],
                  },
                  {
                    id: 7,
                    year: "2025",
                    projectName: "PRETTIER DESKTOP TASK MANAGER",
                    company: "Personal Project",
                    description: "System monitoring desktop app with real-time metrics visualization and animated UI inspired by Windows Task Manager.",
                    thumbnail: "/placeholder-user.jpg",
                    video: "/videos/taskmanageredited.mp4",
                    githubUrl: "https://github.com/bobbybotbop/SystemVisualizer",
                    tech: ["Electron", "React", "System Monitoring", "Data Visualization"],
                  },
                  {
                    id: 8,
                    year: "2025",
                    projectName: "MOVIE VIEWER",
                    company: "Personal Project",
                    description: "React application with TMDb API integration featuring real-time data fetching and full-text search functionality.",
                    thumbnail: "/placeholder-user.jpg",
                    video: "/videos/movieEdited.mp4",
                    githubUrl: "https://github.com/bobbybotbop/movieProjectJS",
                    tech: ["React", "TMDb API", "JavaScript", "API Integration"],
                  },
                ].map((project) => (
                  <VideoCard
                    key={project.id}
                    project={project}
                    isHovered={hoveredId === project.id}
                    onHoverChange={(hovered) => setHoveredId(hovered ? project.id : null)}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="connect" ref={(el) => {
          sectionsRef.current[2] = el
        }} className="py-10 sm:py-10 opacity-0">
          <div className="grid lg:grid-cols-2 gap-12 sm:gap-16">
            <div className="space-y-6 sm:space-y-8">
              <h2 className="text-3xl sm:text-4xl font-light">Let's Connect</h2>

              <div className="space-y-6">
                <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed">
                  Always interested in new opportunities, collaborations, and conversations about technology and design.
                </p>

                <div className="space-y-4">
                  <Link
                    href="mailto:williambillychen@gmail.com"
                    className="group flex items-center gap-3 text-foreground hover:text-muted-foreground transition-colors duration-300"
                  >
                    <span className="text-base sm:text-lg">williambillychen@gmail.com</span>
                    <svg
                      className="w-5 h-5 transform group-hover:translate-x-1 transition-transform duration-300"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>

            <div className="space-y-6 sm:space-y-8">
              <div className="text-sm text-muted-foreground font-mono">ELSEWHERE</div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { name: "GitHub", handle: "@bobbybotbop", url: "https://github.com/bobbybotbop" },
                  { name: "LinkedIn", handle: "williamchenchen", url: "https://www.linkedin.com/in/williamchenchen/" },
                ].map((social) => (
                  <Link
                    key={social.name}
                    href={social.url}
                    className="group p-4 border border-border rounded-lg hover:border-muted-foreground/50 transition-all duration-300 glow-on-hover"
                  >
                    <div className="space-y-2">
                      <div className="text-foreground group-hover:text-muted-foreground transition-colors duration-300">
                        {social.name}
                      </div>
                      <div className="text-sm text-muted-foreground">{social.handle}</div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>

        <footer className=" border-t border-border">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 sm:gap-8 pt-5 pb-30">
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">William Chen</div>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={toggleTheme}
                className="group p-3 rounded-lg border border-border hover:border-muted-foreground/50 transition-all duration-300"
                aria-label="Toggle theme"
              >
                {isDark ? (
                  <svg
                    className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors duration-300"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  <svg
                    className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors duration-300"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </footer>
      </main>

      <div className="fixed bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background via-background/80 to-transparent pointer-events-none"></div>
    </div>
  )
}
