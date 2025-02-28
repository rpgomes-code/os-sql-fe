'use client';

import { useEffect } from 'react';
import { useAtom } from 'jotai';
import { tokenAtom, isAuthenticatedAtom, initAuth } from '@/store/auth';
import { authService } from '@/lib/api';
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { KeyRound, LogOut } from 'lucide-react';
import { MotionDiv } from '@/components/motion';

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

            toast.success("Authentication successful");
            return true;
        } catch (error) {
            toast.error("Authentication failed");
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
            toast.success("Logged out successfully");
        }
    };

    return (
        <div>
            {!isAuthenticated ? (
                <MotionDiv
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                >
                    <Card className="max-w-md mx-auto mt-8">
                        <CardHeader className="text-center">
                            <CardTitle className="text-xl">Authentication Required</CardTitle>
                        </CardHeader>
                        <CardContent className="flex flex-col items-center">
                            <p className="mb-6 text-muted-foreground text-center">
                                You need to authenticate to use the SQL Migration Tool
                            </p>
                            <Button onClick={login} className="flex items-center gap-2">
                                <KeyRound size={16} />
                                Generate Token & Login
                            </Button>
                        </CardContent>
                    </Card>
                </MotionDiv>
            ) : (
                <>
                    <div className="flex justify-end mb-4">
                        <Button variant="ghost" size="sm" onClick={logout} className="text-muted-foreground flex items-center gap-1">
                            <LogOut size={14} />
                            Logout
                        </Button>
                    </div>
                    <MotionDiv
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        {children}
                    </MotionDiv>
                </>
            )}
        </div>
    );
}