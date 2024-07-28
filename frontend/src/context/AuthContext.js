import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const storedUser = JSON.parse(localStorage.getItem('user'));
        if (storedUser) {
          setUser(storedUser);
        } else {
          const response = await axios.get(`${process.env.REACT_APP_API_URL}/auth/current-session`, { withCredentials: true });
          if (response.data) {
            setUser(response.data);
            localStorage.setItem('user', JSON.stringify(response.data));
          }
        }
      } catch (error) {
        console.error('Error fetching user', error);
      }
    };

    fetchUser();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/auth/login`, { email, password }, { withCredentials: true });
      const user = response.data;
      setUser(user);
      localStorage.setItem('user', JSON.stringify(user));
      navigate('/');
    } catch (error) {
      console.error('Login failed', error);
    }
  };

  const register = async (email, password) => {
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/auth/register`, { email, password }, { withCredentials: true });
      navigate('/login');
    } catch (error) {
      console.error('Registration failed', error);
    }
  };

  const logout = async () => {
    try {
      await axios.get(`${process.env.REACT_APP_API_URL}/auth/logout`, { withCredentials: true });
      setUser(null);
      localStorage.removeItem('user');
      navigate('/login');
    } catch (error) {
      console.error('Logout failed', error);
    }
  };
  

  return (
    <AuthContext.Provider value={{ user, setUser, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
