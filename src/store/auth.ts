import { atom } from 'jotai';
import { authService } from '@/lib/api';

// Auth state atoms
export const tokenAtom = atom<string | null>(null);
export const isAuthenticatedAtom = atom<boolean>(false);

// Initialize from localStorage (only runs on client)
export const initAuth = () => {
    if (typeof window !== 'undefined') {
        const savedToken = localStorage.getItem('bearerToken');
        if (savedToken) {
            // Validate token before restoring
            authService.validateToken(savedToken)
                .then(isValid => {
                    if (isValid) {
                        tokenAtom.init = savedToken;
                        isAuthenticatedAtom.init = true;
                    } else {
                        // Clear invalid token
                        localStorage.removeItem('bearerToken');
                    }
                })
                .catch(() => {
                    localStorage.removeItem('bearerToken');
                });
        }
    }
};