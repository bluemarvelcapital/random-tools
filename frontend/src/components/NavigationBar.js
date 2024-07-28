 
import { Navigation } from '@shopify/polaris';
import {
  HomeIcon,
  OrderIcon,
  ProductIcon,
  PersonIcon,
  InventoryIcon,
  ChartLineIcon,
  ProfileIcon,
  PaymentIcon,
  QuestionCircleIcon,
} from '@shopify/polaris-icons';
import { useLocation } from 'react-router-dom';
import React from 'react';

export default function NavigationBar() {
  const location = useLocation();
  const currentPath = location.pathname;

  return (
    <Navigation location={currentPath}>
      <Navigation.Section
        items={[
          {
            url: '/',
            label: 'Home',
            icon: HomeIcon,
            selected: currentPath === '/',
          },
          {
            url: '/orders',
            label: 'Orders',
            icon: OrderIcon,
            selected: currentPath === '/orders',
          },
          {
            url: '/products',
            label: 'Products',
            icon: ProductIcon,
            selected: currentPath === '/products',
          },
          {
            url: '/customers',
            label: 'Customers',
            icon: PersonIcon,
            selected: currentPath === '/customers',
          },
          {
            url: '/inventory',
            label: 'Inventory',
            icon: InventoryIcon,
            selected: currentPath === '/inventory',
          },
          {
            url: '/analytics',
            label: 'Analytics',
            icon: ChartLineIcon,
            selected: currentPath === '/analytics',
          },
          {
            url: '/profile',
            label: 'Profile Settings',
            icon: ProfileIcon,
            selected: currentPath === '/profile',
          },
          {
            url: '/payments',
            label: 'Payments',
            icon: PaymentIcon,
            selected: currentPath === '/payments',
          },
          {
            url: '/support',
            label: 'Support',
            icon: QuestionCircleIcon,
            selected: currentPath === '/support',
          },
        ]}
      />
    </Navigation>
  );
}
