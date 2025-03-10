"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider, ThemeProviderProps } from "next-themes"

export function ThemeProvider({
                                  children,
                                  ...props
                              }: ThemeProviderProps) {
    return (
        <NextThemesProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            storageKey="theme"  // Match the key used in the script
            disableTransitionOnChange
            enableColorScheme={false}
            {...props}
        >
            {children}
        </NextThemesProvider>
    )
}