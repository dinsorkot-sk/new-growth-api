const express = require('express');
const router = express.Router();
const adminController = require('../../controller/admin/admin');

/**
 * @swagger
 * /api/admin:
 *   post:
 *     summary: Create a new admin
 *     tags: [Admin]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *               email:
 *                 type: string
 *     responses:
 *       201:
 *         description: Admin created successfully
 */
router.post('/', adminController.createAdmin);

/**
 * @swagger
 * /api/admin/login:
 *   post:
 *     summary: Admin login
 *     tags: [Admin]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 example: admin
 *               password:
 *                 type: string
 *                 example: 123456789
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Unauthorized
 */
router.post('/login', adminController.loginAdmin);

/**
 * @swagger
 * /api/admin/send-otp:
 *   post:
 *     tags: [Admin OTP]
 *     summary: Send OTP to admin's email
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SendOtpInput'
 *     responses:
 *       200:
 *         description: OTP sent successfully
 *       404:
 *         description: Admin not found
 *       500:
 *         description: Failed to send OTP
 */
router.post('/send-otp', adminController.sendOTP);

/**
 * @swagger
 * /api/admin/verify-otp:
 *   post:
 *     tags: [Admin OTP]
 *     summary: Verify OTP code sent to email
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/VerifyOtpInput'
 *     responses:
 *       200:
 *         description: OTP verified successfully
 *       400:
 *         description: Invalid or expired OTP
 *       404:
 *         description: Admin not found
 */
router.post('/verify-otp', adminController.verifyOtp);

/**
 * @swagger
 * /api/admin/reset-password:
 *   post:
 *     tags: [Admin OTP]
 *     summary: Reset admin password
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ResetPasswordInput'
 *     responses:
 *       200:
 *         description: Password reset successfully
 *       400:
 *         description: OTP not verified or expired
 *       404:
 *         description: Admin not found
 */
router.post('/reset-password', adminController.resetPassword);

/**
 * @swagger
 * /api/admin:
 *   get:
 *     summary: Get all admins
 *     tags: [Admin]
 *     responses:
 *       200:
 *         description: List of admins
 */
router.get('/get-all-admins', adminController.getAllAdmins);

/**
 * @swagger
 * /api/admin/{id}:
 *   get:
 *     summary: Get admin by id
 *     tags: [Admin]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Admin ID
 *     responses:
 *       200:
 *         description: Admin data
 *       404:
 *         description: Admin not found
 */
router.get('/get-admin-by-id/:id', adminController.getAdminById);

/**
 * @swagger
 * /api/admin/{id}:
 *   put:
 *     summary: Update admin by id
 *     tags: [Admin]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Admin ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Admin updated
 *       404:
 *         description: Admin not found
 */
router.put('/update-admin-by-id/:id', adminController.updateAdmin);

/**
 * @swagger
 * /api/admin/{id}:
 *   delete:
 *     summary: Delete admin by id
 *     tags: [Admin]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Admin ID
 *     responses:
 *       200:
 *         description: Admin deleted
 *       404:
 *         description: Admin not found
 */
router.delete('/delete-admin-by-id/:id', adminController.deleteAdmin);

/**
 * @swagger
 * components:
 *   schemas:
 *     SendOtpInput:
 *       type: object
 *       required:
 *         - email
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           example: admin@example.com
 *
 *     VerifyOtpInput:
 *       type: object
 *       required:
 *         - email
 *         - otp_code
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           example: admin@example.com
 *         otp_code:
 *           type: string
 *           example: "123456"
 *
 *     ResetPasswordInput:
 *       type: object
 *       required:
 *         - email
 *         - new_password
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           example: admin@example.com
 *         new_password:
 *           type: string
 *           example: newsecurepassword123
 */

module.exports = router;