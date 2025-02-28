import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from 'react-hot-toast';

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
        <html lang="en">
        <body className={inter.className}>
        <Toaster position="top-right" />
        <div className="min-h-screen bg-gray-50">
            <header className="bg-blue-600 text-white p-4 shadow-md">
                <div className="container mx-auto">
                    <h1 className="text-2xl font-bold">OutSystems SQL Migration Tool</h1>
                    <p className="text-sm">Convert SQL Server to PostgreSQL for ODC</p>
                </div>
            </header>
            <main className="container mx-auto py-8 px-4">
                {children}
            </main>
            <footer className="bg-gray-100 border-t p-4">
                <div className="container mx-auto text-center text-gray-500 text-sm">
                    &copy; {new Date().getFullYear()} SQL Migration Tool
                </div>
            </footer>
        </div>
        </body>
        </html>
    );
}