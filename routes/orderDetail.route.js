import express from "express"
import { createOrderDetail, deleteOrderDetail, getOrderDetailsByOrderId, updateOrderDetail } from "../controllers/orderDetail.controller.js"

const router = express.Router()

/**
 * @swagger 
 *   /api/order-detail/create:
 *   post:
 *     summary: Tạo chi tiết đơn hàng mới
 *     tags: [OrderDetail]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               order_Id:
 *                 type: integer
 *               menu_item_Id:
 *                 type: integer
 *               quantity:
 *                 type: integer
 *               price:
 *                 type: number
 *     responses:
 *       200:
 *         description: Thành công
 */
router.post("/create", createOrderDetail)

/**
 * @swagger 
 *   /api/order-detail/order/{orderId}:
 *   get:
 *     summary: Lấy chi tiết đơn hàng theo orderId
 *     tags: [OrderDetail]
 *     parameters:
 *       - in: path
 *         name: orderId
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID đơn hàng
 *     responses:
 *       200:
 *         description: Danh sách chi tiết đơn hàng
 */
router.get("/order/:orderId", getOrderDetailsByOrderId)

/**
 * @swagger 
 *   /api/order-detail/update/{id}:
 *   put:
 *     summary: Cập nhật chi tiết đơn hàng
 *     tags: [OrderDetail]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID chi tiết đơn hàng
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               quantity:
 *                 type: integer
 *               price:
 *                 type: number
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 */
router.put("/update/:id", updateOrderDetail)

/**
 * @swagger 
 *   /api/order-detail/delete/{id}:
 *   delete:
 *     summary: Xoá chi tiết đơn hàng
 *     tags: [OrderDetail]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID chi tiết đơn hàng
 *     responses:
 *       200:
 *         description: Xoá thành công
 */
router.delete("/delete/:id", deleteOrderDetail)

export default router