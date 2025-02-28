import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/sonner';
import { MotionDiv } from '@/components/motion';
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeScript } from "@/components/theme-script";

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
    title: 'SQL Migration Tool',
    description: 'Convert SQL Server queries to PostgreSQL for OutSystems ODC',
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
        <body className={inter.className} suppressHydrationWarning>
        <ThemeProvider>
            <Toaster />
            <div className="min-h-screen bg-background">
                <MotionDiv
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <header className="bg-primary text-primary-foreground p-4 shadow-md">
                        <div className="container mx-auto">
                            <h1 className="text-2xl font-bold">OutSystems SQL Migration Tool</h1>
                            <p className="text-sm opacity-90">Convert SQL Server to PostgreSQL for ODC</p>
                        </div>
                    </header>
                </MotionDiv>
                <main className="container mx-auto py-8 px-4">
                    {children}
                </main>
                <footer className="bg-muted py-4 border-t">
                    <div className="container mx-auto text-center text-muted-foreground text-sm">
                        &copy; {new Date().getFullYear()} SQL Migration Tool
                    </div>
                </footer>
            </div>
        </ThemeProvider>
        </body>
        </html>
    );
}