'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import toast from 'react-hot-toast';
import { sqlMigrationService } from '@/lib/api';

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
                toast.success('Query converted successfully');
            } else {
                setConvertedQuery('');
                setWarnings(result.warnings || ['Conversion failed']);
                toast.error('Conversion failed');
            }
        } catch (error) {
            console.error('Error converting query:', error);
            toast.error('Error connecting to the API');
        } finally {
            setIsConverting(false);
        }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(convertedQuery);
        toast.success('Copied to clipboard');
    };

    return (
        <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl text-gray-700 font-semibold mb-4">SQL Server to PostgreSQL Converter</h2>

            <form onSubmit={handleSubmit(onSubmit)}>
                <div className="mb-4">
                    <label htmlFor="sqlQuery" className="block text-sm font-medium text-gray-700 mb-1">
                        SQL Server Query
                    </label>
                    <textarea
                        id="sqlQuery"
                        rows={8}
                        className="w-full p-3 border border-gray-300 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Paste your SQL Server query here..."
                        {...register('sqlQuery', { required: 'Query is required' })}
                    ></textarea>
                    {errors.sqlQuery && (
                        <p className="mt-1 text-sm text-red-600">{errors.sqlQuery.message}</p>
                    )}
                </div>

                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={isConverting}
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition disabled:bg-blue-400"
                    >
                        {isConverting ? 'Converting...' : 'Convert Query'}
                    </button>
                </div>
            </form>

            {warnings.length > 0 && (
                <div className="mt-6 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                    <h3 className="text-sm font-semibold text-yellow-800 mb-2">Warnings</h3>
                    <ul className="list-disc pl-5 text-sm text-yellow-700">
                        {warnings.map((warning, index) => (
                            <li key={index}>{warning}</li>
                        ))}
                    </ul>
                </div>
            )}

            {convertedQuery && (
                <div className="mt-6">
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="text-sm font-semibold text-gray-700">PostgreSQL Query</h3>
                        <button
                            onClick={copyToClipboard}
                            className="text-xs text-blue-600 hover:text-blue-800"
                        >
                            Copy to Clipboard
                        </button>
                    </div>
                    <div className="relative rounded-md overflow-hidden">
                        <SyntaxHighlighter
                            language="sql"
                            style={atomDark}
                            customStyle={{ margin: 0, padding: '16px', borderRadius: '0.375rem' }}
                        >
                            {convertedQuery}
                        </SyntaxHighlighter>
                    </div>
                </div>
            )}
        </div>
    );
}