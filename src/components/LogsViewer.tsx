'use client';

import { useState, useEffect } from 'react';
import { logsService } from '@/lib/api';
import toast from 'react-hot-toast';

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
            toast.error('Failed to fetch logs');
        } finally {
            setIsLoading(false);
        }
    };

    const getSeverityColor = (severity: string) => {
        switch (severity.toLowerCase()) {
            case 'high':
            case 'critical':
                return 'bg-red-100 text-red-800';
            case 'medium':
                return 'bg-yellow-100 text-yellow-800';
            case 'low':
                return 'bg-blue-100 text-blue-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getTypeIcon = (type: string) => {
        switch (type.toLowerCase()) {
            case 'error':
                return '❌';
            case 'warning':
                return '⚠️';
            case 'info':
                return 'ℹ️';
            case 'success':
                return '✅';
            default:
                return '📝';
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-md">
            <div className="p-4 border-b flex justify-between items-center">
                <h2 className="text-xl text-gray-700 font-semibold">System Logs</h2>
                <button
                    onClick={fetchLogs}
                    className="text-sm text-blue-600 hover:text-blue-800"
                >
                    Refresh
                </button>
            </div>

            {isLoading ? (
                <div className="p-8 text-center text-gray-500">Loading logs...</div>
            ) : logs.length === 0 ? (
                <div className="p-8 text-center text-gray-500">No logs found</div>
            ) : (
                <>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Endpoint</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Severity</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                            </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                            {logs.map((log) => (
                                <tr
                                    key={log.log_id}
                                    className="hover:bg-gray-50 cursor-pointer"
                                    onClick={() => setSelectedLog(log)}
                                >
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span>{getTypeIcon(log.log_type)}</span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {new Date(log.created_at).toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {log.log_endpoint}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getSeverityColor(log.log_severity)}`}>
                        {log.log_severity}
                      </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {log.log_title}
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>

                    {selectedLog && (
                        <div className="p-4 border-t bg-gray-50">
                            <div className="mb-2 flex justify-between">
                                <h3 className="font-semibold">{selectedLog.log_title}</h3>
                                <button
                                    onClick={() => setSelectedLog(null)}
                                    className="text-gray-500 hover:text-gray-700"
                                >
                                    Close
                                </button>
                            </div>
                            <div className="bg-white p-3 rounded border overflow-auto max-h-64">
                                <pre className="text-sm whitespace-pre-wrap">{selectedLog.log_message}</pre>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}