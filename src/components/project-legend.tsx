"use client"

import type { Project } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"

interface ProjectLegendProps {
    projects: Project[];
}

export function ProjectLegend({ projects }: ProjectLegendProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>凡例</CardTitle>
            </CardHeader>
            <CardContent>
                <ul className="space-y-2">
                    {projects.map(project => (
                        <li key={project.id} className="flex items-center">
                            <span 
                                className="h-4 w-4 rounded-full mr-2 shrink-0" 
                                style={{ backgroundColor: project.color }}
                            />
                            <span className="text-sm truncate">{project.name}</span>
                        </li>
                    ))}
                </ul>
            </CardContent>
        </Card>
    )
}
