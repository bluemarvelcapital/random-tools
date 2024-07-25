const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

const createSampleData = async () => {
  // Create sample users
  const password = await bcrypt.hash('password', 10);

  const user1 = await prisma.user.create({
    data: {
      email: 'user1@example.com',
      password,
      role: 'vendor'
    }
  });

  const user2 = await prisma.user.create({
    data: {
      email: 'user2@example.com',
      password,
      role: 'vendor'
    }
  });

  // Create sample vendors associated with users
  const vendor1 = await prisma.vendor.create({
    data: {
      name: 'Vendor One',
      email: 'vendor1@example.com',
      latitude: 51.509865,
      longitude: -0.118092,
      userId: user1.id,
      products: {
        create: [
          {
            title: 'Product 1',
            description: 'Description for Product 1',
            price: 10.0,
            stock: 100,
          },
          {
            title: 'Product 2',
            description: 'Description for Product 2',
            price: 20.0,
            stock: 200,
          }
        ]
      }
    }
  });

  const vendor2 = await prisma.vendor.create({
    data: {
      name: 'Vendor Two',
      email: 'vendor2@example.com',
      latitude: 51.509865,
      longitude: -0.118092,
      userId: user2.id,
      products: {
        create: [
          {
            title: 'Product 3',
            description: 'Description for Product 3',
            price: 30.0,
            stock: 300,
          },
          {
            title: 'Product 4',
            description: 'Description for Product 4',
            price: 40.0,
            stock: 400,
          }
        ]
      }
    }
  });

  console.log('Sample data created:', { user1, user2, vendor1, vendor2 });
};

createSampleData()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
