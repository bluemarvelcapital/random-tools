const axios = require('axios');

const { SHOPIFY_API_URL, SHOPIFY_ACCESS_TOKEN, HEADLESS_SALES_CHANNEL_ID } = process.env;

if (!SHOPIFY_API_URL || !SHOPIFY_ACCESS_TOKEN || !HEADLESS_SALES_CHANNEL_ID) {
  throw new Error('Shopify API URL, Access Token, or Headless Sales Channel ID not set in environment variables');
}

const publishProductToSalesChannel = async (productId) => {
  try {
    const response = await axios.post(
      `${SHOPIFY_API_URL}/graphql.json`,
      {
        query: `
          mutation publishProduct($id: ID!, $input: [PublicationInput!]!) {
            publishablePublish(id: $id, input: $input) {
              userErrors {
                field
                message
              }
            }
          }
        `,
        variables: {
          id: `gid://shopify/Product/${productId}`,
          input: [{ publicationId: `gid://shopify/Publication/${HEADLESS_SALES_CHANNEL_ID}` }]
        }
      },
      {
        headers: {
          'X-Shopify-Access-Token': SHOPIFY_ACCESS_TOKEN,
          'Content-Type': 'application/json',
        },
      }
    );

    const { data } = response;
    if (data.errors) {
      throw new Error(data.errors.map(error => error.message).join(', '));
    }

    const userErrors = data.data.publishablePublish.userErrors;
    if (userErrors.length > 0) {
      throw new Error(userErrors.map(error => error.message).join(', '));
    }
  } catch (error) {
    console.error('Error publishing product to sales channel:', error.response ? error.response.data : error.message);
    throw new Error('Failed to publish product to sales channel');
  }
};

const addProductToShopify = async (productData) => {
  const { title, description, price, stock, productType, tags, vendor, images, weight, weightUnit, compareAtPrice } = productData;

  try {
    const response = await axios.post(
      `${SHOPIFY_API_URL}/products.json`,
      {
        product: {
          title,
          body_html: description,
          vendor,
          product_type: productType,
          tags: tags.join(', '),
          variants: [
            {
              price,
              compare_at_price: compareAtPrice,
              inventory_quantity: stock,
              inventory_management: 'shopify',
              weight,
              weight_unit: weightUnit
            }
          ],
          images: images.map(url => ({ src: url }))
        },
      },
      {
        headers: {
          'X-Shopify-Access-Token': SHOPIFY_ACCESS_TOKEN,
          'Content-Type': 'application/json',
        },
      }
    );

    const productId = response.data.product.id;
    await publishProductToSalesChannel(productId);

    return response.data.product;
  } catch (error) {
    console.error('Error adding product to Shopify:', error.response ? error.response.data : error.message);
    throw error;
  }
};

const updateProductInShopify = async (shopifyId, productData) => {
  const { title, description, price, stock, productType, tags, status, images, weight, weightUnit, compareAtPrice } = productData;

  try {
    await axios.put(
      `${SHOPIFY_API_URL}/products/${shopifyId}.json`,
      {
        product: {
          id: shopifyId,
          title,
          body_html: description,
          product_type: productType,
          tags: tags.join(', '),
          variants: [
            {
              id: shopifyId,
              price,
              compare_at_price: compareAtPrice,
              inventory_quantity: stock,
              inventory_management: 'shopify',
              weight,
              weight_unit: weightUnit
            }
          ],
          status,
          images: images.map(url => ({ src: url }))
        },
      },
      {
        headers: {
          'X-Shopify-Access-Token': SHOPIFY_ACCESS_TOKEN,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Error updating product in Shopify:', error.response ? error.response.data : error.message);
    throw error;
  }
};

const deleteProductFromShopify = async (shopifyId) => {
  try {
    await axios.delete(`${SHOPIFY_API_URL}/products/${shopifyId}.json`, {
      headers: {
        'X-Shopify-Access-Token': SHOPIFY_ACCESS_TOKEN,
      },
    });
  } catch (error) {
    console.error('Error deleting product from Shopify:', error.response ? error.response.data : error.message);
    throw error;
  }
};

module.exports = {
  addProductToShopify,
  updateProductInShopify,
  deleteProductFromShopify,
};
