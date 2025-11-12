import express from 'express';
import { createMessage, deleteMessage, getMessagesByUser } from '../controllers/message.controller.js';

const router = express.Router();

/**
 * @swagger
 * /api/message/create:
 *   post:
 *     summary: Gửi tin nhắn mới
 *     tags: [Message]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - user_Id
 *               - content
 *             properties:
 *               user_Id:
 *                 type: integer
 *               order_Id:
 *                 type: integer
 *               content:
 *                 type: string
 *     responses:
 *       201:
 *         description: Gửi tin nhắn thành công
 *       404:
 *         description: Người dùng không tồn tại
 */
router.post('/create', createMessage);
/**
 * @swagger
 * /api/message/user/{userId}:
 *   get:
 *     summary: Lấy danh sách tin nhắn của một người dùng
 *     tags: [Message]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID của người dùng
 *     responses:
 *       200:
 *         description: Danh sách tin nhắn
 */
router.get('/user/:userId', getMessagesByUser);
/**
 * @swagger
 * /api/message/delete/{id}:
 *   delete:
 *     summary: Xóa một tin nhắn
 *     tags: [Message]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID của tin nhắn
 *     responses:
 *       200:
 *         description: Xóa tin nhắn thành công
 *       404:
 *         description: Tin nhắn không tồn tại
 */
router.delete('/delete/:id', deleteMessage);

export default router;