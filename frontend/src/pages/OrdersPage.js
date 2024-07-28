import React from 'react';
import { Page } from '@shopify/polaris';
import ResourceListWithViewsExample from '../components/resourceLists/ResourceListWithViews';
import OrderOverview from '../components/analytics/OrderOverview';
import { useAuth } from '../context/AuthContext';

function OrdersPage() {
  const { user } = useAuth();

  if (!user) {
    return <p>Loading...</p>;
    
  }

  return (
    <Page title="Orders">
      <OrderOverview />
      <ResourceListWithViewsExample />
    </Page>
  );
}

export default OrdersPage;
