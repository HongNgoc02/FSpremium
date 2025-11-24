import express from "express"
import upload from "../middlewares/upload.middleware.js"
import {
  createMenuItem,
  deleteMenuItem,
  getMenuItemById,
  getMenuItems,
  updateMenuItem
} from "../controllers/menuItem.controller.js"

const router = express.Router()

/**
 * @swagger
 * /api/menu-items/create:
 *   post:
 *     summary: Tạo món ăn mới
 *     tags: [Menu-Food]
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
 *                 example: Cơm gà
 *               price:
 *                 type: integer
 *                 example: 50000
 *               cat_Id:
 *                 type: integer
 *                 example: 1
 *               status:
 *                 type: string
 *                 example: available
 *               img:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Tạo món ăn thành công
 *       400:
 *         description: Tạo món ăn thất bại
 */
router.post("/create", upload.single('img'), createMenuItem)

/**
 * @swagger
 * /api/menu-items/all:
 *   get:
 *     summary: Lấy tất cả món ăn trong menu
 *     tags: [Menu-Food]
 *     responses:
 *       200:
 *         description: Lấy dữ liệu thành công
 *       400:
 *         description: Thất bại khi lấy dữ liệu
 */
router.get("/all", getMenuItems)

/**
 * @swagger
 * /api/menu-items/{id}:
 *   get:
 *     summary: Lấy món ăn theo ID
 *     tags: [Menu-Food]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID của món ăn
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lấy dữ liệu thành công
 *       400:
 *         description: Thất bại khi lấy dữ liệu
 */
router.get("/:id", getMenuItemById)

/**
 * @swagger
 * /api/menu-items/update/{id}:
 *   put:
 *     summary: Cập nhật thông tin món ăn theo ID
 *     tags: [Menu-Food]
 *     consumes:
 *       - multipart/form-data
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID của món ăn
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
 *                 example: Cơm chiên hải sản
 *               price:
 *                 type: integer
 *                 example: 60000
 *               cat_Id:
 *                 type: integer
 *                 example: 2
 *               status:
 *                 type: string
 *                 example: available
 *               img:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 *       400:
 *         description: Cập nhật thất bại
 */
router.put("/update/:id", upload.single('img'), updateMenuItem)

/**
 * @swagger
 * /api/menu-items/delete/{id}:
 *   delete:
 *     summary: Xoá món ăn theo ID
 *     tags: [Menu-Food]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID của món ăn cần xoá
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Xoá thành công
 *       400:
 *         description: Xoá thất bại
 */
router.delete("/delete/:id", deleteMenuItem)

export default router
