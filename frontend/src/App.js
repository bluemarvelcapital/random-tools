import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import OrdersPage from './pages/OrdersPage';
import ProductsPage from './pages/ProductsPage';
import CustomersPage from './pages/CustomersPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import PrivateRoute from './components/PrivateRoute'; // Import PrivateRoute
import { AppProvider } from '@shopify/polaris';
import '@shopify/polaris/build/esm/styles.css';

function App() {
  return (
    <AppProvider i18n={{}}>
      <Layout>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route 
            path="/" 
            element={
              <PrivateRoute>
                <HomePage />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/orders" 
            element={
              <PrivateRoute>
                <OrdersPage />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/products" 
            element={
              <PrivateRoute>
                <ProductsPage />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/customers" 
            element={
              <PrivateRoute>
                <CustomersPage />
              </PrivateRoute>
            } 
          />
        </Routes>
      </Layout>
    </AppProvider>
  );
}

export default App;