import {
    TextField,
    Card,
    ResourceList,
    Filters,
    Button,
    Avatar,
    Text,
    Box,
    ChoiceList,
    RangeSlider,
  } from '@shopify/polaris';
  import { useState, useCallback } from 'react';
  
  function ResourceListWithFilterExample() {
    const emptyFilterState = {
      query: {
        label: 'Search',
        value: '',
      },
      paymentStatus: {
        label: 'Payment status',
        value: [],
      },
      fulfilmentStatus: {
        label: 'Fulfilment status',
        value: [],
      },
      moneySpent: {
        label: 'Money spent',
        value: [0, 0],
      },
      taggedWith: {
        label: 'Tagged with',
        value: '',
      },
    };
  
    const [queryValue, setQueryValue] = useState('');
    const [taggedWith, setTaggedWith] = useState('');
    const [moneySpent, setMoneySpent] = useState([0, 0]);
    const [paymentStatus, setPaymentStatus] = useState(['pending']);
    const [fulfilmentStatus, setFulfilmentStatus] = useState(['pending']);
    const [savedFilterState, setSavedFilterState] = useState(new Map(Object.entries(emptyFilterState)));
  
    const handleFilterChange = (key) => (value) => {
      if (key === 'taggedWith') setTaggedWith(value);
      if (key === 'moneySpent') setMoneySpent(value);
      if (key === 'paymentStatus') setPaymentStatus(value);
      if (key === 'fulfilmentStatus') setFulfilmentStatus(value);
    };
  
    const handleFilterRemove = (key) => {
      if (key === 'taggedWith') {
        setTaggedWith(emptyFilterState.taggedWith.value);
      } else if (key === 'moneySpent') {
        setMoneySpent(emptyFilterState.moneySpent.value);
      } else if (key === 'paymentStatus') {
        setPaymentStatus(emptyFilterState.paymentStatus.value);
      } else if (key === 'fulfilmentStatus') {
        setFulfilmentStatus(emptyFilterState.fulfilmentStatus.value);
      }
    };
  
    const handleFiltersQueryChange = (value) => setQueryValue(value);
  
    const handleQueryValueRemove = useCallback(() => setQueryValue(''), []);
  
    const handleFiltersClearAll = () => {
      Object.entries(emptyFilterState).forEach(([key]) => handleFilterRemove(key));
      handleQueryValueRemove();
    };
  
    const filters = [
      {
        key: 'paymentStatus',
        label: 'Payment status',
        value: paymentStatus,
        filter: (
          <ChoiceList
            title="Payment status"
            titleHidden
            choices={[
              { label: 'Pending', value: 'pending' },
              { label: 'Paid', value: 'paid' },
              { label: 'Failed', value: 'failed' },
              { label: 'Refunded', value: 'refunded' },
            ]}
            selected={paymentStatus}
            onChange={handleFilterChange('paymentStatus')}
            allowMultiple
          />
        ),
        shortcut: true,
        pinned: true,
      },
      {
        key: 'fulfilmentStatus',
        label: 'Fulfilment status',
        value: fulfilmentStatus,
        filter: (
          <ChoiceList
            title="Fulfilment status"
            titleHidden
            choices={[
              { label: 'Pending', value: 'pending' },
              { label: 'Processing', value: 'processing' },
              { label: 'Shipped', value: 'shipped' },
              { label: 'Delivered', value: 'delivered' },
              { label: 'Cancelled', value: 'cancelled' },
              { label: 'On Hold', value: 'on Hold' },
              { label: 'Refunded', value: 'Refunded' },
              { label: 'Partially Shipped', value: 'Partially Shipped' },
            ]}
            selected={fulfilmentStatus}
            onChange={handleFilterChange('fulfilmentStatus')}
            allowMultiple
          />
        ),
        shortcut: true,
        pinned: true,
      },
      {
        key: 'taggedWith',
        label: 'Tagged with',
        value: taggedWith,
        filter: (
          <TextField
            label="Tagged with"
            value={taggedWith}
            onChange={handleFilterChange('taggedWith')}
            autoComplete="off"
            labelHidden
          />
        ),
        shortcut: true,
        pinned: true,
      },
      {
        key: 'moneySpent',
        label: 'Money spent',
        value: moneySpent,
        filter: (
          <RangeSlider
            label="Money spent is between"
            labelHidden
            value={moneySpent}
            prefix="$"
            output
            min={0}
            max={2000}
            step={1}
            onChange={handleFilterChange('moneySpent')}
          />
        ),
      },
    ];
  
    const appliedFilters = [];
  
    filters.forEach(({ key, label, value }) => {
      if (!isEmpty(value)) {
        appliedFilters.push({
          key,
          label: `${label}: ${humanReadableValue(key, value)}`,
          unsavedChanges: !isUnchanged(key, value),
          onRemove: () => handleFilterRemove(key),
        });
      }
    });
  
    const handleSaveFilters = () => {
      const nextSavedFilterState = new Map(savedFilterState);
      appliedFilters.forEach(({ key, unsavedChanges }) => {
        const savedFilter = nextSavedFilterState.get(key);
        const value = filters.find((filter) => filter.key === key)?.value;
  
        if (value && unsavedChanges && savedFilter) {
          savedFilter.value = value;
        }
      });
  
      setSavedFilterState(nextSavedFilterState);
    };
  
    const disableAction = appliedFilters.every(({ unsavedChanges }) => !unsavedChanges);
  
    return (
      <div style={{ height: '568px' }}>
        <Card roundedAbove="sm" padding="0">
          <ResourceList
            resourceName={{ singular: 'customer', plural: 'customers' }}
            filterControl={
              <Filters
                queryValue={queryValue}
                queryPlaceholder="Searching in all"
                filters={filters}
                appliedFilters={appliedFilters}
                onQueryChange={handleFiltersQueryChange}
                onQueryClear={handleQueryValueRemove}
                onClearAll={handleFiltersClearAll}
              >
                <Box paddingInlineStart="200">
                  <Button
                    disabled={disableAction}
                    onClick={handleSaveFilters}
                    size="micro"
                    variant="tertiary"
                  >
                    Save
                  </Button>
                </Box>
              </Filters>
            }
            flushFilters
            items={[
              {
                id: '341',
                url: '#',
                name: 'Mae Jemison',
                location: 'Decatur, USA',
              },
              {
                id: '256',
                url: '#',
                name: 'Ellen Ochoa',
                location: 'Los Angeles, USA',
              },
            ]}
            renderItem={(item) => {
              const { id, url, name, location } = item;
              const media = (
                <Avatar
                  initials={name
                    .split(' ')
                    .map((nm) => nm.substring(0, 1))
                    .join('')}
                  size="md"
                  name={name}
                />
              );
  
              return (
                <ResourceList.Item
                  id={id}
                  url={url}
                  media={media}
                  accessibilityLabel={`View details for ${name}`}
                >
                  <Text as="h3" fontWeight="bold">
                    {name}
                  </Text>
                  <div>{location}</div>
                </ResourceList.Item>
              );
            }}
          />
        </Card>
      </div>
    );
  
    function humanReadableValue(key, value) {
      if (isEmpty(value)) return '';
  
      switch (key) {
        case 'moneySpent': {
          const [min, max] = value;
          if (min === 0 && max === 0) return '';
          if (min === 0) return `up to $${max}`;
          if (max === 0) return `more than $${min}`;
          return `between $${min} and $${max}`;
        }
  
        case 'taggedWith': {
          const tags = value.trim().split(',');
          if (tags.length === 1) return ` ${tags[0]}`;
          else if (tags.length === 2) return `${tags[0]} and ${tags[1]}`;
          return tags
            .map((tag, index) => (index !== tags.length - 1 ? tag : `and ${tag}`))
            .join(', ');
        }
        case 'paymentStatus': {
          const statuses = value;
          if (statuses.length === 1) {
            return statuses[0];
          } else if (statuses.length === 2) {
            return `${statuses[0]} or ${statuses[1]}`;
          } else {
            return statuses
              .map((status, index) => (index !== statuses.length - 1 ? status : `or ${status}`))
              .join(', ');
          }
        }
        case 'fulfilmentStatus': {
            const statuses = value;
            if (statuses.length === 1) {
              return statuses[0];
            } else if (statuses.length === 2) {
              return `${statuses[0]} or ${statuses[1]}`;
            } else {
              return statuses
                .map((status, index) => (index !== statuses.length - 1 ? status : `or ${status}`))
                .join(', ');
            }
          }
        default:
          return '';
      }
    }
  
    function isEmpty(value) {
      if (Array.isArray(value)) {
        return value.length === 0 || value[1] === 0;
      } else {
        return value === '' || value === 0 || value == null;
      }
    }
  
    function isUnchanged(key, value) {
      if (key === 'taggedWith') {
        return value === savedFilterState.get(key)?.value;
      } else if (key === 'moneySpent') {
        const [min, max] = value;
        const savedMoneySpent = savedFilterState.get(key)?.value;
  
        return min === savedMoneySpent?.[0] && max === savedMoneySpent?.[1];
      } else if (key === 'paymentStatus') {
        const savedPaymentStatus = savedFilterState.get(key)?.value || [];
        return Array.isArray(value) && value.every((val) => savedPaymentStatus?.includes(val));
      } else if (key === 'fulfilmentStatus') {
        const savedFulfilmentStatus = savedFilterState.get(key)?.value || [];
        return Array.isArray(value) && value.every((val) => savedFulfilmentStatus?.includes(val));
      }
    }
  }
  
  export default ResourceListWithFilterExample;
  