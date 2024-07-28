import React from 'react';
import { Page, Layout, Card, IndexTable, useIndexResourceState, ButtonGroup, Button } from '@shopify/polaris';

const customers = [
  {
    id: '1',
    name: 'Ayumu Hirano',
    emailSubscription: 'Not subscribed',
    location: 'N/A',
    orders: '0 orders',
    amountSpent: '£0.00',
  },
  {
    id: '2',
    name: 'Russell Winfield',
    emailSubscription: 'Not subscribed',
    location: 'Toronto, Canada',
    orders: '0 orders',
    amountSpent: '£0.00',
  },
  {
    id: '3',
    name: 'Karine Ruby',
    emailSubscription: 'Not subscribed',
    location: 'N/A',
    orders: '0 orders',
    amountSpent: '£0.00',
  },
];

function CustomersPage() {
  const { selectedResources, allResourcesSelected, handleSelectionChange } = useIndexResourceState(customers);
  
  const rowMarkup = customers.map(({id, name, emailSubscription, location, orders, amountSpent}, index) => (
    <IndexTable.Row
      id={id}
      key={id}
      selected={selectedResources.includes(id)}
      position={index}
    >
      <IndexTable.Cell>{name}</IndexTable.Cell>
      <IndexTable.Cell>{emailSubscription}</IndexTable.Cell>
      <IndexTable.Cell>{location}</IndexTable.Cell>
      <IndexTable.Cell>{orders}</IndexTable.Cell>
      <IndexTable.Cell>{amountSpent}</IndexTable.Cell>
    </IndexTable.Row>
  ));

  return (
    <Page
      title="Customers"
      primaryAction={{
        content: 'Add customer',
        onAction: () => console.log('Add customer clicked'),
      }}
    >
      <Layout>
        <Layout.Section>
          <Card sectioned>
            <ButtonGroup>
            <Button variant="primary" tone="critical">Cancel</Button>
              <Button> Save</Button>
              <Button variant="primary">Add customer</Button>
            </ButtonGroup>
          </Card>
          <Card>
            <IndexTable
              resourceName={{singular: 'customer', plural: 'customers'}}
              itemCount={customers.length}
              selectedItemsCount={allResourcesSelected ? 'All' : selectedResources.length}
              onSelectionChange={handleSelectionChange}
              headings={[
                {title: 'Customer name'},
                {title: 'Email subscription'},
                {title: 'Location'},
                {title: 'Orders'},
                {title: 'Amount spent'},
              ]}
            >
              {rowMarkup}
            </IndexTable>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}

export default CustomersPage;
