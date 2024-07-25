require('dotenv').config();
const axios = require('axios');

const shopifyStoreUrl = process.env.SHOPIFY_STORE_URL;
const shopifyApiVersion = process.env.SHOPIFY_API_VERSION;
const adminAccessToken = process.env.SHOPIFY_ADMIN_API_ACCESS_TOKEN;


const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

const queryMetaobjectDefinitions = async () => {
    const query = `
      {
        metaobjectDefinitions(first: 250) {
          edges {
            node {
              id
              name
              type
              fieldDefinitions {
                name
                key
                type {
                  name
                }
              }
            }
          }
        }
      }
    `;
  
    try {
      const response = await axios.post(
        `https://${shopifyStoreUrl}/admin/api/${shopifyApiVersion}/graphql.json`,
        { query },
        {
          headers: {
            'Content-Type': 'application/json',
            'X-Shopify-Access-Token': adminAccessToken,
          },
        }
      );
  
      if (response.data && response.data.data && response.data.data.metaobjectDefinitions) {
        return response.data.data.metaobjectDefinitions.edges.map(edge => edge.node);
      } else {
        console.error('Error in querying metaobject definitions:', response.data.errors);
        return [];
      }
    } catch (error) {
      console.error('Error querying metaobject definitions:', error.message);
      return [];
    }
  };
  
  const deleteMetaobjectDefinition = async (id) => {
    const query = `
      mutation DeleteMetaobjectDefinition($id: ID!) {
        metaobjectDefinitionDelete(id: $id) {
          deletedId
          userErrors {
            field
            message
            code
          }
        }
      }
    `;
  
    const variables = { id };
  
    try {
      const response = await axios.post(
        `https://${shopifyStoreUrl}/admin/api/${shopifyApiVersion}/graphql.json`,
        { query, variables },
        {
          headers: {
            'Content-Type': 'application/json',
            'X-Shopify-Access-Token': adminAccessToken,
          },
        }
      );
  
      const { metaobjectDefinitionDelete } = response.data.data;
      if (metaobjectDefinitionDelete && metaobjectDefinitionDelete.deletedId) {
        console.log('Metaobject deleted:', metaobjectDefinitionDelete.deletedId);
      } else {
        console.error('Error deleting metaobject:', metaobjectDefinitionDelete.userErrors);
      }
    } catch (error) {
      console.error('Error deleting metaobject:', error.message);
    }
  };
  
  const createMetaobjectDefinition = async (definition) => {
    const query = `
      mutation CreateMetaobjectDefinition($definition: MetaobjectDefinitionCreateInput!) {
        metaobjectDefinitionCreate(definition: $definition) {
          metaobjectDefinition {
            id
            name
          }
          userErrors {
            field
            message
          }
        }
      }
    `;
  
    const variables = { definition };
  
    try {
      const response = await axios.post(
        `https://${shopifyStoreUrl}/admin/api/${shopifyApiVersion}/graphql.json`,
        { query, variables },
        {
          headers: {
            'Content-Type': 'application/json',
            'X-Shopify-Access-Token': adminAccessToken,
          },
        }
      );
  
      const { metaobjectDefinitionCreate } = response.data.data;
      if (metaobjectDefinitionCreate.metaobjectDefinition) {
        console.log('Metaobject created:', metaobjectDefinitionCreate.metaobjectDefinition);
      } else {
        console.error('Error creating metaobject:', metaobjectDefinitionCreate.userErrors);
      }
    } catch (error) {
      console.error('Error creating metaobject:', error.message);
    }
  };
  
  const createOrUpdateMetaobject = async (metaobjectDefinition) => {
    const existingDefinitions = await queryMetaobjectDefinitions();
    const existingDefinition = existingDefinitions.find(def => def.type === metaobjectDefinition.namespace);
  
    if (existingDefinition) {
      // Create a backup of the existing metaobject definition
      await createMetaobjectDefinition({
        name: `${existingDefinition.name}_backup_${Date.now()}`,
        type: `${existingDefinition.type}_backup_${Date.now()}`,
        fieldDefinitions: existingDefinition.fieldDefinitions.map(field => ({
          name: field.name,
          key: field.key,
          type: field.type.name,
        })),
      });
  
      // Wait for a bit before deleting and creating the new definition
      await delay(2000);
  
      // Delete the existing metaobject definition
      await deleteMetaobjectDefinition(existingDefinition.id);
  
      // Wait for a bit after deletion
      await delay(2000);
    }
  
    // Create the new metaobject definition
    await createMetaobjectDefinition({
      name: metaobjectDefinition.name,
      type: metaobjectDefinition.namespace,
      fieldDefinitions: metaobjectDefinition.fieldDefinitions.map(field => ({
        name: field.name,
        key: field.key,
        type: field.type,
      })),
    });
  };

  



const initMetaobjects = async () => {
  const metaobjectDefinitions = [
    {
      name: 'VendorInfo',
      namespace: 'vendor_info',
      fieldDefinitions: [
        { name: 'vendor_id', key: 'vendor_id', type: 'single_line_text_field' },
        { name: 'vendor_name', key: 'vendor_name', type: 'single_line_text_field' },
        { name: 'vendor_email', key: 'vendor_email', type: 'single_line_text_field' },
        { name: 'vendor_phone', key: 'vendor_phone', type: 'number_integer' },
        { name: 'vendor_address', key: 'vendor_address', type: 'multi_line_text_field' },
        { name: 'total_sales', key: 'total_sales', type: 'number_decimal' },
        { name: 'pending_withdrawal', key: 'pending_withdrawal', type: 'number_decimal' }
      ],
    },
    {
      name: 'ProductInfo',
      namespace: 'product_info',
      fieldDefinitions: [
        { name: 'product_id', key: 'product_id', type: 'single_line_text_field' },
        { name: 'product_title', key: 'product_title', type: 'single_line_text_field' },
        { name: 'product_description', key: 'product_description', type: 'multi_line_text_field' },
        { name: 'product_price', key: 'product_price', type: 'number_decimal' },
        { name: 'product_stock', key: 'product_stock', type: 'number_integer' },
        { name: 'vendor_id', key: 'vendor_id', type: 'single_line_text_field' }
      ],
    },
    {
      name: 'OrderInfo',
      namespace: 'order_info',
      fieldDefinitions: [
        { name: 'order_id', key: 'order_id', type: 'single_line_text_field' },
        { name: 'vendor_id', key: 'vendor_id', type: 'single_line_text_field' },
        { name: 'customer_id', key: 'customer_id', type: 'single_line_text_field' },
        { name: 'order_date', key: 'order_date', type: 'date' },
        { name: 'total_amount', key: 'total_amount', type: 'number_decimal' },
        { name: 'order_status', key: 'order_status', type: 'single_line_text_field' }
      ],
    },
    {
      name: 'TransactionInfo',
      namespace: 'transaction_info',
      fieldDefinitions: [
        { name: 'transaction_id', key: 'transaction_id', type: 'single_line_text_field' },
        { name: 'vendor_id', key: 'vendor_id', type: 'single_line_text_field' },
        { name: 'amount', key: 'amount', type: 'number_decimal' },
        { name: 'transaction_date', key: 'transaction_date', type: 'date' },
        { name: 'transaction_status', key: 'transaction_status', type: 'single_line_text_field' }
      ],
    }
  ];

  for (const metaobjectDefinition of metaobjectDefinitions) {
    await createOrUpdateMetaobject(metaobjectDefinition);
    // Wait between processing each metaobject definition
    await delay(2000);
  }
};

initMetaobjects();
