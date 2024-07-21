import React from 'react';
import { Page } from '@shopify/polaris';
import RegisterForm from '../components/auth/RegisterForm';

const LoginPage = () => {
  return (
    <Page title="Login">
      <RegisterForm />
    </Page>
  );
};

export default LoginPage;
