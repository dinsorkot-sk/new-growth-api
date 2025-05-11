const express = require('express');
const router = express.Router();
const documentController = require('../../controller/user/document') 

/**
 * @swagger
 * tags:
 *   name: User Document
 *   description: Document management endpoints
 */

/**
 * @swagger
 * /api/document/getAllDocument:
 *   get:
 *     tags: [User Document]
 *     summary: Get paginated document list
 *     parameters:
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           minimum: 0
 *           default: 0
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Paginated document list
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/DocumentResponse'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 *       500:
 *         description: Internal server error
 */
router.get('/getAllDocument', documentController.getAllDocumentResource);

/**
 * @swagger
 * /api/document/getDocumentById/{id}:
 *   get:
 *     tags: [User Document]
 *     summary: Get document by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Document details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DocumentResponse'
 *       404:
 *         description: Document not found
 *       500:
 *         description: Internal server error
 */
router.get('/getDocumentById/:id', documentController.getDocumentResourceById);

/**
 * @swagger
 * /api/document/downloadDocument/{id}:
 *   get:
 *     tags: [User Document]
 *     summary: Download document file by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: File downloaded successfully
 *         content:
 *           application/octet-stream:
 *             schema:
 *               type: string
 *               format: binary
 *       404:
 *         description: Document not found
 *       500:
 *         description: Internal server error
 */
router.get('/downloadDocument/:id', documentController.downloadDocument);

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
 *         document_path:
 *           type: string
 *           description: URL or path to the document file
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 *     
 *     Pagination:
 *       type: object
 *       properties:
 *         totalCount:
 *           type: integer
 *         currentPage:
 *           type: integer
 *         totalPages:
 *           type: integer
 *         prev:
 *           type: string
 *           nullable: true
 *         next:
 *           type: string
 *           nullable: true
 */

/**
 * @swagger
 * /api/document/getallDocumentAndResouceVideo:
 *   get:
 *     tags: [User Document]
 *     summary: Get paginated list of documents and videos (status = show)
 *     parameters:
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           minimum: 0
 *           default: 0
 *         description: Pagination offset
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Pagination limit
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by title
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum:
 *             - Document
 *             - Video
 *         description: Type of resource (Document or Video)
 *     responses:
 *       200:
 *         description: Paginated document and video list
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/DocumentResponse'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 *       500:
 *         description: Internal server error
 */
router.get('/getallDocumentAndResouceVideo', documentController.getAllDocumentAndVideo);



module.exports = router