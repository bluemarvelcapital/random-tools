import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const PrivateRoute = ({ children }) => {
  const { user, setUser } = useAuth();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const storedUser = JSON.parse(localStorage.getItem('user'));
        if (storedUser) {
          setUser(storedUser);
        } else {
          const response = await axios.get(`${process.env.REACT_APP_API_URL}/auth/current-session`, { withCredentials: true });
          if (response.data) {
            setUser(response.data);
            localStorage.setItem('user', JSON.stringify(response.data));
          } else {
            setUser(null);
          }
        }
      } catch (error) {
        console.error('Error fetching user', error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };
    checkUser();
  }, [setUser]);

  if (isLoading) {
    return <div>Loading...</div>; 
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  return children;
};

export default PrivateRoute;
