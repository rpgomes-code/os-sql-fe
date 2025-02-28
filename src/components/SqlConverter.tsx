'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { toast } from "sonner";
import { sqlMigrationService } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Clipboard, AlertTriangle, Database, ArrowRightLeft } from 'lucide-react';
import { MotionDiv } from '@/components/motion';
import { cn } from '@/lib/utils';

type FormData = {
    sqlQuery: string;
};

export default function SqlConverter() {
    const [isConverting, setIsConverting] = useState(false);
    const [convertedQuery, setConvertedQuery] = useState('');
    const [warnings, setWarnings] = useState<string[]>([]);

    const { register, handleSubmit, formState: { errors } } = useForm<FormData>();

    const onSubmit = async (data: FormData) => {
        setIsConverting(true);
        try {
            const result = await sqlMigrationService.convertQuery(data.sqlQuery);

            if (result.success) {
                setConvertedQuery(result.converted_query);
                setWarnings(result.warnings || []);
                toast.success("Query converted successfully");
            } else {
                setConvertedQuery('');
                setWarnings(result.warnings || ['Conversion failed']);
                toast.error("Conversion failed");
            }
        } catch (error) {
            console.error('Error converting query:', error);
            toast.error("Error connecting to the API");
        } finally {
            setIsConverting(false);
        }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(convertedQuery);
        toast.success("SQL query copied to clipboard");
    };

    return (
        <MotionDiv
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
        >
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Database size={18} className="text-primary" />
                        SQL Server to PostgreSQL Converter
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <div className="mb-4">
                            <label htmlFor="sqlQuery" className="block text-sm font-medium mb-1">
                                SQL Server Query
                            </label>
                            <Textarea
                                id="sqlQuery"
                                rows={8}
                                placeholder="Paste your SQL Server query here..."
                                className={cn(errors.sqlQuery && "border-destructive")}
                                {...register('sqlQuery', { required: 'Query is required' })}
                            />
                            {errors.sqlQuery && (
                                <p className="mt-1 text-sm text-destructive">{errors.sqlQuery.message}</p>
                            )}
                        </div>

                        <div className="flex justify-end">
                            <Button
                                type="submit"
                                disabled={isConverting}
                                className="flex items-center gap-2"
                            >
                                {isConverting ? (
                                    <>
                                        <MotionDiv
                                            animate={{ rotate: 360 }}
                                            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                                            className="w-4 h-4 border-2 border-t-transparent border-white rounded-full"
                                        />
                                        Converting...
                                    </>
                                ) : (
                                    <>
                                        <ArrowRightLeft size={16} />
                                        Convert Query
                                    </>
                                )}
                            </Button>
                        </div>
                    </form>

                    {warnings.length > 0 && (
                        <MotionDiv
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            transition={{ duration: 0.3 }}
                            className="mt-6"
                        >
                            <Alert variant="warning">
                                <AlertTriangle className="h-4 w-4" />
                                <AlertTitle>Warnings</AlertTitle>
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

                    {convertedQuery && (
                        <MotionDiv
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                            className="mt-6"
                        >
                            <div className="flex justify-between items-center mb-2">
                                <div className="flex items-center gap-2">
                                    <Badge variant="outline" className="bg-primary/10 text-primary font-medium">PostgreSQL</Badge>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={copyToClipboard}
                                    className="flex items-center gap-1 text-xs"
                                >
                                    <Clipboard size={14} />
                                    Copy to Clipboard
                                </Button>
                            </div>
                            <div className="relative rounded-md overflow-hidden border">
                                <SyntaxHighlighter
                                    language="sql"
                                    style={atomDark}
                                    customStyle={{ margin: 0, padding: '16px', borderRadius: '0.375rem', fontSize: '0.9rem' }}
                                >
                                    {convertedQuery}
                                </SyntaxHighlighter>
                            </div>
                        </MotionDiv>
                    )}
                </CardContent>
            </Card>
        </MotionDiv>
    );
}