// src/components/Layout.js
import { AppProvider, Frame, TopBar } from '@shopify/polaris';
import NavigationBar from './NavigationBar';
import { useState, useCallback } from 'react';
import enTranslations from '@shopify/polaris/locales/en.json';
import React from 'react';

function Layout({ children }) {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const handleUserMenuToggle = useCallback(() => {
    setIsUserMenuOpen((isUserMenuOpen) => !isUserMenuOpen);
  }, []);

  const topBarMarkup = (
    <TopBar
      showNavigationToggle
      userMenu={
        <TopBar.UserMenu
          actions={[{ items: [{ content: 'Logout' }] }]}
          name="User Name"
          initials="UN"
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
