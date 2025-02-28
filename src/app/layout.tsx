// src/app/layout.tsx
import type {Metadata, Viewport} from 'next';
import { Inter, Roboto_Mono } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/sonner';
import { MotionDiv } from '@/components/motion';
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeScript } from "@/components/theme-script";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { cn } from '@/lib/utils';

// Configure Inter as the primary sans-serif font
// The variable option creates a CSS variable that we can reference in our Tailwind config
const fontSans = Inter({
    subsets: ['latin'],       // Optimize by only including Latin character set
    variable: '--font-sans',  // Creates a CSS variable we can use in our styles
    display: 'swap',          // Ensures text remains visible during font loading
});

// Configure Roboto Mono as our monospace font for code blocks and technical content
const fontMono = Roboto_Mono({
    subsets: ['latin'],
    variable: '--font-mono',
    display: 'swap',
    weight: ['400', '500', '700'], // Include multiple weights for more styling options
});

// Define metadata for SEO and browser tab info
export const metadata: Metadata = {
    title: 'SQL Toolkit | OutSystems',
    description: 'Every tool you need for your SQL in OutSystems.',
    keywords: 'SQL, PostgresSQL, SQL Server, migration, database, convert, OutSystems',
    authors: [{ name: 'Rui Pedro Gomes (rpgomes)' }],
    icons: {
        icon: '/favicon.ico',
    },
};

export const viewport: Viewport = {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
};

export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
        <head>
            <ThemeScript />
        </head>
        <body className={cn(
            'min-h-screen font-sans antialiased',
            fontSans.variable,
            fontMono.variable
        )} suppressHydrationWarning>
        <ThemeProvider>
            {/* Enhanced Toaster for notifications with custom positioning and rich colors */}
            <Toaster position="top-right" closeButton richColors />
            <div className="relative min-h-screen flex flex-col bg-background">
                {/* Animated header with subtle entrance effect */}
                <MotionDiv
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur-md">
                        <div className="w-full flex h-14 items-center justify-between px-6">
                            {/* Logo and brand name */}
                            <div className="flex items-center gap-2">
                                <div className="w-7 h-7 bg-primary rounded flex items-center justify-center text-primary-foreground font-bold">
                                    OS
                                </div>
                                <span className="font-bold text-lg tracking-tight">SQL Toolkit</span>
                            </div>
                            {/* Navigation with theme switcher and GitHub link */}
                            <nav className="flex items-center gap-4">
                                <ThemeSwitcher />
                                <a
                                    href="https://github.com/yourusername/sql-migration-tool"
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1 text-sm"
                                >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="16"
                                    height="16"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"></path>
                                    <path d="M9 18c-4.51 2-5-2-7-2"></path>
                                </svg>
                                <span>GitHub</span>
                            </a>
                        </nav>
            </div>
        </header>
        </MotionDiv>

        {/* Main content area with full width */}
        <main className="flex-1 w-full py-10 md:py-12 px-6">
            {children}
        </main>

        {/* Footer with responsive layout */}
        <footer className="border-t bg-muted/30 px-6">
            <div className="w-full flex flex-col md:flex-row items-center justify-between py-6 text-sm text-muted-foreground">
                <p>&copy; {new Date().getFullYear()} OutSystems SQL Toolkit</p>
                <nav className="flex items-center gap-4 mt-4 md:mt-0">
                    <a href="#" className="hover:text-foreground transition-colors">Documentation</a>
                    <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
                    <a href="#" className="hover:text-foreground transition-colors">GitHub</a>
                </nav>
            </div>
        </footer>
        </div>
</ThemeProvider>
</body>
</html>
);
}