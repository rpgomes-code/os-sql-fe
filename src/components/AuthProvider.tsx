'use client';

import { useEffect, useState } from 'react';
import { useAtom } from 'jotai';
import { tokenAtom, isAuthenticatedAtom, initAuth } from '@/store/auth';
import { authService } from '@/lib/api';
import { toast } from "sonner";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    KeyRound,
    LogOut,
    ShieldCheck,
    Lock,
    Unlock,
    RefreshCw,
    CheckCircle,
    AlertCircle
} from 'lucide-react';
import { MotionDiv } from '@/components/motion';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from '@/components/ui/badge';
import { AnimatePresence } from 'framer-motion';

export default function AuthProvider({ children }: { children: React.ReactNode }) {
    const [token, setToken] = useAtom(tokenAtom);
    const [isAuthenticated, setIsAuthenticated] = useAtom(isAuthenticatedAtom);
    const [isLoading, setIsLoading] = useState(false);
    const [tokenExpiry, setTokenExpiry] = useState<Date | null>(null);
    const [progress, setProgress] = useState(100);

    // Periodically check token validity and update expiration progress
    useEffect(() => {
        let interval: NodeJS.Timeout;

        if (isAuthenticated && token) {
            // Get token expiration from localStorage
            const tokenExpiration = localStorage.getItem('tokenExpiration');
            if (tokenExpiration) {
                setTokenExpiry(new Date(tokenExpiration));
            }

            interval = setInterval(() => {
                const expiration = localStorage.getItem('tokenExpiration');
                if (expiration) {
                    const expiryDate = new Date(expiration);
                    const now = new Date();
                    const totalTime = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
                    const timeLeft = expiryDate.getTime() - now.getTime();
                    const progressValue = Math.max(0, Math.min(100, (timeLeft / totalTime) * 100));

                    setProgress(progressValue);

                    // Token is about to expire (less than 10 minutes)
                    if (timeLeft < 10 * 60 * 1000 && timeLeft > 0) {
                        toast.warning("Authentication token is about to expire", {
                            description: "Your session will expire soon. Consider refreshing your token.",
                            duration: 10000,
                            action: {
                                label: "Refresh Token",
                                onClick: () => login()
                            }
                        });
                    }

                    // Token has expired
                    if (timeLeft <= 0) {
                        toast.error("Authentication token has expired", {
                            description: "Your session has expired. Please log in again.",
                        });
                        logout();
                    }
                }
            }, 60000); // Check every minute

            // Immediate first check
            const expiration = localStorage.getItem('tokenExpiration');
            if (expiration) {
                const expiryDate = new Date(expiration);
                const now = new Date();
                const totalTime = 24 * 60 * 60 * 1000;
                const timeLeft = expiryDate.getTime() - now.getTime();
                const progressValue = Math.max(0, Math.min(100, (timeLeft / totalTime) * 100));

                setProgress(progressValue);

                // If token has already expired
                if (timeLeft <= 0) {
                    toast.error("Authentication token has expired", {
                        description: "Your session has expired. Please log in again.",
                    });
                    logout();
                }
            }
        }

        return () => {
            clearInterval(interval);
        };
    }, [isAuthenticated, token]);

    // Initialize auth on component mount
    useEffect(() => {
        initAuth();
    }, []);

    const login = async () => {
        setIsLoading(true);
        try {
            const response = await authService.generateToken();
            const newToken = response.token;
            const expiresIn = response.expires_in;

            localStorage.setItem('bearerToken', newToken);
            localStorage.setItem('tokenExpiration', expiresIn);
            setToken(newToken);
            setIsAuthenticated(true);
            setTokenExpiry(new Date(expiresIn));

            toast.success("Authentication successful", {
                icon: <CheckCircle className="text-green-500 h-5 w-5" />,
                description: "You now have access to all features of the SQL Migration Tool.",
            });
            return true;
        } catch (error) {
            toast.error("Authentication failed", {
                icon: <AlertCircle className="text-destructive h-5 w-5" />,
                description: "There was an error generating your authentication token. Please try again.",
            });
            console.error('Error generating token:', error);
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    const logout = async () => {
        setIsLoading(true);
        try {
            if (token) {
                await authService.revokeToken(token);
            }
        } catch (error) {
            console.error('Error revoking token:', error);
        } finally {
            localStorage.removeItem('bearerToken');
            localStorage.removeItem('tokenExpiration');
            setToken(null);
            setIsAuthenticated(false);
            setTokenExpiry(null);
            setIsLoading(false);
            toast.success("Logged out successfully");
        }
    };

    const getTokenTimeRemaining = () => {
        if (!tokenExpiry) return '';

        const now = new Date();
        const timeLeftMs = tokenExpiry.getTime() - now.getTime();

        if (timeLeftMs <= 0) return 'Expired';

        const hours = Math.floor(timeLeftMs / (1000 * 60 * 60));
        const minutes = Math.floor((timeLeftMs % (1000 * 60 * 60)) / (1000 * 60));

        return `${hours}h ${minutes}m remaining`;
    };

    const getProgressColor = () => {
        if (progress > 50) return 'bg-green-500';
        if (progress > 20) return 'bg-amber-500';
        return 'bg-red-500';
    };

    return (
        <div className="min-h-[calc(100vh-15rem)] max-w-10/12 mx-auto">
            <AnimatePresence mode="wait">
                {!isAuthenticated ? (
                    <MotionDiv
                        key="login"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.5 }}
                        className="w-full"
                    >
                        <Card className="max-w-1/4 mx-auto border-2 shadow-lg overflow-hidden pt-0">
                            <CardHeader className="bg-primary/10 border-b p-8">
                                <div className="flex justify-center mb-4">
                                    <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center">
                                        <Lock className="h-8 w-8 text-primary" />
                                    </div>
                                </div>
                                <CardTitle className="text-xl text-center">Authentication Required</CardTitle>
                                <CardDescription className="text-center">
                                    Secure access to the SQL Migration Tool
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="flex flex-col items-center pt-6 pb-4 px-6">
                                <p className="mb-6 text-muted-foreground text-center">
                                    You need to authenticate to use the SQL Migration Tool. Click the button below to generate a secure authentication token.
                                </p>
                                <div className="grid gap-6 w-full">
                                    <div className="bg-muted/40 rounded-md p-4 border border-dashed">
                                        <div className="flex items-center gap-2 mb-2">
                                            <ShieldCheck className="h-4 w-4 text-primary" />
                                            <h3 className="font-medium text-sm">Secure Authentication</h3>
                                        </div>
                                        <p className="text-xs text-muted-foreground">Your token has a 24-hour validity period and is securely stored in your browser.</p>
                                    </div>

                                    <Button
                                        onClick={login}
                                        disabled={isLoading}
                                        className="w-full"
                                    >
                                        {isLoading ? (
                                            <>
                                                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                                                Generating Token...
                                            </>
                                        ) : (
                                            <>
                                                <KeyRound className="mr-2 h-4 w-4" />
                                                Generate Token & Login
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </MotionDiv>
                ) : (
                    <MotionDiv
                        key="authenticated"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.5 }}
                        className="w-full"
                    >
                        <div className="flex items-center justify-between py-4 mb-8 rounded-lg bg-muted/30 px-4 border w-full">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                                    <Unlock className="h-4 w-4 text-primary" />
                                </div>
                                <div className="flex flex-col gap-1">
                                    <div className="flex items-center gap-2">
                                        <p className="text-sm font-medium">Authenticated User</p>
                                        <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-900/50">
                                            Active
                                        </Badge>
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        Token: {token?.substring(0, 8)}...{token?.substring(token.length - 8)}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="hidden sm:block">
                                    <p className="text-xs text-muted-foreground mb-1">Token Validity</p>
                                    <div className="w-40 h-2 bg-muted rounded-full overflow-hidden">
                                        <div
                                            className={`h-full ${getProgressColor()}`}
                                            style={{ width: `${progress}%` }}
                                        />
                                    </div>
                                    <p className="text-xs mt-1">{getTokenTimeRemaining()}</p>
                                </div>

                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={login}
                                                disabled={isLoading}
                                                className="text-xs"
                                            >
                                                <RefreshCw className="mr-1 h-3 w-3" />
                                                Refresh
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>Generate a new token</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>

                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={logout}
                                                disabled={isLoading}
                                                className="text-xs text-muted-foreground"
                                            >
                                                <LogOut className="mr-1 h-3 w-3" />
                                                Logout
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>End your session</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            </div>
                        </div>
                        <div className="w-full">
                            {children}
                        </div>
                    </MotionDiv>
                )}
            </AnimatePresence>
        </div>
    );
}