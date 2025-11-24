import express from "express"
import upload from "../middlewares/upload.middleware.js"
import {
  createCategory,
  deleteCategory,
  getCategories,
  getCategoryById,
  updateCategory
} from "../controllers/category.controller.js"

const router = express.Router()

/**
 * @swagger
 * /api/category/create:
 *   post:
 *     summary: Tạo danh mục mới
 *     tags: [Category]
 *     consumes:
 *       - multipart/form-data
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: Đồ uống
 *               description:
 *                 type: string
 *                 example: Các loại thức uống
 *               img:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Tạo danh mục thành công
 *       400:
 *         description: Tạo danh mục thất bại
 */
router.post("/create", upload.single('img'), createCategory)

/**
 * @swagger
 * /api/category/all:
 *   get:
 *     summary: Lấy tất cả danh mục
 *     tags: [Category]
 *     responses:
 *       200:
 *         description: Lấy dữ liệu thành công
 *       400:
 *         description: Lấy dữ liệu thất bại
 */
router.get("/all", getCategories)

/**
 * @swagger
 * /api/category/get/{id}:
 *   get:
 *     summary: Lấy danh mục theo ID
 *     tags: [Category]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID của danh mục
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lấy dữ liệu thành công
 *       400:
 *         description: Lấy dữ liệu thất bại
 */
router.get("/get/:id", getCategoryById)

/**
 * @swagger
 * /api/category/update/{id}:
 *   put:
 *     summary: Cập nhật danh mục theo ID
 *     tags: [Category]
 *     consumes:
 *       - multipart/form-data
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID của danh mục
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: Món chính
 *               description:
 *                 type: string
 *                 example: Các món ăn chính
 *               img:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Cập nhật danh mục thành công
 *       400:
 *         description: Cập nhật danh mục thất bại
 */
router.put("/update/:id", upload.single('img'), updateCategory)

/**
 * @swagger
 * /api/category/delete/{id}:
 *   delete:
 *     summary: Xoá danh mục theo ID
 *     tags: [Category]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID của danh mục
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Xoá danh mục thành công
 *       400:
 *         description: Xoá danh mục thất bại
 */
router.delete("/delete/:id", deleteCategory)

export default router
