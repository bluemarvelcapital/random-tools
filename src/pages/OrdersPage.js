import React from 'react';
import { Page, Layout } from '@shopify/polaris';
import ResourceListWithViewsExample from '../componenets/resourceLists/ResourceListWithViews';
import OrderOverview from '../componenets/analytics/OrderOverview';

function OrdersPage() {
  return (
    <Page title="Orders">
      <OrderOverview />
      <ResourceListWithViewsExample />
    </Page>
  );
}

export default OrdersPage;
