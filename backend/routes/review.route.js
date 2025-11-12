import express from "express"
import { createReview, getReviews, getReviewById, updateReview, deleteReview } from "../controllers/review.controller.js"

const router = express.Router()

/**
 * @swagger
 * /api/review/create:
 *   post:
 *     summary: Tạo đánh giá mới
 *     tags: [Review]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: integer
 *               menuItemId:
 *                 type: integer
 *               rating:
 *                 type: number
 *                 minimum: 1
 *                 maximum: 5
 *               comment:
 *                 type: string
 *     responses:
 *       201:
 *         description: Tạo review thành công
 */
router.post("/create", createReview)

/**
 * @swagger
 * /api/review/all:
 *   get:
 *     summary: Lấy tất cả đánh giá
 *     tags: [Review]
 *     responses:
 *       200:
 *         description: Danh sách đánh giá
 */
router.get("/all", getReviews)

/**
 * @swagger
 * /api/review/get/{id}:
 *   get:
 *     summary: Lấy đánh giá theo ID
 *     tags: [Review]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID đánh giá
 *     responses:
 *       200:
 *         description: Thông tin đánh giá
 */
router.get("/get/:id", getReviewById)

/**
 * @swagger
 * /api/review/update/{id}:
 *   put:
 *     summary: Cập nhật đánh giá
 *     tags: [Review]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               rating:
 *                 type: number
 *                 minimum: 1
 *                 maximum: 5
 *               comment:
 *                 type: string
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 */
router.put("/update/:id", updateReview)

/**
 * @swagger
 * /api/review/delete/{id}:
 *   delete:
 *     summary: Xóa đánh giá
 *     tags: [Review]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Xóa thành công
 */
router.delete("/delete/:id", deleteReview)

export default router
