import React from 'react';
import { Page } from '@shopify/polaris';
import LoginForm from '../components/auth/LoginForm';

const LoginPage = () => {
  return (
    <Page title="Login">
      <LoginForm />
    </Page>
  );
};

export default LoginPage;
