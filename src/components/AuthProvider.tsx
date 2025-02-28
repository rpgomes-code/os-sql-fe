'use client';

import { useEffect } from 'react';
import { useAtom } from 'jotai';
import { tokenAtom, isAuthenticatedAtom, initAuth } from '@/store/auth';
import { authService } from '@/lib/api';
import toast from 'react-hot-toast';

export default function AuthProvider({ children }: { children: React.ReactNode }) {
    const [token, setToken] = useAtom(tokenAtom);
    const [isAuthenticated, setIsAuthenticated] = useAtom(isAuthenticatedAtom);

    // Initialize auth on component mount
    useEffect(() => {
        initAuth();
    }, []);

    const login = async () => {
        try {
            const response = await authService.generateToken();
            const newToken = response.token;

            localStorage.setItem('bearerToken', newToken);
            setToken(newToken);
            setIsAuthenticated(true);

            toast.success('Authentication successful');
            return true;
        } catch (error) {
            toast.error('Authentication failed');
            return false;
        }
    };

    const logout = async () => {
        try {
            if (token) {
                await authService.revokeToken(token);
            }
        } catch (error) {
            console.error('Error revoking token:', error);
        } finally {
            localStorage.removeItem('bearerToken');
            setToken(null);
            setIsAuthenticated(false);
            toast.success('Logged out successfully');
        }
    };

    return (
        <div>
            {!isAuthenticated ? (
                <div className="text-center p-8 bg-white rounded-lg shadow-md max-w-md mx-auto mt-8">
                    <h2 className="text-xl font-semibold mb-4">Authentication Required</h2>
                    <p className="mb-4 text-gray-600">
                        You need to authenticate to use the SQL Migration Tool
                    </p>
                    <button
                        onClick={login}
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                    >
                        Generate Token & Login
                    </button>
                </div>
            ) : (
                <>
                    <div className="flex justify-end mb-4">
                        <button
                            onClick={logout}
                            className="text-sm text-gray-600 hover:text-gray-800"
                        >
                            Logout
                        </button>
                    </div>
                    {children}
                </>
            )}
        </div>
    );
}