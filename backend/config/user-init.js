const prisma = require('../models/prisma'); // Adjust the path as necessary
const bcrypt = require('bcryptjs');

async function createSuperAdmin() {
  const existingAdmin = await prisma.user.findUnique({
    where: { email: 'admin@example.com' },
  });

  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash('securepassword123', 10); // Replace with a secure password

    const superAdmin = await prisma.user.create({
      data: {
        email: 'admin@example.com',
        password: hashedPassword,
        role: 'admin',
      },
    });
    console.log('Super admin created:', superAdmin);
  } else {
    console.log('Super admin already exists.');
  }
}

createSuperAdmin().catch((e) => {
  console.error(e);
  process.exit(1);
}).finally(async () => {
  await prisma.$disconnect();
});
