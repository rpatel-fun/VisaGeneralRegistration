import React, {createContext, useContext, useEffect, useState} from 'react';
import {AuthService} from '../services/auth';
import {User, AuthState} from '../types';

interface AuthContextType extends AuthState {
  register: (data: {
    email: string;
    password: string;
    confirmPassword: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
  }) => Promise<{success: boolean; error?: string}>;
  login: (data: {email: string; password: string}) => Promise<{
    success: boolean;
    error?: string;
    lockedOut?: boolean;
    remainingTime?: number;
  }>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{children: React.ReactNode}> = ({
  children,
}) => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    isLoading: true,
  });

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    setAuthState(prev => ({...prev, isLoading: true}));
    const result = await AuthService.checkAuth();
    setAuthState({
      isAuthenticated: result.isAuthenticated,
      user: result.user || null,
      isLoading: false,
    });
  };

  const register = async (data: {
    email: string;
    password: string;
    confirmPassword: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
  }) => {
    setAuthState(prev => ({...prev, isLoading: true}));
    const result = await AuthService.register(data);
    if (result.success && result.user) {
      setAuthState({
        isAuthenticated: true,
        user: result.user,
        isLoading: false,
      });
    } else {
      setAuthState(prev => ({...prev, isLoading: false}));
    }
    return {
      success: result.success,
      error: result.error,
    };
  };

  const login = async (data: {email: string; password: string}) => {
    setAuthState(prev => ({...prev, isLoading: true}));
    const result = await AuthService.login(data);
    if (result.success && result.user) {
      setAuthState({
        isAuthenticated: true,
        user: result.user,
        isLoading: false,
      });
    } else {
      setAuthState(prev => ({...prev, isLoading: false}));
    }
    return result;
  };

  const logout = async () => {
    setAuthState(prev => ({...prev, isLoading: true}));
    await AuthService.logout();
    setAuthState({
      isAuthenticated: false,
      user: null,
      isLoading: false,
    });
  };

  return (
    <AuthContext.Provider
      value={{
        ...authState,
        register,
        login,
        logout,
        checkAuth,
      }}>
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

