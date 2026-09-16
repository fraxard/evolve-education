import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getPublicUrl, getAdminUrl } from '../routes/paths';

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: 'student' | 'teacher' | 'admin';
  account_status: 'pending' | 'active' | 'rejected' | 'inactive';
  fullName?: string;
  studentId?: string;
  teacherId?: string;
}

interface AuthContextType {
  user: AuthenticatedUser | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string; user?: AuthenticatedUser }>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthenticatedUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshUser = useCallback(async () => {
    try {
      // 1. Check current host's session
      const res = await fetch('/api/auth/me', {
        credentials: 'include',
      });
      if (res.ok) {
        const data = await res.json();
        if (data.user) {
          setUser(data.user);
          setIsLoading(false);
          return;
        }
      }

      // 2. In local dev, if current host has no session, probe peer host for active session
      if (typeof window !== 'undefined') {
        const hostname = window.location.hostname.toLowerCase();
        const isLocalDev =
          hostname === 'localhost' ||
          hostname === 'admin.localhost' ||
          hostname.endsWith('.localhost');

        if (isLocalDev) {
          const peerOrigin =
            hostname === 'admin.localhost' || hostname.startsWith('admin.')
              ? getPublicUrl('')
              : getAdminUrl('');

          try {
            const peerRes = await fetch(`${peerOrigin}/api/auth/me`, {
              credentials: 'include',
            });
            if (peerRes.ok) {
              const peerData = await peerRes.json();
              if (peerData.user) {
                // Active session found on peer origin! Request SSO transfer ticket
                const ticketRes = await fetch(`${peerOrigin}/api/auth/sso-ticket`, {
                  method: 'POST',
                  credentials: 'include',
                });
                if (ticketRes.ok) {
                  const { ticket } = await ticketRes.json();
                  const target = window.location.pathname + window.location.search;
                  // Redirect through claim-ticket on current host to establish cookie
                  window.location.href = `/api/auth/claim-ticket?ticket=${ticket}&redirect=${encodeURIComponent(target)}`;
                  return;
                }
              }
            }
          } catch {
            // Peer unreachable or CORS prevented
          }
        }
      }

      setUser(null);
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const signIn = async (email: string, password: string) => {
    try {
      const res = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Failed to sign in.' };
      }

      setUser(data.user);
      return { success: true, user: data.user };
    } catch {
      return { success: false, error: 'Network error. Please try again.' };
    }
  };

  const signOut = async () => {
    try {
      // 1. Terminate on current host
      await fetch('/api/auth/signout', {
        method: 'POST',
        credentials: 'include',
      });

      // 2. Also clear peer host in local development
      if (typeof window !== 'undefined') {
        const hostname = window.location.hostname.toLowerCase();
        const isLocalDev =
          hostname === 'localhost' ||
          hostname === 'admin.localhost' ||
          hostname.endsWith('.localhost');

        if (isLocalDev) {
          const peerOrigin =
            hostname === 'admin.localhost' || hostname.startsWith('admin.')
              ? getPublicUrl('')
              : getAdminUrl('');

          await fetch(`${peerOrigin}/api/auth/signout`, {
            method: 'POST',
            credentials: 'include',
          }).catch(() => {});
        }
      }
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, signIn, signOut, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
