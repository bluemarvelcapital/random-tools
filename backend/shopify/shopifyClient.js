const fetch = require('node-fetch');

const shopifyClient = {
  async fetchShopify(query, variables) {
    const response = await fetch(`https://${process.env.SHOPIFY_STORE_DOMAIN}/api/2021-01/graphql.json`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN,
      },
      body: JSON.stringify({ query, variables }),
    });

    const jsonResponse = await response.json();
    if (jsonResponse.errors) {
      throw new Error(jsonResponse.errors.map(error => error.message).join(', '));
    }
    return jsonResponse.data;
  },
};

module.exports = shopifyClient;
