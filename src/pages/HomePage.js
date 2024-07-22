import React from 'react';
import { useAuth } from '../context/AuthContext';

const HomePage = () => {
  const { user } = useAuth();

  if (!user) {
    return <p>Loading...</p>;
  }

  return (
    <div>
      <h1>Welcome, {user.email}!</h1>
      <p>This is the home page, accessible only to logged-in users.</p>
    </div>
  );
};

export default HomePage;
