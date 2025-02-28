// src/components/theme-switcher.tsx
"use client"

import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Moon, Sun, Monitor } from "lucide-react"
import { useEffect, useState } from "react"
import { MotionDiv } from "@/components/motion"

export function ThemeSwitcher() {
    const { setTheme, theme } = useTheme()
    const [mounted, setMounted] = useState(false)

    // Avoid hydration mismatch by waiting for component to mount
    useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) {
        return (
            <Button variant="ghost" size="sm" className="w-9 px-0">
                <span className="sr-only">Toggle theme</span>
                <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all" />
            </Button>
        )
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="w-9 px-0">
                    <span className="sr-only">Toggle theme</span>
                    <MotionDiv
                        initial={{ rotate: 0 }}
                        animate={{ rotate: theme === 'dark' ? 180 : 0 }}
                        transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
                        className="relative"
                    >
                        <Sun className={`h-[1.2rem] w-[1.2rem] absolute top-0 left-0 transition-opacity ${theme === 'dark' ? 'opacity-0' : 'opacity-100'}`} />
                        <Moon className={`h-[1.2rem] w-[1.2rem] transition-opacity ${theme === 'dark' ? 'opacity-100' : 'opacity-0'}`} />
                    </MotionDiv>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setTheme("light")} className="flex items-center gap-2">
                    <Sun className="h-4 w-4" />
                    <span>Light</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("dark")} className="flex items-center gap-2">
                    <Moon className="h-4 w-4" />
                    <span>Dark</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("system")} className="flex items-center gap-2">
                    <Monitor className="h-4 w-4" />
                    <span>System</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}