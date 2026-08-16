import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

const API = 'http://localhost:5000/api';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  // Set axios default auth header whenever token changes
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [token]);

  // Setup Axios interceptor to automatically refresh tokens on 401
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        // If the error is 401 and we haven't retried yet
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            // Attempt to get a new token
            // Remember to send cookies for HTTP-only refresh token
            const res = await axios.get(`${API}/auth/refresh`, { withCredentials: true });
            
            if (res.data.token) {
              const newToken = res.data.token;
              localStorage.setItem('token', newToken);
              setToken(newToken);
              axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
              originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
              
              // Retry the original request with new token
              return axios(originalRequest);
            }
          } catch (refreshError) {
            console.error('[Auth] Refresh token expired or invalid:', refreshError.message);
            // If refresh fails, log the user out
            logout();
          }
        }
        
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, []);

  // On mount, verify token and load user
  useEffect(() => {
    const initAuth = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        // Check expiry of access token proactively
        if (payload.exp * 1000 < Date.now()) {
          // Instead of logging out, try to hit a protected route or refresh route directly
          // The interceptor will catch it or we can just proactively refresh
          const refreshRes = await axios.get(`${API}/auth/refresh`, { withCredentials: true });
          if (refreshRes.data.token) {
            const newToken = refreshRes.data.token;
            localStorage.setItem('token', newToken);
            setToken(newToken);
            axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
          } else {
            logout();
            return;
          }
        }
        
        // Fetch fresh user data
        const res = await axios.get(`${API}/auth/me`);
        setUser(res.data);
      } catch (e) {
        console.error('[Auth] Token validation failed:', e.message);
        // Interceptor might have handled refresh. If it still fails, logout.
        if (e.response?.status !== 401) {
           logout();
        }
      } finally {
        setLoading(false);
      }
    };
    initAuth();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const login = async (email, password) => {
    try {
      // Must include withCredentials to set the refresh token cookie
      const res = await axios.post(`${API}/auth/login`, { email, password }, { withCredentials: true });
      const { token: newToken, ...userData } = res.data;
      localStorage.setItem('token', newToken);
      setToken(newToken);
      setUser(userData);
      return { success: true, user: userData };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed. Please try again.',
      };
    }
  };

  const register = async (name, email, password) => {
    try {
      const res = await axios.post(`${API}/auth/register`, { name, email, password }, { withCredentials: true });
      const { token: newToken, ...userData } = res.data;
      localStorage.setItem('token', newToken);
      setToken(newToken);
      setUser(userData);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Registration failed. Please try again.',
      };
    }
  };

  const logout = async () => {
    try {
      await axios.post(`${API}/auth/logout`, {}, { withCredentials: true });
    } catch (e) {
      console.error('[Auth] Error during logout API call', e);
    }
    
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    delete axios.defaults.headers.common['Authorization'];
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
