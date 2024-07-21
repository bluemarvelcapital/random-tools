import React from 'react';
import { Page } from '@shopify/polaris';
import ResourceListWithViewsExample from '../components/resourceLists/ResourceListWithViews';
import OrderOverview from '../components/analytics/OrderOverview';

function OrdersPage() {
  return (
    <Page title="Orders">
      <OrderOverview />
      <ResourceListWithViewsExample />
    </Page>
  );
}

export default OrdersPage;
