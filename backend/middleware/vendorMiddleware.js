const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const ensureCorrectVendor = async (req, res, next) => {
  const vendorId = req.params.vendorId || req.body.vendorId || req.query.vendorId;
  if (!vendorId) {
    return res.status(400).json({ message: 'Vendor ID is required' });
  }

  const vendor = await prisma.vendor.findUnique({ where: { id: vendorId } });

  if (!vendor) {
    return res.status(404).json({ message: 'Vendor not found' });
  }

  if (req.user.role !== 'admin' && req.user.id !== vendor.userId) {
    return res.status(403).json({ message: 'Access forbidden: insufficient rights' });
  }

  next();
};

module.exports = { ensureCorrectVendor };
