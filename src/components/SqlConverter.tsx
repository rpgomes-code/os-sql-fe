'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark, prism } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { toast } from "sonner";
import { sqlMigrationService, sqlFormattingService } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Clipboard,
    DownloadCloud,
    AlertTriangle,
    Database,
    ArrowRightLeft,
    Loader2,
    CheckCircle,
    XCircle,
    Copy,
    Upload,
    RefreshCw,
    Code,
    FileCode,
    AlignLeft, // For formatting
    Minimize // For minifying
} from 'lucide-react';
import { MotionDiv } from '@/components/motion';
import { useTheme } from 'next-themes';
import { AnimatePresence } from 'framer-motion';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    FormDescription
} from '@/components/ui/form';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger
} from "@/components/ui/tooltip";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Validation schema
const formSchema = z.object({
    sqlQuery: z.string().min(1, {
        message: "SQL query is required",
    }),
    sqlType: z.enum(["sqlserver", "oracle", "mysql"], {
        required_error: "SQL type is required",
    }),
});

type FormValues = z.infer<typeof formSchema>;

// Sample queries for each SQL type
const SAMPLE_QUERIES = {
    sqlserver: `-- SQL Server sample query
SELECT TOP 10 
  o.OrderID, 
  c.CustomerName,
  SUM(od.Quantity * p.Price) as TotalAmount
FROM Orders o
JOIN Customers c ON o.CustomerID = c.CustomerID
JOIN OrderDetails od ON o.OrderID = od.OrderID
JOIN Products p ON od.ProductID = p.ProductID
WHERE o.OrderDate > GETDATE() - 30
GROUP BY o.OrderID, c.CustomerName
ORDER BY TotalAmount DESC`,

    oracle: `-- Oracle sample query
SELECT o.order_id, 
  c.customer_name,
  SUM(od.quantity * p.price) as total_amount
FROM orders o
JOIN customers c ON o.customer_id = c.customer_id
JOIN order_details od ON o.order_id = od.order_id
JOIN products p ON od.product_id = p.product_id
WHERE o.order_date > SYSDATE - 30
GROUP BY o.order_id, c.customer_name
ORDER BY total_amount DESC
FETCH FIRST 10 ROWS ONLY`,

    mysql: `-- MySQL sample query
SELECT 
  o.order_id, 
  c.customer_name,
  SUM(od.quantity * p.price) as total_amount
FROM orders o
JOIN customers c ON o.customer_id = c.customer_id
JOIN order_details od ON o.order_id = od.order_id
JOIN products p ON od.product_id = p.product_id
WHERE o.order_date > DATE_SUB(NOW(), INTERVAL 30 DAY)
GROUP BY o.order_id, c.customer_name
ORDER BY total_amount DESC
LIMIT 10`
};

