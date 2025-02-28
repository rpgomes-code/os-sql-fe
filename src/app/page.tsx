'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AuthProvider from '@/components/AuthProvider';
import SqlConverter from '@/components/SqlConverter';
import LogsViewer from '@/components/LogsViewer';
import { Code, FileText } from 'lucide-react';

export default function Home() {
    return (
        <AuthProvider>
            <Tabs defaultValue="converter" className="w-full">
                <TabsList className="grid w-full max-w-md mx-auto mb-6 grid-cols-2">
                    <TabsTrigger value="converter" className="flex items-center gap-2">
                        <Code size={16} />
                        SQL Converter
                    </TabsTrigger>
                    <TabsTrigger value="logs" className="flex items-center gap-2">
                        <FileText size={16} />
                        System Logs
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="converter">
                    <SqlConverter />
                </TabsContent>

                <TabsContent value="logs">
                    <LogsViewer />
                </TabsContent>
            </Tabs>
        </AuthProvider>
    );
}