import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { BrowserRouter as Router } from 'react-router-dom';
import { ApolloProvider } from '@apollo/client';
import client from './config/ApolloClient';
import { AuthProvider } from './context/AuthContext'; // Make sure this path is correct

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ApolloProvider client={client}>
      <Router>
        <AuthProvider>  
          <App />
        </AuthProvider>
      </Router>
    </ApolloProvider>
  </React.StrictMode>
);

reportWebVitals();
