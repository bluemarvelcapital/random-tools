// src/componenets/analytics/OrderOverview.js

import React, { useEffect, useRef, useMemo } from 'react';
import { Card, Text, Layout, Badge } from '@shopify/polaris';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

// Register the necessary components with Chart.js
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const OrderOverview = () => {
  const chartRef = useRef(null);

  const totalOrders = 120; // Example data, replace with actual data
  const totalRevenue = "$12,000"; // Example data, replace with actual data
  const pendingOrders = 5; // Example data, replace with actual data
  const completedOrders = 115; // Example data, replace with actual data

  const data = useMemo(() => ({
    labels: ['January', 'February', 'March', 'April', 'May', 'June'],
    datasets: [
      {
        label: 'Revenue',
        data: [1200, 1900, 3000, 5000, 2300, 6000],
        fill: false,
        borderColor: 'rgba(75, 192, 192, 1)',
        tension: 0.1,
      },
    ],
  }), []);

  useEffect(() => {
    if (chartRef.current) {
      chartRef.current.update();
    }
  }, [data]);

  return (
    <Layout.Section>
      <Card title="Order Overview" sectioned>
        <Text variant="headingLg" as="h2">
          Total Orders: {totalOrders}
        </Text>
        <Text variant="headingLg" as="h2">
          Total Revenue: {totalRevenue}
        </Text>
        <Text variant="headingLg" as="h2">
          Pending Orders: <Badge status="attention">{pendingOrders}</Badge>
        </Text>
        <Text variant="headingLg" as="h2">
          Completed Orders: <Badge status="success">{completedOrders}</Badge>
        </Text>
        <Line ref={chartRef} data={data} />
      </Card>
    </Layout.Section>
  );
};

export default OrderOverview;
