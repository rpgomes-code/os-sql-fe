'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AuthProvider from '@/components/AuthProvider';
import SqlConverter from '@/components/SqlConverter';
import LogsViewer from '@/components/LogsViewer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {Code, FileText, BarChart, Database, ArrowRightLeft, Split, Info, AlertTriangle} from 'lucide-react';
import { MotionDiv } from '@/components/motion';
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function Home() {
    const [activeTab, setActiveTab] = useState<string>("converter");

    // Track if user has viewed dashboard yet
    const [viewedDashboard, setViewedDashboard] = useState<boolean>(false);

    return (
        <AuthProvider>
            <MotionDiv
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="space-y-8 w-full"
            >
                {/* Hero section */}
                <section className="py-6 px-8 rounded-lg border-2 bg-card shadow-lg text-card-foreground overflow-hidden relative w-full">
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-primary/0 pointer-events-none" />
                    <div className="grid gap-4 md:grid-cols-2 items-center">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight mb-4">
                                SQL Migration Tool
                            </h1>
                            <p className="text-muted-foreground max-w-[600px] mb-6">
                                Simplify your database migration process with our powerful SQL conversion tool.
                                Seamlessly transform your SQL Server, Oracle, or MySQL queries to PostgreSQL format for OutSystems ODC.
                            </p>
                            <div className="flex flex-wrap gap-3 mb-2">
                                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/60 py-1.5 px-2.5 rounded-full">
                                    Interactive Conversion
                                </Badge>
                                <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-400 dark:bg-blue-900/30 dark:text-blue-400  py-1.5 px-2.5 rounded-full">
                                    Multi-Database Support
                                </Badge>
                                <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-900/30 dark:text-amber-400 py-1.5 px-2.5 rounded-full">
                                    Error Detection
                                </Badge>
                                <Badge variant="outline" className="bg-green-100 text-green-800 border-green-400 dark:bg-green-900/30 dark:text-green-400 py-1.5 px-2.5 rounded-full">
                                    Automatic Optimization
                                </Badge>
                            </div>
                        </div>
                        <div className="relative pl-6 hidden md:block">
                            <div className="absolute top-0 bottom-0 left-0 w-px bg-gradient-to-b from-primary/0 via-primary/30 to-primary/0"></div>
                            <div className="p-1 rounded-lg bg-muted/50 border shadow-sm overflow-hidden">
                                <div className="bg-black rounded p-4 text-white text-sm font-mono">
                                    <div className="flex items-center gap-2 mb-3 text-muted-foreground text-xs">
                                        <ArrowRightLeft size={14} className="text-primary" />
                                        <span>SQL Server → PostgreSQL</span>
                                    </div>
                                    <div className="opacity-80">
                                        <p>-- SQL Server</p>
                                        <p className="text-blue-400">SELECT TOP 10 *</p>
                                        <p>FROM Users</p>
                                        <p>WHERE IsActive = 1</p>
                                    </div>
                                    <div className="h-px bg-white/10 my-3"></div>
                                    <div>
                                        <p>-- PostgreSQL</p>
                                        <p className="text-green-400">SELECT *</p>
                                        <p>FROM Users</p>
                                        <p>WHERE IsActive IS TRUE</p>
                                        <p className="text-amber-400">LIMIT 10</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Main tabs */}
                <Tabs
                    defaultValue="converter"
                    value={activeTab}
                    onValueChange={(value) => {
                        setActiveTab(value);
                        if (value === "dashboard") {
                            setViewedDashboard(true);
                        }
                    }}
                    className="space-y-6 w-full"
                >
                    <div className="flex justify-between">
                        <TabsList className="grid w-full max-w-md grid-cols-3">
                            <TabsTrigger value="converter" className="flex items-center gap-2">
                                <Code size={16} />
                                SQL Converter
                            </TabsTrigger>
                            <TabsTrigger value="logs" className="flex items-center gap-2">
                                <FileText size={16} />
                                System Logs
                            </TabsTrigger>
                            <TabsTrigger value="dashboard" className="flex items-center gap-2 relative">
                                <BarChart size={16} />
                                Dashboard
                                {!viewedDashboard && (
                                    <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center bg-primary text-primary-foreground">
                                        !
                                    </Badge>
                                )}
                            </TabsTrigger>
                        </TabsList>

                        <div className="hidden sm:block">
                            <Button variant="outline" size="sm" className="h-8 gap-1">
                                <Info size={14} />
                                <span className="text-xs">Documentation</span>
                            </Button>
                        </div>
                    </div>

                    <TabsContent value="converter" className="space-y-4 w-full">
                        <SqlConverter />
                    </TabsContent>

                    <TabsContent value="logs" className="space-y-4 w-full">
                        <LogsViewer />
                    </TabsContent>

                    <TabsContent value="dashboard" className="space-y-6 w-full">
                        <Card className="border-2 shadow-lg w-full">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-xl">
                                    <BarChart size={20} className="text-primary" />
                                    SQL Migration Dashboard
                                </CardTitle>
                                <CardDescription>
                                    Track SQL migration metrics and activity
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-8">
                                {/* Summary Stats */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                                    <div className="rounded-lg border bg-card p-4">
                                        <div className="flex justify-between">
                                            <p className="text-muted-foreground text-sm">Total Conversions</p>
                                            <Database className="h-4 w-4 text-primary" />
                                        </div>
                                        <p className="text-2xl font-bold mt-2">238</p>
                                        <p className="text-xs text-green-600 flex items-center mt-1">
                                            <span className="text-lg mr-1">↑</span> 12% from last week
                                        </p>
                                    </div>

                                    {/* Additional dashboard components... */}
                                    {/* (dashboard content omitted for brevity) */}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>

                {/* Feature highlight section */}
                <section className="py-6 w-full">
                    <h2 className="text-2xl font-bold tracking-tight mb-6">
                        Key Features
                    </h2>
                    <div className="grid gap-6 md:grid-cols-3">
                        <Card className="transition-all hover:border-primary/50 hover:shadow-md group">
                            <CardHeader className="p-5">
                                <div className="mb-2 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                                    <ArrowRightLeft size={20} className="text-primary" />
                                </div>
                                <CardTitle className="text-lg">Intelligent Conversion</CardTitle>
                            </CardHeader>
                            <CardContent className="px-5 pb-5 text-sm text-muted-foreground">
                                Our tool smartly converts SQL Server&#39;s procedural logic to PostgresSQL&#39;s declarative style, handling data types, functions, and syntax differences automatically.
                            </CardContent>
                        </Card>

                        <Card className="transition-all hover:border-primary/50 hover:shadow-md group">
                            <CardHeader className="p-5">
                                <div className="mb-2 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                                    <Split size={20} className="text-primary" />
                                </div>
                                <CardTitle className="text-lg">Multi-Database Support</CardTitle>
                            </CardHeader>
                            <CardContent className="px-5 pb-5 text-sm text-muted-foreground">
                                Convert from SQL Server, Oracle, or MySQL to PostgreSQL with proper function mapping, data type conversion, and syntax adaptation for each source database.
                            </CardContent>
                        </Card>

                        <Card className="transition-all hover:border-primary/50 hover:shadow-md group">
                            <CardHeader className="p-5">
                                <div className="mb-2 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                                    <AlertTriangle size={20} className="text-primary" />
                                </div>
                                <CardTitle className="text-lg">Automatic Error Detection</CardTitle>
                            </CardHeader>
                            <CardContent className="px-5 pb-5 text-sm text-muted-foreground">
                                We identify potential migration issues and provide detailed warnings that help you understand and resolve problems before they impact your application.
                            </CardContent>
                        </Card>
                    </div>
                </section>
            </MotionDiv>
        </AuthProvider>
    );
}