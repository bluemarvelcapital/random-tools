require('dotenv').config();
const nock = require('nock');
const shopifyService = require('../services/shopifyService');

describe('Shopify Service', () => {
  beforeEach(() => {
    nock.cleanAll(); // Clean all nock interceptors
  });

  describe('syncProductToShopify', () => {
    it('should sync a product to Shopify', async () => {
      const productData = {
        title: 'Test Product',
        description: 'A product for testing',
        productType: 'Test Type',
        tags: ['test'],
        vendorName: 'Test Vendor',
        images: ['https://example.com/image1.jpg'],
        variants: [{
          option1: 'Test Option',
          price: 10.0,
          compareAtPrice: 12.0,
          stock: 100,
          sku: 'TESTSKU',
          barcode: '123456789012',
          weight: 1.0,
          weightUnit: 'kg',
          image: 'https://example.com/image1.jpg'
        }]
      };

      // Mock the POST request to create a product
      nock(process.env.SHOPIFY_API_URL)
        .post('/products.json')
        .reply(200, {
          product: {
            id: 'test-shopify-id',
            ...productData,
            variants: productData.variants.map((variant, index) => ({
              id: `variant-${index}`,
              ...variant
            }))
          }
        });

      // Mock the GraphQL request to publish the product
      nock(process.env.SHOPIFY_API_URL)
        .post('/graphql.json')
        .reply(200, {
          data: {
            publishablePublish: {
              userErrors: []
            }
          }
        });

      try {
        const product = await shopifyService.syncProductToShopify(productData);
        console.log('Product synced successfully:', product);
        expect(product.id).toBe('test-shopify-id');
        expect(product.title).toBe('Test Product');
        expect(product.variants).toHaveLength(1);
        expect(product.variants[0].price).toBe(10.0);
      } catch (error) {
        console.error('Test failed - syncProductToShopify:', error.message);
        throw error;
      }
    });

    it('should update an existing product in Shopify', async () => {
      const productData = {
        shopifyId: 'existing-shopify-id',
        title: 'Updated Product',
        description: 'Updated description',
        productType: 'Updated Type',
        tags: ['updated'],
        vendorName: 'Updated Vendor',
        images: ['https://example.com/image2.jpg'],
        variants: [{
          shopifyId: 'existing-variant-id',
          option1: 'Updated Option',
          price: 20.0,
          compareAtPrice: 22.0,
          stock: 50,
          sku: 'UPDATEDSKU',
          barcode: '987654321098',
          weight: 2.0,
          weightUnit: 'kg',
          image: 'https://example.com/image2.jpg'
        }]
      };

      // Mock the PUT request to update a product
      nock(process.env.SHOPIFY_API_URL)
        .put('/products/existing-shopify-id.json')
        .reply(200, {
          product: {
            id: 'existing-shopify-id',
            ...productData,
            variants: productData.variants.map((variant, index) => ({
              id: `variant-${index}`,
              ...variant
            }))
          }
        });

      try {
        const product = await shopifyService.syncProductToShopify(productData);
        console.log('Product updated successfully:', product);
        expect(product.id).toBe('existing-shopify-id');
        expect(product.title).toBe('Updated Product');
        expect(product.variants).toHaveLength(1);
        expect(product.variants[0].price).toBe(20.0);
      } catch (error) {
        console.error('Test failed - updateProductInShopify:', error.message);
        throw error;
      }
    });
  });

  describe('deleteProductFromShopify', () => {
    it('should delete a product from Shopify', async () => {
      const shopifyId = 'delete-shopify-id';

      nock(process.env.SHOPIFY_API_URL)
        .delete(`/products/${shopifyId}.json`)
        .reply(200, {});

      try {
        await shopifyService.deleteProductFromShopify(shopifyId);
        console.log('Product deleted successfully:', shopifyId);
      } catch (error) {
        console.error('Test failed - deleteProductFromShopify:', error.message);
        throw error;
      }
    });
  });
});
