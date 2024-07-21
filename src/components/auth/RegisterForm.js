import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button, TextField, FormLayout } from '@shopify/polaris';

const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleRegister = async () => {
    try {
      await register(email, password);
    } catch (error) {
      console.error('Failed to register', error);
    }
  };

  return (
    <div style={{ maxWidth: '300px', margin: '0 auto' }}>
      <FormLayout>
        <TextField
          label="Email"
          value={email}
          onChange={(value) => setEmail(value)}
          autoComplete="email"
        />
        <TextField
          type="password"
          label="Password"
          value={password}
          onChange={(value) => setPassword(value)}
          autoComplete="password"
        />
        <Button primary onClick={handleRegister}>Register</Button>
      </FormLayout>
    </div>
  );
};

export default RegisterPage;
