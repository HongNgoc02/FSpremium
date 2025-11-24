import express from "express"
import { createVoucher, getVouchers, getVoucherById, updateVoucher, deleteVoucher, checkVoucher } from "../controllers/voucher.controller.js"

const router = express.Router()

/**
 * @swagger
 * /api/voucher/create:
 *   post:
 *     summary: Tạo voucher mới
 *     tags: [Voucher]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               code:
 *                 type: string
 *               discount:
 *                 type: number
 *               expiryDate:
 *                 type: string
 *                 format: date
 *     responses:
 *       201:
 *         description: Tạo thành công
 */
router.post("/create", createVoucher)

/**
 * @swagger
 * /api/voucher/all:
 *   get:
 *     summary: Lấy tất cả voucher
 *     tags: [Voucher]
 *     responses:
 *       200:
 *         description: Danh sách voucher
 */
router.get("/all", getVouchers)

/**
 * @swagger
 * /api/voucher/get/{id}:
 *   get:
 *     summary: Lấy thông tin một voucher theo ID
 *     tags: [Voucher]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID của voucher
 *     responses:
 *       200:
 *         description: Thông tin voucher
 */
router.get("/get/:id", getVoucherById)

/**
 * @swagger
 * /api/voucher/update/{id}:
 *   put:
 *     summary: Cập nhật thông tin voucher
 *     tags: [Voucher]
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
 *               code:
 *                 type: string
 *               discount:
 *                 type: number
 *               expiryDate:
 *                 type: string
 *                 format: date
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 */
router.put("/update/:id", updateVoucher)

/**
 * @swagger
 * /api/voucher/delete/{id}:
 *   delete:
 *     summary: Xóa voucher
 *     tags: [Voucher]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Đã xóa voucher
 */
router.delete("/delete/:id", deleteVoucher)


/**
 * @swagger
 * /api/voucher/check:
 *   post:
 *     summary: Kiểm tra mã voucher
 *     tags: [Voucher] 
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - code
 *               - total_price
 *             properties:
 *               code:
 *                 type: string
 *                 example: FREESHIP
 *               total_price:
 *                 type: number
 *                 example: 200000
 *     responses:
 *       200:
 *         description: Kết quả kiểm tra mã voucher
 */
router.post("/check", checkVoucher)


export default router