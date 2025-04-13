"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

interface User {
  email: string;
  name?: string;
}

interface AuthContextType {
  user: User | null;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Simple storage for demo purposes - in a real app, use a proper backend
const USERS_STORAGE_KEY = 'pack_together_users';
const SESSION_KEY = 'pack_together_session';

interface StoredUser extends User {
  password: string;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check for existing session
    try {
      const session = localStorage.getItem(SESSION_KEY);
      if (session) {
        const sessionUser = JSON.parse(session);
        setUser(sessionUser);
      }
    } catch (error) {
      console.error('Error reading session:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signUp = async (email: string, password: string, name: string) => {
    try {
      const users = JSON.parse(localStorage.getItem(USERS_STORAGE_KEY) || '[]') as StoredUser[];
      
      // Check if user already exists
      if (users.some(u => u.email === email)) {
        throw new Error('User already exists');
      }

      // Store new user
      const newUser = { email, password, name };
      users.push(newUser);
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));

      // Set session
      const sessionUser = { email, name };
      localStorage.setItem(SESSION_KEY, JSON.stringify(sessionUser));
      setUser(sessionUser);

      // Set cookie for middleware
      document.cookie = `pack_together_session=${JSON.stringify(sessionUser)}; path=/`;
    } catch (error) {
      console.error('Error during signup:', error);
      throw error;
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const users = JSON.parse(localStorage.getItem(USERS_STORAGE_KEY) || '[]') as StoredUser[];
      const user = users.find(u => u.email === email);

      if (!user || user.password !== password) {
        throw new Error('Invalid email or password');
      }

      // Set session
      const sessionUser = { email, name: user.name };
      localStorage.setItem(SESSION_KEY, JSON.stringify(sessionUser));
      setUser(sessionUser);

      // Set cookie for middleware
      document.cookie = `pack_together_session=${JSON.stringify(sessionUser)}; path=/`;
    } catch (error) {
      console.error('Error during login:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      // Clear all auth data
      localStorage.removeItem(SESSION_KEY);
      // Remove session cookie
      document.cookie = 'pack_together_session=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
      setUser(null);
      
      // Show success message
      toast.success('Logged out successfully');
      
      // Force redirect to login page
      window.location.href = '/login';
    } catch (error) {
      console.error('Error during logout:', error);
      toast.error('Failed to logout properly');
    }
  };

  return (
    <AuthContext.Provider value={{ user, signUp, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
} 