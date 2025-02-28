'use client';

import { useEffect } from 'react';

export default function Error({
                                  error,
                                  reset,
                              }: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <div className="min-h-[60vh] flex items-center justify-center">
            <div className="text-center p-8 bg-white rounded-lg shadow-md max-w-md">
                <h2 className="text-2xl font-bold text-red-600 mb-4">Something went wrong</h2>
                <p className="text-gray-600 mb-6">{error.message || 'An unexpected error occurred'}</p>
                <button
                    onClick={reset}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                >
                    Try again
                </button>
            </div>
        </div>
    );
}