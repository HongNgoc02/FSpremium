import express from "express";
import { cancelOrder, createOrder, deleteOrder, getAllOrders, getOrderById, getOrderByUserID, getRevenue, updateOrder } from "../controllers/order.controller.js";

const router = express.Router();

/**
 * @swagger 
 *   /api/orders/all:
 *   get:
 *     summary: Lấy danh sách tất cả đơn hàng
 *     tags: [Orders]
 *     responses:
 *       200:
 *         description: Trả về danh sách đơn hàng
 */
router.get("/all", getAllOrders);

/**
 * @swagger 
 *   /api/orders/{id}:
 *   get:
 *     summary: Lấy thông tin đơn hàng theo ID
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID của đơn hàng
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Trả về thông tin đơn hàng
 */
router.get("/:id", getOrderById);

/**
 * @swagger 
 *   /api/orders/user/{userId}:
 *   get:
 *     summary: Lấy đơn hàng theo user ID
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         description: ID người dùng
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Danh sách đơn hàng của user
 */
router.get("/user/:userId", getOrderByUserID);

/**
 * @swagger 
 *   /api/orders/create:
 *   post:
 *     summary: Tạo đơn hàng mới
 *     tags: [Orders]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - user_Id
 *               - total_price
 *             properties:
 *               user_Id:
 *                 type: integer
 *               total_price:
 *                 type: number
 *               voucher_Id:
 *                 type: integer
 *               status:
 *                 type: string
 *               payment_status:
 *                 type: string
 *     responses:
 *       201:
 *         description: Tạo đơn hàng thành công
 */
router.post("/create", createOrder);

/**
 * @swagger 
 *   /api/orders/update/{id}:
 *   put:
 *     summary: Cập nhật trạng thái đơn hàng
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID đơn hàng
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *               payment_status:
 *                 type: string
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 */
router.put("/update/:id", updateOrder);

/**
 * @swagger 
 *   /api/orders/cancel/{id}:
 *   put:
 *     summary: Hủy đơn hàng
 *     tags: [Orders]
 *     parameters:
 *       - in: path
*         name: id
 *         required: true
 *         description: ID đơn hàng
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Hủy đơn hàng thành công
 */
router.put("/cancel/:id", cancelOrder);

/**
 * @swagger 
 *   /api/orders/delete/{id}:
 *   delete:
 *     summary: Xóa đơn hàng
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID đơn hàng
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Xóa đơn hàng thành công
 */
router.delete("/delete/:id", deleteOrder);

/**
 * @swagger
 * /api/orders/revenue:
 *   get:
 *     summary: Lấy tổng doanh thu của các đơn hàng đã hoàn thành
 *     tags: [Orders]
 *     responses:
 *       200:
 *         description: Trả về tổng doanh thu
 *       500:
 *         description: Lỗi server nội bộ
 */
router.get('/revenue', getRevenue)

export default router;