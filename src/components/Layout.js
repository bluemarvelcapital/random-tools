 
import { AppProvider, Frame, TopBar } from '@shopify/polaris';
import NavigationBar from './NavigationBar';
import { useState, useCallback } from 'react';
import enTranslations from '@shopify/polaris/locales/en.json';
import React from 'react';
import { useAuth } from '../context/AuthContext'; // Import useAuth from AuthContext

function Layout({ children }) {
  const { user, logout } = useAuth(); // Get user and logout function from useAuth
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const handleUserMenuToggle = useCallback(() => {
    setIsUserMenuOpen((isUserMenuOpen) => !isUserMenuOpen);
  }, []);

  const handleLogout = useCallback(() => {
    logout();
  }, [logout]);

  const topBarMarkup = (
    <TopBar
      showNavigationToggle
      userMenu={
        <TopBar.UserMenu
          actions={[{ items: [{ content: 'Logout', onAction: handleLogout }] }]}
          name={user ? user.email : 'User Name'}
          initials={user ? user.email[0].toUpperCase() : 'UN'}
          open={isUserMenuOpen}
          onToggle={handleUserMenuToggle}
        />
      }
    />
  );

  return (
    <AppProvider i18n={enTranslations}>
      <Frame topBar={topBarMarkup} navigation={<NavigationBar />}>
        {children}
      </Frame>
    </AppProvider>
  );
}

export default Layout;
