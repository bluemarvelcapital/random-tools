import React from 'react';
import { Page } from '@shopify/polaris';
import ResourceListWithViews from '../components/resourceLists/ResourceListWithViews';

function Home() {
  return (
    <Page title="Orders">
      <ResourceListWithViews />
    </Page>
  );
}

export default Home;
