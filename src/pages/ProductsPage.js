import React from 'react';
import { Page } from '@shopify/polaris';
import ResourceListExample from '../componenets/resourceLists/ResourceListExample';

function Home() {
  return (
    <Page title="Orders">
      <ResourceListExample />
    </Page>
  );
}

export default Home;
