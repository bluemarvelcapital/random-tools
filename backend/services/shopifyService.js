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

const syncProductToShopify = async (productData) => {
  const { shopifyId, title, description, productType, tags, vendorName, images, variants } = productData;

  const shopifyProductData = {
    title,
    body_html: description,
    vendor: vendorName,
    product_type: productType,
    tags: tags.join(', '),
    variants: variants.map(variant => ({
      id: variant.shopifyId,
      option1: variant.option1,
      price: variant.price,
      compare_at_price: variant.compareAtPrice,
      inventory_quantity: variant.stock,
      inventory_management: 'shopify',
      sku: variant.sku,
      barcode: variant.barcode,
      weight: variant.weight,
      weight_unit: variant.weightUnit,
      image: variant.image ? { src: variant.image } : undefined
    })),
    images: images.map(url => ({ src: url }))
  };

  try {
    let response;
    if (shopifyId) {
      response = await axios.put(
        `${SHOPIFY_API_URL}/products/${shopifyId}.json`,
        { product: shopifyProductData },
        {
          headers: {
            'X-Shopify-Access-Token': SHOPIFY_ACCESS_TOKEN,
            'Content-Type': 'application/json',
          },
        }
      );
    } else {
      response = await axios.post(
        `${SHOPIFY_API_URL}/products.json`,
        { product: shopifyProductData },
        {
          headers: {
            'X-Shopify-Access-Token': SHOPIFY_ACCESS_TOKEN,
            'Content-Type': 'application/json',
          },
        }
      );
      await publishProductToSalesChannel(response.data.product.id);
    }

    return response.data.product;
  } catch (error) {
    console.error('Error syncing product to Shopify:', error.response ? error.response.data : error.message);
    throw new Error('Failed to sync product to Shopify');
  }
};

const deleteProductFromShopify = async (shopifyId) => {
    const MAX_RETRIES = 3;
  
    const attemptDelete = async (attempt) => {
      try {
        console.log(`Attempting to delete product from Shopify (Attempt ${attempt + 1}/${MAX_RETRIES})`);
        await axios.delete(`${SHOPIFY_API_URL}/products/${shopifyId}.json`, {
          headers: {
            'X-Shopify-Access-Token': SHOPIFY_ACCESS_TOKEN,
          },
        });
        console.log('Product deleted successfully from Shopify');
        return;
      } catch (error) {
        console.error(`Error deleting product from Shopify (Attempt ${attempt + 1}/${MAX_RETRIES}):`, error.response ? error.response.data : error.message);
        if (attempt + 1 < MAX_RETRIES) {
          await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1))); // Exponential backoff
          return attemptDelete(attempt + 1);
        } else {
          throw new Error('Failed to delete product from Shopify after multiple attempts');
        }
      }
    };
  
    return attemptDelete(0);
  };
  

module.exports = {
  syncProductToShopify,
  deleteProductFromShopify,
};
