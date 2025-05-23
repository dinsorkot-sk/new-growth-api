const express = require('express');
const router = express.Router();
const uploadDocument = require('../../config/multerDocument');
const documentController = require('../../controller/admin/document') 


/**
 * @swagger
 * tags:
 *   name: Admin Document
 *   description: Document management endpoints
 */

/**
 * @swagger
 * /api/admin/document/upload-document:
 *   post:
 *     tags: [Admin Document]
 *     summary: Upload and create a new document
 *     consumes:
 *       - multipart/form-data
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - document_file
 *               - title
 *             properties:
 *               document_file:
 *                 type: string
 *                 format: binary
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [Document, Video]
 *                 default: Document
 *               is_downloadable:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Document created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DocumentResponse'
 *       500:
 *         description: Internal server error
 */
router.post('/upload-document', uploadDocument.single('document_file'), documentController.createDocument);

/**
 * @swagger
 * /api/admin/document/update-document/{id}:
 *   put:
 *     tags: [Admin Document]
 *     summary: Update document details
 *     consumes:
 *       - multipart/form-data
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               document_file:
 *                 type: string
 *                 format: binary
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               pages:
 *                 type: integer
 *               author:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [show, hide]
 *               is_downloadable:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Document updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DocumentResponse'
 *       404:
 *         description: Document not found
 *       500:
 *         description: Internal server error
 */
router.put('/update-document/:id', documentController.updateDocument, documentController.updateDocumentResource);

/**
 * @swagger
 * /api/admin/document/delete/{id}:
 *   delete:
 *     tags: [Admin Document]
 *     summary: Delete document
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Document deleted successfully
 *       404:
 *         description: Document not found
 *       500:
 *         description: Internal server error
 */
router.delete('/delete/:id', documentController.deleteDocument);

/**
 * @swagger
 * components:
 *   schemas:
 *     DocumentResponse:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         title:
 *           type: string
 *         description:
 *           type: string
 *         type:
 *           type: string
 *           enum: [Document, Video]
 *         files:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/DocumentFile'
 * 
 *     DocumentFile:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         file_path:
 *           type: string
 *         file_type:
 *           type: string
 *         is_downloadable:
 *           type: boolean
 */



module.exports = router