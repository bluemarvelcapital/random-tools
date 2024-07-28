const express = require('express');
const { ensureAuthenticated } = require('../../middleware/auth');
const { checkRole } = require('../../middleware/roleMiddleware');
const adminService = require('../../services/adminService');
const router = express.Router();

/**
 * @swagger
 * /api/v1/admin/approve-vendor/{id}:
 *   put:
 *     summary: Approve or reject a vendor
 *     tags: [Admin]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The vendor ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [approved, rejected]
 *     responses:
 *       200:
 *         description: Vendor status updated successfully
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Vendor not found
 *       500:
 *         description: Failed to update vendor status
 */
router.put('/approve-vendor/:id', ensureAuthenticated, checkRole('admin'), async (req, res) => {
  const { id } = req.params;
  const { status } = req.body; // 'approved' or 'rejected'

  try {
    const vendor = await adminService.updateVendorStatus(id, status);
    res.status(200).json({ message: `Vendor ${status} successfully`, vendor });
  } catch (error) {
    console.error('Error updating vendor status:', error);
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
