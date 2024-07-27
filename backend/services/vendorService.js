const { PrismaClient } = require('@prisma/client');
const axios = require('axios');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const prisma = new PrismaClient();
const { POSTCODES_IO_URL } = process.env;

const registerVendor = async (vendorData) => {
  const { name, email, postcode, location, openingTimes, contactInfo, password } = vendorData;

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      throw new Error('Email is already registered');
    }

    const response = await axios.get(`${POSTCODES_IO_URL}/postcodes/${postcode}`);
    if (response.data.status !== 200) {
      throw new Error('Invalid postcode');
    }
    const { latitude, longitude } = response.data.result;

    const user = await prisma.user.create({
      data: {
        id: uuidv4(), // Generate UUID for user ID
        email,
        password, // Use the hashed password provided
        role: 'vendor'
      }
    });

    return prisma.vendor.create({
      data: {
        id: uuidv4(), // Generate UUID for vendor ID
        name,
        email,
        postcode,
        location,
        openingTimes,
        contactInfo,
        latitude,
        longitude,
        userId: user.id,
      },
    });
  } catch (error) {
    console.error('Error registering vendor:', error.message);
    if (error.response && error.response.status === 404) {
      throw new Error('Postcode service is not found or the postcode is invalid');
    } else if (error.message.includes('Email is already registered')) {
      throw new Error('Email is already registered');
    } else if (error.code === 'P2002' && error.meta && error.meta.target.includes('email')) {
      throw new Error('Email is already registered as a vendor');
    } else {
      throw new Error('Failed to register vendor. Please try again later.');
    }
  }
};


const updateVendor = async (vendorData) => {
    const { id, name, email, postcode, location, openingTimes, contactInfo } = vendorData;
  
    const data = { name, email, location, openingTimes, contactInfo };
  
    if (postcode) {
      try {
        const response = await axios.get(`${POSTCODES_IO_URL}/postcodes/${postcode}`);
        if (response.data.status !== 200) {
          throw new Error('Invalid postcode');
        }
        data.latitude = response.data.result.latitude;
        data.longitude = response.data.result.longitude;
        data.postcode = postcode;
      } catch (error) {
        console.error('Error updating vendor:', error.message);
        throw new Error('Failed to update vendor. Invalid postcode or postcode service error.');
      }
    }
  
    try {
      const updatedVendor = await prisma.vendor.update({
        where: { id },
        data,
      });
      return updatedVendor;
    } catch (error) {
      if (error.code === 'P2025') {
        throw new Error('Vendor not found. Update operation failed.');
      }
      console.error('Error updating vendor profile:', error);
      throw new Error('Failed to update vendor profile. Please try again later.');
    }
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
