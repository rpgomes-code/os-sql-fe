'use client'

import Script from 'next/script'

export function ThemeScript() {
    return (
        <Script
            id="theme-detector"
            strategy="beforeInteractive"
            dangerouslySetInnerHTML={{
                __html: `
          (function() {
            // Check for saved theme preference
            const storedTheme = window.localStorage.getItem('theme') || 'system';
            
            // If system preference, detect it
            let resolvedTheme = storedTheme;
            if (storedTheme === 'system') {
              resolvedTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
            }
            
            // Apply theme immediately to prevent flash
            document.documentElement.classList.toggle('dark', resolvedTheme === 'dark');
            
            // Update when system preference changes
            window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
              if (storedTheme === 'system') {
                document.documentElement.classList.toggle('dark', e.matches);
              }
            });
          })();
        `,
            }}
        />
    )
}