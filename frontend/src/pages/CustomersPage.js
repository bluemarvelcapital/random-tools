import React from 'react';
import { Page } from '@shopify/polaris';
import CustomersPage from '../components/customer/CustomersPage';

function Home() {
  return (
    <Page title="Orders">
      <CustomersPage />
    </Page>
  );
}

export default Home;