export default function SqlConverter() {
    const [isConverting, setIsConverting] = useState(false);
    const [isFormatting, setIsFormatting] = useState(false);
    const [isMinifying, setIsMinifying] = useState(false);
    const [isCopying, setIsCopying] = useState(false);
    const [conversionState, setConversionState] = useState<'idle' | 'converting' | 'success' | 'error'>('idle');
    const [convertedQuery, setConvertedQuery] = useState('');
    const [warnings, setWarnings] = useState<string[]>([]);
    const [conversionProgress, setConversionProgress] = useState(0);
    const [currentTab, setCurrentTab] = useState<'input' | 'output'>('input');
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { theme } = useTheme();

    // Initialize the form with react-hook-form and zod validation
    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            sqlQuery: '',
            sqlType: 'sqlserver',
        },
    });

    // Watch the sqlQuery field to enable/disable the convert button properly
    const sqlQuery = form.watch('sqlQuery');

    // Simulated conversion progress
    useEffect(() => {
        let progressInterval: NodeJS.Timeout;

        if (isConverting) {
            setConversionProgress(0);
            progressInterval = setInterval(() => {
                setConversionProgress(prev => {
                    if (prev >= 95) {
                        clearInterval(progressInterval);
                        return prev;
                    }
                    return prev + Math.random() * 15;
                });
            }, 300);
        } else if (conversionState === 'success') {
            setConversionProgress(100);
        }

        return () => {
            clearInterval(progressInterval);
        };
    }, [isConverting, conversionState]);

    // Switch to output tab on successful conversion
    useEffect(() => {
        if (convertedQuery && conversionState === 'success') {
            setCurrentTab('output');
        }
    }, [convertedQuery, conversionState]);

    const onSubmit = async (data: FormValues) => {
        setIsConverting(true);
        setConversionState('converting');

        try {
            // Wait a minimum time (750 ms) to show the progress animation
            const minTimePromise = new Promise(resolve => setTimeout(resolve, 750));

            const conversionPromise = sqlMigrationService.convertQuery(data.sqlQuery);

            // Wait for both the API call and minimum time to complete
            const [result] = await Promise.all([conversionPromise, minTimePromise]);

            if (result.success) {
                setConversionState('success');
                setConvertedQuery(result.converted_query);
                setWarnings(result.warnings || []);
                toast.success("Query converted successfully", {
                    icon: <CheckCircle className="text-green-500 h-5 w-5" />,
                });
            } else {
                setConversionState('error');
                setConvertedQuery('');
                setWarnings(result.warnings || ['Conversion failed']);
                toast.error("Conversion failed", {
                    icon: <XCircle className="text-destructive h-5 w-5" />,
                });
            }
        } catch (error) {
            console.error('Error converting query:', error);
            setConversionState('error');
            toast.error("Error connecting to the API", {
                description: "Please try again or contact support if the problem persists.",
            });
        } finally {
            setIsConverting(false);
        }
    };

    // Handle SQL formatting
    const handleFormatQuery = async () => {
        if (!sqlQuery) return;

        setIsFormatting(true);

        try {
            const result = await sqlFormattingService.formatQuery(sqlQuery);

            if (result.success) {
                form.setValue('sqlQuery', result.formatted_query);
                toast.success("SQL query formatted", {
                    icon: <AlignLeft className="h-4 w-4" />,
                });
            } else {
                toast.error("Failed to format SQL", {
                    description: result.warnings?.join(' ') || "Unknown error occurred",
                });
            }
        } catch (error) {
            console.error('Error formatting query:', error);
            toast.error("Error connecting to the formatting API");
        } finally {
            setIsFormatting(false);
        }
    };

    // Handle SQL minification
    const handleMinifyQuery = async () => {
        if (!sqlQuery) return;

        setIsMinifying(true);

        try {
            const result = await sqlFormattingService.minifyQuery(sqlQuery);

            if (result.success) {
                form.setValue('sqlQuery', result.formatted_query);
                toast.success("SQL query minified", {
                    icon: <Minimize className="h-4 w-4" />,
                });
            } else {
                toast.error("Failed to minify SQL", {
                    description: result.warnings?.join(' ') || "Unknown error occurred",
                });
            }
        } catch (error) {
            console.error('Error minifying query:', error);
            toast.error("Error connecting to the minification API");
        } finally {
            setIsMinifying(false);
        }
    };

    // Format output query
    const formatOutputQuery = async () => {
        if (!convertedQuery) return;

        setIsFormatting(true);

        try {
            const result = await sqlFormattingService.formatQuery(convertedQuery);

            if (result.success) {
                setConvertedQuery(result.formatted_query);
                toast.success("Output query formatted");
            } else {
                toast.error("Failed to format output", {
                    description: result.warnings?.join(' ') || "Unknown error occurred",
                });
            }
        } catch (error) {
            console.error('Error formatting output query:', error);
            toast.error("Error connecting to the formatting API");
        } finally {
            setIsFormatting(false);
        }
    };

    // Minify output query
    const minifyOutputQuery = async () => {
        if (!convertedQuery) return;

        setIsMinifying(true);

        try {
            const result = await sqlFormattingService.minifyQuery(convertedQuery);

            if (result.success) {
                setConvertedQuery(result.formatted_query);
                toast.success("Output query minified");
            } else {
                toast.error("Failed to minify output", {
                    description: result.warnings?.join(' ') || "Unknown error occurred",
                });
            }
        } catch (error) {
            console.error('Error minifying output query:', error);
            toast.error("Error connecting to the minification API");
        } finally {
            setIsMinifying(false);
        }
    };

    // Updated copyToClipboard function with a fallback mechanism
    const copyToClipboard = async () => {
        setIsCopying(true);
        try {
            // First try using the Clipboard API if available
            if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
                await navigator.clipboard.writeText(convertedQuery);
            } else {
                // Fallback for environments where Clipboard API is not available
                const textArea = document.createElement('textarea');
                textArea.value = convertedQuery;
                // Make the textarea out of viewport
                textArea.style.position = 'fixed';
                textArea.style.left = '-999999px';
                textArea.style.top = '-999999px';
                document.body.appendChild(textArea);
                textArea.focus();
                textArea.select();

                const successful = document.execCommand('copy');
                document.body.removeChild(textArea);

                if (!successful) {
                    throw new Error('Failed to copy text using execCommand');
                }
            }

            toast.success("SQL query copied to clipboard", {
                icon: <Copy className="h-4 w-4" />,
            });
        } catch (error) {
            console.error('Failed to copy:', error);
            toast.error("Failed to copy to clipboard", {
                description: "Your browser might restrict clipboard access."
            });
        } finally {
            // Add a slight delay to show the copying state
            setTimeout(() => {
                setIsCopying(false);
            }, 800);
        }
    };

    const downloadQueryAsFile = () => {
        if (!convertedQuery) return;

        const blob = new Blob([convertedQuery], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'converted-postgresql-query.sql';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        toast.success("Query downloaded as SQL file");
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);

        const reader = new FileReader();
        reader.onload = (event) => {
            const content = event.target?.result as string;
            form.setValue('sqlQuery', content);
            setIsUploading(false);
            toast.success(`File "${file.name}" loaded successfully`);
        };

        reader.onerror = () => {
            setIsUploading(false);
            toast.error("Error reading file");
        };

        reader.readAsText(file);
    };

    const loadSampleQuery = () => {
        const sqlType = form.getValues('sqlType');
        form.setValue('sqlQuery', SAMPLE_QUERIES[sqlType as keyof typeof SAMPLE_QUERIES]);
        toast.success(`Sample ${sqlType} query loaded`, {
            description: "You can now edit or convert this sample query.",
        });
    };

    const resetForm = () => {
        form.reset({
            sqlQuery: '',
            sqlType: 'sqlserver',
        });
        setConvertedQuery('');
        setWarnings([]);
        setConversionState('idle');
        setCurrentTab('input');
    };

    return (
        <MotionDiv
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="grid gap-6"
        >
            <Tabs
                value={currentTab}
                onValueChange={(value) => setCurrentTab(value as 'input' | 'output')}
                className="w-full"
            >
                <div className="flex items-center justify-between mb-6">
                    <TabsList className="w-fit grid-cols-2 flex justify-center gap-4">
                        <TabsTrigger value="input" className="flex items-center gap-2">
                            <Code size={16} />
                            Source SQL
                        </TabsTrigger>
                        <TabsTrigger
                            value="output"
                            disabled={!convertedQuery}
                            className="flex items-center gap-2 w-fit"
                        >
                            <FileCode size={16} />
                            PostgresSQL Result
                            {conversionState === 'success' && (
                                <Badge variant="outline" className="bg-primary/10 text-primary py-0.5 px-2 rounded-full">
                                    Ready
                                </Badge>
                            )}
                        </TabsTrigger>
                    </TabsList>

                    {/* Actions based on current tab */}
                    <div className="flex items-center gap-2">
                        {currentTab === 'input' ? (
                            <>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={isUploading || isConverting}
                                    className="flex items-center gap-1 text-xs"
                                >
                                    {isUploading ? (
                                        <Loader2 size={14} className="animate-spin" />
                                    ) : (
                                        <Upload size={14} />
                                    )}
                                    Upload SQL
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept=".sql,.txt"
                                        onChange={handleFileUpload}
                                        className="hidden"
                                    />
                                </Button>

                                {/* SQL Formatting Dropdown Menu */}
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            disabled={!sqlQuery || isFormatting || isMinifying}
                                            className="flex items-center gap-1 text-xs"
                                        >
                                            {isFormatting || isMinifying ? (
                                                <Loader2 size={14} className="animate-spin" />
                                            ) : (
                                                <AlignLeft size={14} />
                                            )}
                                            Format Options
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent>
                                        <DropdownMenuItem onClick={handleFormatQuery}>
                                            <AlignLeft className="mr-2 h-4 w-4" />
                                            <span>Beautify SQL</span>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={handleMinifyQuery}>
                                            <Minimize className="mr-2 h-4 w-4" />
                                            <span>Minify SQL</span>
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>

                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={loadSampleQuery}
                                    disabled={isConverting}
                                    className="flex items-center gap-1 text-xs"
                                >
                                    <Code size={14} />
                                    Load Sample
                                </Button>
                            </>
                        ) : (
                            <>
                                {/* Output tab actions */}
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            disabled={!convertedQuery || isFormatting || isMinifying}
                                            className="flex items-center gap-1 text-xs"
                                        >
                                            {isFormatting || isMinifying ? (
                                                <Loader2 size={14} className="animate-spin" />
                                            ) : (
                                                <AlignLeft size={14} />
                                            )}
                                            Format Options
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent>
                                        <DropdownMenuItem onClick={formatOutputQuery}>
                                            <AlignLeft className="mr-2 h-4 w-4" />
                                            <span>Beautify SQL</span>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={minifyOutputQuery}>
                                            <Minimize className="mr-2 h-4 w-4" />
                                            <span>Minify SQL</span>
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>

                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={copyToClipboard}
                                    disabled={isCopying || !convertedQuery}
                                    className="flex items-center gap-1 text-xs"
                                >
                                    {isCopying ? (
                                        <CheckCircle size={14} className="text-green-500" />
                                    ) : (
                                        <Clipboard size={14} />
                                    )}
                                    {isCopying ? 'Copied!' : 'Copy SQL'}
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={downloadQueryAsFile}
                                    disabled={!convertedQuery}
                                    className="flex items-center gap-1 text-xs"
                                >
                                    <DownloadCloud size={14} />
                                    Download
                                </Button>
                            </>
                        )}
                    </div>
                </div>

                <TabsContent value="input" className="mt-0">
                    <Card className="border-2 shadow-lg">
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)}>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-xl">
                                        <Database size={20} className="text-primary" />
                                        SQL Migration Tool
                                    </CardTitle>
                                    <CardDescription>
                                        Convert SQL Server, Oracle, or MySQL queries to PostgreSQL format for OutSystems ODC.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6 pt-6">
                                    <FormField
                                        control={form.control}
                                        name="sqlType"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Source SQL Type</FormLabel>
                                                <Select
                                                    onValueChange={field.onChange}
                                                    defaultValue={field.value}
                                                    disabled={isConverting}
                                                >
                                                    <FormControl>
                                                        <SelectTrigger className="w-full sm:w-[240px]">
                                                            <SelectValue placeholder="Select SQL type" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="sqlserver">SQL Server</SelectItem>
                                                        <SelectItem value="oracle" disabled>Oracle Database</SelectItem>
                                                        <SelectItem value="mysql" disabled>MySQL</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormDescription>
                                                    Select the type of SQL you want to convert
                                                </FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="sqlQuery"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>SQL Query</FormLabel>
                                                <div className="space-y-1.5">
                                                    <div className="flex justify-end gap-2">
                                                        <TooltipProvider>
                                                            <Tooltip>
                                                                <TooltipTrigger asChild>
                                                                    <Button
                                                                        type="button"
                                                                        variant="outline"
                                                                        size="sm"
                                                                        onClick={handleFormatQuery}
                                                                        disabled={!sqlQuery || isFormatting}
                                                                        className="h-7 px-2 text-xs"
                                                                    >
                                                                        {isFormatting ? (
                                                                            <Loader2 className="h-3 w-3 animate-spin" />
                                                                        ) : (
                                                                            <AlignLeft className="h-3 w-3 mr-1" />
                                                                        )}
                                                                        Beautify
                                                                    </Button>
                                                                </TooltipTrigger>
                                                                <TooltipContent>
                                                                    <p>Format SQL with proper indentation</p>
                                                                </TooltipContent>
                                                            </Tooltip>
                                                        </TooltipProvider>

                                                        <TooltipProvider>
                                                            <Tooltip>
                                                                <TooltipTrigger asChild>
                                                                    <Button
                                                                        type="button"
                                                                        variant="outline"
                                                                        size="sm"
                                                                        onClick={handleMinifyQuery}
                                                                        disabled={!sqlQuery || isMinifying}
                                                                        className="h-7 px-2 text-xs"
                                                                    >
                                                                        {isMinifying ? (
                                                                            <Loader2 className="h-3 w-3 animate-spin" />
                                                                        ) : (
                                                                            <Minimize className="h-3 w-3 mr-1" />
                                                                        )}
                                                                        Minify
                                                                    </Button>
                                                                </TooltipTrigger>
                                                                <TooltipContent>
                                                                    <p>Compress SQL by removing whitespace</p>
                                                                </TooltipContent>
                                                            </Tooltip>
                                                        </TooltipProvider>
                                                    </div>
                                                    <FormControl>
                                                        <Textarea
                                                            placeholder="Paste your SQL query here or upload a file..."
                                                            className="font-mono min-h-[260px] resize-y"
                                                            {...field}
                                                            disabled={isConverting || isFormatting || isMinifying}
                                                        />
                                                    </FormControl>
                                                </div>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    {isConverting && (
                                        <div className="space-y-2 mb-6">
                                            <div className="flex justify-between text-xs">
                                                <span>Converting query...</span>
                                                <span>{Math.round(conversionProgress)}%</span>
                                            </div>
                                            <Progress value={conversionProgress} className="h-2" />
                                        </div>
                                    )}
                                </CardContent>
                                <CardFooter className="flex justify-between border-t pt-6">
                                    <Button
                                        variant="outline"
                                        type="button"
                                        onClick={resetForm}
                                        disabled={isConverting || !sqlQuery}
                                    >
                                        <RefreshCw className="mr-2 h-4 w-4" />
                                        Reset
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={isConverting || !sqlQuery}
                                        className="flex items-center gap-2"
                                    >
                                        {isConverting ? (
                                            <>
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                Converting...
                                            </>
                                        ) : (
                                            <>
                                                <ArrowRightLeft size={16} />
                                                Convert to PostgreSQL
                                            </>
                                        )}
                                    </Button>
                                </CardFooter>
                            </form>
                        </Form>
                    </Card>
                </TabsContent>

                <TabsContent value="output" className="mt-0">
                    <AnimatePresence mode="wait">
                        {convertedQuery ? (
                            <MotionDiv
                                key="results"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.3 }}
                            >
                                <Card className="border-2 shadow-lg">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2 text-xl">
                                            <Database size={20} className="text-primary" />
                                            Converted PostgreSQL Query
                                        </CardTitle>
                                        <CardDescription>
                                            Your SQL query has been converted to PostgreSQL format.
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        {warnings.length > 0 && (
                                            <MotionDiv
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 'auto' }}
                                                transition={{ duration: 0.3 }}
                                            >
                                                <Alert variant="warning" className="mb-6">
                                                    <AlertTriangle className="h-4 w-4" />
                                                    <AlertTitle>Conversion Warnings</AlertTitle>
                                                    <AlertDescription className="mt-2">
                                                        <ul className="list-disc pl-5 space-y-1">
                                                            {warnings.map((warning, index) => (
                                                                <li key={index}>{warning}</li>
                                                            ))}
                                                        </ul>
                                                    </AlertDescription>
                                                </Alert>
                                            </MotionDiv>
                                        )}

                                        <div className="relative rounded-md overflow-hidden border">
                                            <div className="absolute right-2 top-2 z-10 flex gap-2">
                                                <TooltipProvider>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Button
                                                                size="sm"
                                                                variant="secondary"
                                                                className="h-8 bg-primary/90 text-primary-foreground hover:bg-primary/70"
                                                                onClick={copyToClipboard}
                                                            >
                                                                {isCopying ? (
                                                                    <CheckCircle className="h-4 w-4" />
                                                                ) : (
                                                                    <Copy className="h-4 w-4" />
                                                                )}
                                                            </Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            <p>Copy SQL</p>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>
                                                <TooltipProvider>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Button
                                                                size="sm"
                                                                variant="secondary"
                                                                className="h-8 bg-primary/90 text-primary-foreground hover:bg-primary/70"
                                                                onClick={downloadQueryAsFile}
                                                            >
                                                                <DownloadCloud className="h-4 w-4" />
                                                            </Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            <p>Download SQL</p>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>
                                                <TooltipProvider>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Button
                                                                size="sm"
                                                                variant="secondary"
                                                                className="h-8 bg-primary/90 text-primary-foreground hover:bg-primary/70"
                                                                onClick={formatOutputQuery}
                                                                disabled={isFormatting}
                                                            >
                                                                {isFormatting ? (
                                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                                ) : (
                                                                    <AlignLeft className="h-4 w-4" />
                                                                )}
                                                            </Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            <p>Format SQL</p>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>
                                                <TooltipProvider>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Button
                                                                size="sm"
                                                                variant="secondary"
                                                                className="h-8 bg-primary/90 text-primary-foreground hover:bg-primary/70"
                                                                onClick={minifyOutputQuery}
                                                                disabled={isMinifying}
                                                            >
                                                                {isMinifying ? (
                                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                                ) : (
                                                                    <Minimize className="h-4 w-4" />
                                                                )}
                                                            </Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            <p>Minify SQL</p>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>
                                            </div>
                                            <SyntaxHighlighter
                                                language="sql"
                                                style={theme === 'dark' ? atomDark : prism}
                                                customStyle={{
                                                    margin: 0,
                                                    padding: '16px',
                                                    borderRadius: '0.375rem',
                                                    fontSize: '0.9rem',
                                                    minHeight: '260px'
                                                }}
                                                showLineNumbers={true}
                                                wrapLongLines={true}
                                            >
                                                {convertedQuery}
                                            </SyntaxHighlighter>
                                        </div>
                                    </CardContent>
                                    <CardFooter className="flex justify-between border-t pt-6">
                                        <Button
                                            variant="outline"
                                            onClick={() => setCurrentTab('input')}
                                            className="flex items-center gap-2"
                                        >
                                            <Code size={16} />
                                            Back to Editor
                                        </Button>
                                        <Button
                                            onClick={form.handleSubmit(onSubmit)}
                                            disabled={isConverting}
                                            className="flex items-center gap-2"
                                        >
                                            {isConverting ? (
                                                <>
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                    Converting...
                                                </>
                                            ) : (
                                                <>
                                                    <RefreshCw size={16} />
                                                    Convert Again
                                                </>
                                            )}
                                        </Button>
                                    </CardFooter>
                                </Card>
                            </MotionDiv>
                        ) : (
                            <MotionDiv
                                key="no-results"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="flex flex-col items-center justify-center h-[400px] bg-muted/30 rounded-lg border-2 border-dashed p-8 text-center"
                            >
                                <Database className="h-16 w-16 text-muted-foreground/40 mb-4" />
                                <h3 className="text-lg font-medium mb-2">No Query Converted Yet</h3>
                                <p className="text-muted-foreground max-w-md">
                                    Enter your SQL query in the Source SQL tab and click &#34;Convert to PostgresSQL&#34; to see the results here.
                                </p>
                                <Button
                                    variant="default"
                                    className="mt-6"
                                    onClick={() => setCurrentTab('input')}
                                >
                                    Go to SQL Editor
                                </Button>
                            </MotionDiv>
                        )}
                    </AnimatePresence>
                </TabsContent>
            </Tabs>

            {/* Feature Highlights */}
            <div className="grid gap-6 md:grid-cols-4 mt-6">
                <Card className="transition-all hover:border-primary/50 hover:shadow-md">
                    <CardHeader className="p-4">
                        <CardTitle className="flex items-center gap-2 text-base">
                            <AlertTriangle size={18} className="text-amber-500" />
                            Smart Error Detection
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="px-4 pb-4 text-sm text-muted-foreground">
                        Our tool automatically detects and warns about potential issues in your SQL migration, helping you avoid common pitfalls.
                    </CardContent>
                </Card>

                <Card className="transition-all hover:border-primary/50 hover:shadow-md">
                    <CardHeader className="p-4">
                        <CardTitle className="flex items-center gap-2 text-base">
                            <RefreshCw size={18} className="text-primary" />
                            Multi-Database Support
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="px-4 pb-4 text-sm text-muted-foreground">
                        Easily convert from SQL Server, Oracle, or MySQL to PostgreSQL with proper syntax and function mapping.
                    </CardContent>
                </Card>

                <Card className="transition-all hover:border-primary/50 hover:shadow-md">
                    <CardHeader className="p-4">
                        <CardTitle className="flex items-center gap-2 text-base">
                            <AlignLeft size={18} className="text-blue-500" />
                            SQL Beautifier
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="px-4 pb-4 text-sm text-muted-foreground">
                        Format your SQL with proper indentation and spacing for better readability and maintainability.
                    </CardContent>
                </Card>

                <Card className="transition-all hover:border-primary/50 hover:shadow-md">
                    <CardHeader className="p-4">
                        <CardTitle className="flex items-center gap-2 text-base">
                            <Minimize size={18} className="text-green-500" />
                            SQL Minifier
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="px-4 pb-4 text-sm text-muted-foreground">
                        Compress your SQL by removing comments and unnecessary whitespace for smaller file sizes and improved performance.
                    </CardContent>
                </Card>
            </div>
        </MotionDiv>
    );
}