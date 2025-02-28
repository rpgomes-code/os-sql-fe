'use client';

import { useState, useEffect } from 'react';
import { logsService } from '@/lib/api';
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FileText, RefreshCw, XCircle, AlertTriangle, Info, CheckCircle, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MotionDiv } from '@/components/motion';

type Log = {
    log_id: string;
    log_type: string;
    log_endpoint: string;
    log_location: string;
    log_owner: string;
    log_severity: string;
    log_title: string;
    log_message: string;
    created_at: string;
};

export default function LogsViewer() {
    const [logs, setLogs] = useState<Log[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedLog, setSelectedLog] = useState<Log | null>(null);

    useEffect(() => {
        fetchLogs();
    }, []);

    const fetchLogs = async () => {
        setIsLoading(true);
        try {
            const logs = await logsService.getLogs();
            setLogs(logs);
        } catch (error) {
            console.error('Error fetching logs:', error);
            toast.error("Failed to fetch logs");
        } finally {
            setIsLoading(false);
        }
    };

    const getSeverityColor = (severity: string) => {
        switch (severity.toLowerCase()) {
            case 'high':
            case 'critical':
                return 'bg-destructive/10 text-destructive border-destructive/20';
            case 'medium':
                return 'bg-amber-100 text-amber-800 border-amber-200';
            case 'low':
                return 'bg-primary/10 text-primary border-primary/20';
            default:
                return 'bg-muted text-muted-foreground';
        }
    };

    const getTypeIcon = (type: string) => {
        switch (type.toLowerCase()) {
            case 'error':
                return <XCircle size={16} className="text-destructive" />;
            case 'warning':
                return <AlertTriangle size={16} className="text-amber-500" />;
            case 'info':
                return <Info size={16} className="text-blue-500" />;
            case 'success':
                return <CheckCircle size={16} className="text-green-500" />;
            default:
                return <FileText size={16} className="text-muted-foreground" />;
        }
    };

    return (
        <MotionDiv
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
        >
            <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="flex items-center gap-2">
                        <FileText size={18} className="text-primary" />
                        System Logs
                    </CardTitle>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={fetchLogs}
                        className="flex items-center gap-1 h-8"
                    >
                        <RefreshCw size={14} className={isLoading ? "animate-spin" : ""} />
                        Refresh
                    </Button>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex items-center justify-center h-60">
                            <div className="flex flex-col items-center">
                                <MotionDiv
                                    animate={{ rotate: 360 }}
                                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                                    className="w-8 h-8 border-2 border-t-transparent border-primary rounded-full mb-4"
                                />
                                <p className="text-muted-foreground">Loading logs...</p>
                            </div>
                        </div>
                    ) : logs.length === 0 ? (
                        <div className="text-center py-12">
                            <FileText className="h-12 w-12 text-muted-foreground/40 mx-auto mb-4" />
                            <p className="text-muted-foreground">No logs found</p>
                        </div>
                    ) : (
                        <>
                            <div className="rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-12 text-center">Type</TableHead>
                                            <TableHead className="w-44">Time</TableHead>
                                            <TableHead>Endpoint</TableHead>
                                            <TableHead className="w-24">Severity</TableHead>
                                            <TableHead>Title</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {logs.map((log) => (
                                            <TableRow
                                                key={log.log_id}
                                                className="cursor-pointer hover:bg-muted/40"
                                                onClick={() => setSelectedLog(log)}
                                            >
                                                <TableCell className="text-center">
                                                    {getTypeIcon(log.log_type)}
                                                </TableCell>
                                                <TableCell className="text-xs text-muted-foreground">
                                                    {new Date(log.created_at).toLocaleString()}
                                                </TableCell>
                                                <TableCell className="text-xs font-mono">
                                                    {log.log_endpoint}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="outline" className={getSeverityColor(log.log_severity)}>
                                                        {log.log_severity}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    {log.log_title}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>

                            {selectedLog && (
                                <MotionDiv
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    transition={{ duration: 0.3 }}
                                    className="mt-4 border rounded-md bg-muted/30"
                                >
                                    <div className="px-4 py-3 border-b bg-muted/40 flex justify-between items-center">
                                        <h3 className="font-medium">{selectedLog.log_title}</h3>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => setSelectedLog(null)}
                                            className="h-7 w-7"
                                        >
                                            <X size={14} />
                                        </Button>
                                    </div>
                                    <ScrollArea className="p-4 max-h-64">
                                        <pre className="text-xs whitespace-pre-wrap font-mono">{selectedLog.log_message}</pre>
                                    </ScrollArea>
                                </MotionDiv>
                            )}
                        </>
                    )}
                </CardContent>
            </Card>
        </MotionDiv>
    );
}