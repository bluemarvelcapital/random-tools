const { PrismaClient } = require('@prisma/client');
const axios = require('axios');
const prisma = new PrismaClient();
const { POSTCODES_IO_URL } = process.env;

const registerVendor = async (userId, vendorData) => {
  const { name, email, postcode, location, openingTimes, contactInfo } = vendorData;

  const existingVendor = await prisma.vendor.findUnique({ where: { email } });
  if (existingVendor) {
    throw new Error('Email is already registered as a vendor');
  }

  const response = await axios.get(`${POSTCODES_IO_URL}/${postcode}`);
  if (response.data.status !== 200) {
    throw new Error('Invalid postcode');
  }
  const { latitude, longitude } = response.data.result;

  return prisma.vendor.create({
    data: {
      name,
      email,
      postcode,
      location,
      openingTimes,
      contactInfo,
      latitude,
      longitude,
      userId,
    },
  });
};

const updateVendor = async (vendorData) => {
  const { id, name, email, postcode, location, openingTimes, contactInfo } = vendorData;
  const data = { name, email, location, openingTimes, contactInfo };
  if (postcode) {
    const response = await axios.get(`${POSTCODES_IO_URL}/${postcode}`);
    if (response.data.status !== 200) {
      throw new Error('Invalid postcode');
    }
    data.latitude = response.data.result.latitude;
    data.longitude = response.data.result.longitude;
  }

  return prisma.vendor.update({
    where: { id },
    data,
  });
};

const getVendorById = async (id) => {
  if (!id) {
    throw new Error('Vendor ID is required');
  }
  console.log(`Fetching vendor with ID: ${id}`);
  return prisma.vendor.findUnique({ where: { id } });
};

const getAllVendors = async () => {
  return prisma.vendor.findMany();
};

module.exports = {
  registerVendor,
  updateVendor,
  getVendorById,
  getAllVendors,
};
