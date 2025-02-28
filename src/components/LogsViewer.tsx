'use client';

import { useState, useEffect, useMemo } from 'react';
import { logsService } from '@/lib/api';
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
    FileText,
    RefreshCw,
    XCircle,
    AlertTriangle,
    Info,
    CheckCircle,
    X,
    Loader2,
    Search,
    ArchiveX,
    Filter,
    CalendarDays
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MotionDiv } from '@/components/motion';
import { AnimatePresence } from 'framer-motion';
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious
} from '@/components/ui/pagination';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { Input } from "@/components/ui/input";
import {capitalizeFirstLetter, cn} from '@/lib/utils';

// Mocked log severity types
type LogSeverity = 'high' | 'medium' | 'low' | 'critical' | 'info';
type LogType = 'error' | 'warning' | 'info' | 'success' | 'system';

type Log = {
    log_id: string;
    log_type: LogType;
    log_endpoint: string;
    log_location: string;
    log_owner: string;
    log_severity: LogSeverity;
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

    // Filtering state
    const [searchTerm, setSearchTerm] = useState('');
    const [filterSeverity, setFilterSeverity] = useState<LogSeverity | 'all'>('all');
    const [filterType, setFilterType] = useState<LogType | 'all'>('all');
    const [dateRange, setDateRange] = useState<{start?: Date, end?: Date}>({});
    const [isFiltering, setIsFiltering] = useState(false);

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

    const getSeverityColor = (severity: LogSeverity) => {
        switch (severity.toLowerCase() as LogSeverity) {
            case 'high':
                return 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-900/50';
            case 'critical':
                return 'bg-red-200 text-red-800 border-red-300 dark:bg-red-900/50 dark:text-red-300 dark:border-red-900/60';
            case 'medium':
                return 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-900/50';
            case 'low':
                return 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-900/50';
            case 'info':
                return 'bg-sky-100 text-sky-700 border-sky-200 dark:bg-sky-900/30 dark:text-sky-400 dark:border-sky-900/50';
            default:
                return 'bg-muted text-muted-foreground';
        }
    };

    const getTypeIcon = (type: LogType) => {
        switch (type.toLowerCase() as LogType) {
            case 'error':
                return <XCircle size={16} className="text-red-500" />;
            case 'warning':
                return <AlertTriangle size={16} className="text-amber-500" />;
            case 'info':
                return <Info size={16} className="text-blue-500" />;
            case 'success':
                return <CheckCircle size={16} className="text-green-500" />;
            case 'system':
                return <FileText size={16} className="text-purple-500" />;
            default:
                return <FileText size={16} className="text-muted-foreground" />;
        }
    };

    const getReadableDate = (dateString: string) => {
        const date = new Date(dateString);

        // Check if it's today
        const today = new Date();
        const isToday = date.toDateString() === today.toDateString();

        if (isToday) {
            return `Today at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
        }

        // Check if it's yesterday
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        const isYesterday = date.toDateString() === yesterday.toDateString();

        if (isYesterday) {
            return `Yesterday at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
        }

        // For older dates
        return date.toLocaleDateString([], {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Generate page numbers to display in pagination
    const getPageNumbers = () => {
        const pages = [];
        const maxPagesToShow = 5; // Show at most 5 page numbers at a time

        let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
        const endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

        // Adjust start page if end page is maxed out
        if (endPage === totalPages) {
            startPage = Math.max(1, endPage - maxPagesToShow + 1);
        }

        for (let i = startPage; i <= endPage; i++) {
            pages.push(i);
        }

        return pages;
    };

    // Apply filters
    const filteredLogs = useMemo(() => {
        return logs.filter(log => {
            // Filter by search term
            const matchesSearch = searchTerm === '' ||
                log.log_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                log.log_endpoint.toLowerCase().includes(searchTerm.toLowerCase()) ||
                log.log_message.toLowerCase().includes(searchTerm.toLowerCase());

            // Filter by severity
            const matchesSeverity = filterSeverity === 'all' || log.log_severity === filterSeverity;

            // Filter by type
            const matchesType = filterType === 'all' || log.log_type === filterType;

            // Filter by date range
            let matchesDateRange = true;
            if (dateRange.start) {
                matchesDateRange = matchesDateRange && new Date(log.created_at) >= dateRange.start;
            }
            if (dateRange.end) {
                const endDate = new Date(dateRange.end);
                endDate.setHours(23, 59, 59, 999); // End of the day
                matchesDateRange = matchesDateRange && new Date(log.created_at) <= endDate;
            }

            return matchesSearch && matchesSeverity && matchesType && matchesDateRange;
        });
    }, [logs, searchTerm, filterSeverity, filterType, dateRange]);

    const hasActiveFilters = searchTerm !== '' || filterSeverity !== 'all' || filterType !== 'all' || dateRange.start || dateRange.end;

    const clearFilters = () => {
        setSearchTerm('');
        setFilterSeverity('all');
        setFilterType('all');
        setDateRange({});
        setIsFiltering(false);
    };

    return (
        <MotionDiv
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
        >
            <Card className="border-2 shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <div>
                        <CardTitle className="text-xl flex items-center gap-2">
                            <FileText size={20} className="text-primary" />
                            System Logs
                        </CardTitle>
                        <CardDescription>
                            View and monitor system activity and error logs
                        </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setIsFiltering(!isFiltering)}
                            className={cn(
                                "flex items-center gap-1 h-8",
                                hasActiveFilters && "border-primary text-primary"
                            )}
                        >
                            <Filter size={14} />
                            Filters
                            {hasActiveFilters && (
                                <Badge variant="secondary" className="ml-1 h-5 px-1 bg-primary text-primary-foreground">
                                    {Object.values({
                                        search: searchTerm ? 1 : 0,
                                        severity: filterSeverity !== 'all' ? 1 : 0,
                                        type: filterType !== 'all' ? 1 : 0,
                                        date: (dateRange.start || dateRange.end) ? 1 : 0
                                    }).reduce((a, b) => a + b, 0)}
                                </Badge>
                            )}
                        </Button>
                        <Button
                            variant="default"
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
                    </div>
                </CardHeader>

                <CardContent>
                    {/* Filters Panel */}
                    <AnimatePresence>
                        {isFiltering && (
                            <MotionDiv
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.3 }}
                                className="mb-6"
                            >
                                <div className="grid gap-4 md:grid-cols-4 p-4 rounded-lg border bg-card/50 mb-5">
                                    <div>
                                        <label className="text-sm font-medium mb-1.5 block">Search Logs</label>
                                        <div className="relative">
                                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
                                            <Input
                                                placeholder="Search by title, endpoint..."
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                                className="pl-9"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-sm font-medium mb-1.5 block">Log Type</label>
                                        <Select
                                            value={filterType}
                                            onValueChange={(value) => setFilterType(value as LogType | 'all')}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="All Types" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">All Types</SelectItem>
                                                <SelectItem value="error">Error</SelectItem>
                                                <SelectItem value="warning">Warning</SelectItem>
                                                <SelectItem value="info">Info</SelectItem>
                                                <SelectItem value="success">Success</SelectItem>
                                                <SelectItem value="system">System</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div>
                                        <label className="text-sm font-medium mb-1.5 block">Severity</label>
                                        <Select
                                            value={filterSeverity}
                                            onValueChange={(value) => setFilterSeverity(value as LogSeverity | 'all')}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="All Severities" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">All Severities</SelectItem>
                                                <SelectItem value="critical">Critical</SelectItem>
                                                <SelectItem value="high">High</SelectItem>
                                                <SelectItem value="medium">Medium</SelectItem>
                                                <SelectItem value="low">Low</SelectItem>
                                                <SelectItem value="info">Info</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div>
                                        <label className="text-sm font-medium mb-1.5 block">Date Range</label>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    className="w-full justify-start text-left font-normal"
                                                >
                                                    <CalendarDays className="mr-2 h-4 w-4" />
                                                    {dateRange.start || dateRange.end ? (
                                                        <>
                                                            {dateRange.start?.toLocaleDateString() || 'Any'} to {' '}
                                                            {dateRange.end?.toLocaleDateString() || 'Now'}
                                                        </>
                                                    ) : (
                                                        "Select date range"
                                                    )}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-4" align="start">
                                                <div className="grid gap-2">
                                                    <div className="grid gap-1.5">
                                                        <label className="text-sm font-medium">Start Date</label>
                                                        <Input
                                                            type="date"
                                                            value={dateRange.start?.toISOString().substring(0, 10) || ''}
                                                            onChange={(e) => {
                                                                const date = e.target.value ? new Date(e.target.value) : undefined;
                                                                setDateRange(prev => ({ ...prev, start: date }));
                                                            }}
                                                        />
                                                    </div>
                                                    <div className="grid gap-1.5">
                                                        <label className="text-sm font-medium">End Date</label>
                                                        <Input
                                                            type="date"
                                                            value={dateRange.end?.toISOString().substring(0, 10) || ''}
                                                            onChange={(e) => {
                                                                const date = e.target.value ? new Date(e.target.value) : undefined;
                                                                setDateRange(prev => ({ ...prev, end: date }));
                                                            }}
                                                        />
                                                    </div>
                                                    <div className="flex justify-between mt-2">
                                                        <Button
                                                            variant="outline"
                                                            onClick={() => setDateRange({})}
                                                            size="sm"
                                                        >
                                                            Clear
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            onClick={() => {
                                                                // Set to last 24 hours
                                                                const now = new Date();
                                                                const yesterday = new Date(now);
                                                                yesterday.setDate(yesterday.getDate() - 1);
                                                                setDateRange({ start: yesterday, end: now });
                                                            }}
                                                        >
                                                            Last 24h
                                                        </Button>
                                                    </div>
                                                </div>
                                            </PopoverContent>
                                        </Popover>
                                    </div>

                                    <div className="md:col-span-4 flex justify-end mt-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={clearFilters}
                                            className="flex items-center gap-1"
                                        >
                                            <ArchiveX size={14} />
                                            Clear Filters
                                        </Button>
                                    </div>
                                </div>
                            </MotionDiv>
                        )}
                    </AnimatePresence>

                    {isLoading ? (
                        <div className="flex items-center justify-center h-60">
                            <div className="flex flex-col items-center">
                                <MotionDiv
                                    animate={{ rotate: 360 }}
                                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                                    className="w-10 h-10 border-2 border-t-transparent border-primary rounded-full mb-4"
                                />
                                <p className="text-muted-foreground font-medium">Loading logs...</p>
                            </div>
                        </div>
                    ) : filteredLogs.length === 0 ? (
                        <div className="text-center py-16 bg-muted/30 rounded-lg border-2 border-dashed">
                            <FileText className="h-12 w-12 text-muted-foreground/40 mx-auto mb-4" />
                            <h3 className="text-lg font-medium mb-2">No logs found</h3>
                            <p className="text-muted-foreground max-w-md mx-auto">
                                {hasActiveFilters
                                    ? "No logs match your current filters. Try adjusting your filter criteria."
                                    : "No system logs are available at this time. Check back later for updates."}
                            </p>
                            {hasActiveFilters && (
                                <Button
                                    variant="outline"
                                    onClick={clearFilters}
                                    className="mt-4"
                                >
                                    Clear Filters
                                </Button>
                            )}
                        </div>
                    ) : (
                        <>
                            <div className="rounded-md border shadow-sm overflow-hidden">
                                <Table>
                                    <TableHeader className="bg-muted/50">
                                        <TableRow>
                                            <TableHead className="w-12 text-center font-medium">Type</TableHead>
                                            <TableHead className="w-44 font-medium">Time</TableHead>
                                            <TableHead className="font-medium">Endpoint</TableHead>
                                            <TableHead className="w-24 font-medium">Severity</TableHead>
                                            <TableHead className="font-medium">Message</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredLogs.map((log) => (
                                            <TableRow
                                                key={log.log_id}
                                                className={cn(
                                                    "cursor-pointer transition-colors",
                                                    selectedLog?.log_id === log.log_id ? "bg-muted" : "hover:bg-muted/40",
                                                    log.log_severity === 'critical' && "bg-red-50/50 dark:bg-red-950/10 hover:bg-red-50 dark:hover:bg-red-950/20"
                                                )}
                                                onClick={() => setSelectedLog(log === selectedLog ? null : log)}
                                            >
                                                <TableCell className="text-center">
                                                    <TooltipProvider>
                                                        <Tooltip>
                                                            <TooltipTrigger>
                                                                {getTypeIcon(log.log_type)}
                                                            </TooltipTrigger>
                                                            <TooltipContent>
                                                                <p className="capitalize">{log.log_type}</p>
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    </TooltipProvider>
                                                </TableCell>
                                                <TableCell className="text-xs text-muted-foreground">
                                                    {getReadableDate(log.created_at)}
                                                </TableCell>
                                                <TableCell className="font-mono text-xs truncate max-w-xs">
                                                    {log.log_endpoint}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="outline" className={`${getSeverityColor(log.log_severity)} py-0.5 px-2 rounded-full`}>
                                                        {capitalizeFirstLetter(log.log_severity)}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="font-medium truncate max-w-md">
                                                    {log.log_title}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>

                            <AnimatePresence>
                                {selectedLog && (
                                    <MotionDiv
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        transition={{ duration: 0.3 }}
                                        className="mt-4"
                                    >
                                        <Card className="border bg-muted/30 pt-0">
                                            <div className="px-4 py-3 border-b bg-muted/40 flex justify-between items-center">
                                                <div className="flex items-center gap-2">
                                                    {getTypeIcon(selectedLog.log_type)}
                                                    <h3 className="font-medium">{selectedLog.log_title}</h3>
                                                    <Badge variant="outline" className={`${getSeverityColor(selectedLog.log_severity)} py-0.5 px-2 rounded-full`}>
                                                        {capitalizeFirstLetter(selectedLog.log_severity)}
                                                    </Badge>
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => setSelectedLog(null)}
                                                    className="h-7 w-7 rounded-full hover:bg-muted"
                                                >
                                                    <X size={14} />
                                                </Button>
                                            </div>
                                            <div className="p-4 grid gap-4 md:grid-cols-2">
                                                <div>
                                                    <p className="text-xs font-medium text-muted-foreground mb-1">Timestamp</p>
                                                    <p className="text-sm">
                                                        {new Date(selectedLog.created_at).toLocaleString()}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-xs font-medium text-muted-foreground mb-1">Owner</p>
                                                    <p className="text-sm">{selectedLog.log_owner}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs font-medium text-muted-foreground mb-1">Endpoint</p>
                                                    <p className="text-sm font-mono">{selectedLog.log_endpoint}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs font-medium text-muted-foreground mb-1">Location</p>
                                                    <p className="text-sm font-mono">{selectedLog.log_location}</p>
                                                </div>
                                                <div className="md:col-span-2">
                                                    <p className="text-xs font-medium text-muted-foreground mb-1">Message Details</p>
                                                    <ScrollArea className="rounded-md border bg-card p-4 max-h-64">
                                                        <pre className="text-xs whitespace-pre-wrap font-mono">{selectedLog.log_message}</pre>
                                                    </ScrollArea>
                                                </div>
                                            </div>
                                        </Card>
                                    </MotionDiv>
                                )}
                            </AnimatePresence>
                        </>
                    )}
                </CardContent>

                {/* Pagination Footer */}
                {!isLoading && filteredLogs.length > 0 && (
                    <CardFooter className="flex justify-center pt-2 pb-6 border-t">
                        <Pagination>
                            <PaginationContent>
                                <PaginationItem>
                                    <PaginationPrevious
                                        onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                                        className={cn(
                                            "cursor-pointer",
                                            currentPage === 1 && "pointer-events-none opacity-50"
                                        )}
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
                                        className={cn(
                                            "cursor-pointer",
                                            currentPage === totalPages && "pointer-events-none opacity-50"
                                        )}
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