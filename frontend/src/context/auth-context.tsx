// src/context/auth-context.tsx
"use client";
import { createContext, useContext, useEffect, useState, useRef } from 'react';
import Cookies from 'js-cookie';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';
import { UserRole } from '@/components/auth/sign-up-form';

type User = {
  id: number;
  email: string;
  displayName: string;
  dateOfBirth: string;
  gender: string;
  heightCm: number;
  weightKg: number;
  createdAt: string;
  role: UserRole;
  imageUrl: string;
}

type OAuthProvider = 'github' | 'microsoft';

type AuthContextType = {
  user: User | null;
  loading: boolean;
  token: string | null;
  signUp: (email: string, password: string, displayName: string, role: UserRole) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  loginWithOAuth: (provider: OAuthProvider) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

const getDefaultDashboard = (role: UserRole): string => {
  switch (role) {
    case UserRole.ADMIN:
      return '/dashboard/admin/dashboard';
    case UserRole.GYM_OWNER:
      return '/dashboard/gym-owner/dashboard';
    case UserRole.REGULAR_USER:
      return '/dashboard/statistics';
    default:
      return '/dashboard/statistics';
  }
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(Cookies.get('token') || null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const hasRedirected = useRef(false);
  const isInitialized = useRef(false);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (token && !isInitialized.current) {
        try {
          setLoading(true);
          const { data } = await api.get('/users/profile');
          console.log('Profile Data:', data);
          setUser(data.data);
          isInitialized.current = true;
        } catch (error) {
          console.error('Failed to fetch user profile');
          logout();
        } finally {
          setLoading(false);
        }
      } else if (!token) {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [token]);

  useEffect(() => {
    const urlToken = new URLSearchParams(window.location.search).get('token');
    if (urlToken && !hasRedirected.current) {
      window.history.replaceState({}, document.title, window.location.pathname);

      Cookies.set('token', urlToken, {
        expires: 7,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
      });
      setToken(urlToken);
      hasRedirected.current = true;

      router.push('/dashboard/statistics');
    }
  }, [router]);

  useEffect(() => {
    if (user && !loading && !hasRedirected.current && isInitialized.current) {
      const currentPath = window.location.pathname;

      const shouldRedirect = [
        // '/dashboard/statistics', // to be remove
        '/dashboard',
        '/'
      ].includes(currentPath);

      if (shouldRedirect) {
        hasRedirected.current = true;
        const expectedDashboard = getDefaultDashboard(user.role);
        console.log(`Auth Context: Redirecting ${user.role} from ${currentPath} to ${expectedDashboard}`);
        router.push(expectedDashboard);
      }
    }
  }, [user, loading, router]);

  const loginWithOAuth = (provider: 'github' | 'microsoft') => {
    window.location.href = `http://localhost:5000/api/auth/${provider}`;
  };

  const signUp = async (email: string, password: string, displayName: string, role: UserRole) => {
    try {
      setLoading(true);
      const { data } = await api.post('/auth/register', { email, password, displayName, role });

      const newToken = data.data.token;

      Cookies.set('token', newToken, {
        expires: 7,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
      });
      setToken(newToken);
      hasRedirected.current = true;
      isInitialized.current = false; 
    } catch (error) {
      console.error('SignUp Error:', error);
      throw error;
    }
  }

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { data } = await api.post('/auth/login', { email, password });

      const newToken = data.data.token;

      Cookies.set('token', newToken, {
        expires: 7,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
      });

      setToken(newToken);
      hasRedirected.current = true;
      isInitialized.current = false; 

    } catch (error) {
      console.error('Login Error:', error);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    hasRedirected.current = false;
    isInitialized.current = false;
    Cookies.remove('token');
  };

  return (
    <AuthContext.Provider value={{ user, loading, token, login, logout, loginWithOAuth, signUp }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
