'use client';

import { useState, useEffect } from 'react';
import { logsService } from '@/lib/api';
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FileText, RefreshCw, XCircle, AlertTriangle, Info, CheckCircle, X, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MotionDiv } from '@/components/motion';
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious
} from '@/components/ui/pagination';

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

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const logsPerPage = 10; // Number of logs to display per page

    useEffect(() => {
        fetchLogs();
    }, [currentPage]); // Refetch logs when page changes

    const fetchLogs = async () => {
        setIsLoading(true);
        try {
            // In a real implementation, you might want to modify your API to support pagination
            // For now, we'll simulate pagination on the client side
            const allLogs = await logsService.getLogs();

            // Calculate total pages
            const total = Math.ceil(allLogs.length / logsPerPage);
            setTotalPages(total || 1); // Ensure at least 1 page even if no logs

            // Get logs for current page
            const startIndex = (currentPage - 1) * logsPerPage;
            const paginatedLogs = allLogs.slice(startIndex, startIndex + logsPerPage);

            setLogs(paginatedLogs);
        } catch (error) {
            console.error('Error fetching logs:', error);
            toast.error("Failed to fetch logs");
        } finally {
            setIsLoading(false);
        }
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        // Reset selected log when changing pages
        setSelectedLog(null);
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

    // Generate page numbers to display in pagination
    const getPageNumbers = () => {
        const pages = [];
        const maxPagesToShow = 5; // Show at most 5 page numbers at a time

        let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
        let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

        // Adjust start page if end page is maxed out
        if (endPage === totalPages) {
            startPage = Math.max(1, endPage - maxPagesToShow + 1);
        }

        for (let i = startPage; i <= endPage; i++) {
            pages.push(i);
        }

        return pages;
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
                        disabled={isLoading}
                        className="flex items-center gap-1 h-8"
                    >
                        {isLoading ? (
                            <Loader2 size={14} className="animate-spin" />
                        ) : (
                            <RefreshCw size={14} />
                        )}
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

                {/* Pagination Footer */}
                {!isLoading && logs.length > 0 && (
                    <CardFooter className="flex justify-center pt-2 pb-6">
                        <Pagination>
                            <PaginationContent>
                                <PaginationItem>
                                    <PaginationPrevious
                                        onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                                        className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                                    />
                                </PaginationItem>

                                {getPageNumbers().map(page => (
                                    <PaginationItem key={page}>
                                        <PaginationLink
                                            isActive={currentPage === page}
                                            onClick={() => handlePageChange(page)}
                                            className="cursor-pointer"
                                        >
                                            {page}
                                        </PaginationLink>
                                    </PaginationItem>
                                ))}

                                <PaginationItem>
                                    <PaginationNext
                                        onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                                        className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                                    />
                                </PaginationItem>
                            </PaginationContent>
                        </Pagination>
                    </CardFooter>
                )}
            </Card>
        </MotionDiv>
    );
}