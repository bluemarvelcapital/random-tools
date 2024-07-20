import React, { useEffect, useState } from 'react';
import { Avatar, ResourceList, ResourceItem, Text } from '@shopify/polaris';

const VendorsList = () => {
  const [vendors, setVendors] = useState([]);

  useEffect(() => {
    fetch('/api/vendors') // Replace with your actual API endpoint
      .then(response => response.json())
      .then(data => setVendors(data));
  }, []);

  return (
    <ResourceList
      resourceName={{ singular: 'vendor', plural: 'vendors' }}
      items={vendors}
      renderItem={(vendor) => {
        const { id, name, email, logoUrl } = vendor;
        const media = <Avatar customer size="medium" name={name} source={logoUrl} />;

        return (
          <ResourceItem
            id={id}
            media={media}
            accessibilityLabel={`View details for ${name}`}
          >
            <Text variant="bodyMd" fontWeight="bold" as="h3">
              {name}
            </Text>
            <div>{email}</div>
          </ResourceItem>
        );
      }}
    />
  );
};

export default VendorsList;
