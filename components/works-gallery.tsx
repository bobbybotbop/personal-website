"use client"

import { useState } from "react"
import { VideoCard } from "./video-card"

const projects = [
  {
    id: 1,
    title: "FASHION STUDIO",
    category: "BRANDING",
    year: "2024",
    thumbnail: "/fashion-model-black-and-white.jpg",
    video: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
  },
  {
    id: 2,
    title: "ARCHITECTURE FIRM",
    category: "DESIGN",
    year: "2024",
    thumbnail: "/modern-architecture-black-and-white.jpg",
    video: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
  },
  {
    id: 3,
    title: "PRODUCT LAUNCH",
    category: "CREATIVE",
    year: "2024",
    thumbnail: "/product-design-minimalist-black-and-white.jpg",
    video: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
  },
  {
    id: 4,
    title: "STUDIO VALE",
    category: "MARKETING",
    year: "2024",
    thumbnail: "/red-lips-artistic-closeup.jpg",
    video: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
  },
  {
    id: 5,
    title: "AUTOMOTIVE",
    category: "COMMERCIAL",
    year: "2024",
    thumbnail: "/luxury-car-black-and-white.jpg",
    video: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4",
  },
]

interface WorksGalleryProps {
  onHoverChange?: (hoveredId: number | null) => void
}

export function WorksGallery({ onHoverChange }: WorksGalleryProps) {
  const [hoveredId, setHoveredId] = useState<number | null>(null)

  const handleHoverChange = (hovered: boolean, projectId: number) => {
    const newHoveredId = hovered ? projectId : null
    setHoveredId(newHoveredId)
    onHoverChange?.(newHoveredId)
  }

  return (
    <div className="container mx-auto px-6">
        <div className="flex flex-col gap-4">
          {projects.map((project) => (
            <VideoCard
              key={project.id}
              project={project}
              isHovered={hoveredId === project.id}
              onHoverChange={(hovered) => handleHoverChange(hovered, project.id)}
            />
          ))}
        </div>
    </div>
  )
}
