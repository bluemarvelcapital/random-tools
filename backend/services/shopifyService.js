const axios = require('axios');

const { SHOPIFY_API_URL, SHOPIFY_ACCESS_TOKEN } = process.env;

if (!SHOPIFY_API_URL || !SHOPIFY_ACCESS_TOKEN) {
  throw new Error('Shopify API URL or Access Token not set in environment variables');
}

const addProductToShopify = async (productData) => {
  const { title, description, price, stock, productType, tags, vendor, images } = productData;

  try {
    const response = await axios.post(
      `${SHOPIFY_API_URL}/products.json`,
      {
        product: {
          title,
          body_html: description,
          vendor: vendor,
          product_type: productType,
          tags: tags.join(', '),
          variants: [
            {
              price,
              inventory_quantity: stock,
              inventory_management: 'shopify'
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

    return response.data.product;
  } catch (error) {
    console.error('Error adding product to Shopify:', error);
    throw error;
  }
};

const updateProductInShopify = async (shopifyId, productData) => {
  const { title, description, price, stock, productType, tags, status, images } = productData;

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
              inventory_quantity: stock,
              inventory_management: 'shopify'
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
    console.error('Error updating product in Shopify:', error);
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
    console.error('Error deleting product from Shopify:', error);
    throw error;
  }
};

module.exports = {
  addProductToShopify,
  updateProductInShopify,
  deleteProductFromShopify,
};
