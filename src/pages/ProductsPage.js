import React from 'react';
import { Page, Card, BlockStack } from '@shopify/polaris';
import { useAuth } from '../context/AuthContext';
import { gql, useQuery } from '@apollo/client';

const GET_PRODUCTS = gql`
  query GetProducts($vendorId: ID!) {
    products(vendorId: $vendorId) {
      id
      title
      description
      price
      stock
    }
  }
`;

function ProductsPage() {
  const { user } = useAuth();
  const { loading, error, data } = useQuery(GET_PRODUCTS, {
    variables: { vendorId: user?.email },
    skip: !user,
  });

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <Page title="Products">
      {data?.products.map(product => (
        <Card key={product.id} title={product.title} sectioned>
          <BlockStack>
            <p>{product.description}</p>
          </BlockStack>
        </Card>
      ))}
    </Page>
  );
}

export default ProductsPage;
