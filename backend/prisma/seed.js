
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const createSampleData = async () => {
  const vendor1 = await prisma.vendor.create({
    data: {
      name: "Vendor One",
      email: "test@example.com",
      products: {
        create: [
          {
            title: "Product 1",
            description: "Description for Product 1"
          },
          {
            title: "Product 2",
            description: "Description for Product 2"
          }
        ]
      }
    }
  });

  const vendor2 = await prisma.vendor.create({
    data: {
      name: "Vendor Two",
      email: "vendor2@example.com",
      products: {
        create: [
          {
            title: "Product 3",
            description: "Description for Product 3"
          },
          {
            title: "Product 4",
            description: "Description for Product 4"
          }
        ]
      }
    }
  });

  console.log('Sample data created:', { vendor1, vendor2 });
};

createSampleData()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
