import express from "express"
import { createPayment, deletePayment, getPaymentByOrderId, initiateVNPAYPayment, updatePayment, vnpayReturn } from "../controllers/payment.controller.js"

const router = express.Router()

/**
 * @swagger
 * /api/payment/create:
 *   post:
 *     summary: Tạo thanh toán mới
 *     tags: [Payment]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - order_Id
 *               - user_Id
 *               - total_payment
 *               - method
 *               - status
 *             properties:
 *               order_Id:
 *                 type: integer
 *                 example: 1
 *               user_Id:
 *                 type: integer
 *                 example: 2
 *               total_payment:
 *                 type: number
 *                 example: 75000
 *               method:
 *                 type: string
 *                 enum: [credit_card, vnpay, cod]
 *                 example: vnpay
 *               status:
 *                 type: string
 *                 enum: [pending, success, failed]
 *                 example: pending
 *               transaction_id:
 *                 type: string
 *                 example: TXN987654
 *     responses:
 *       200:
 *         description: Thanh toán được tạo thành công
 */
router.post("/create", createPayment)

/**
 * @swagger
 * /api/payment/order/{orderId}:
 *   get:
 *     summary: Lấy thông tin thanh toán theo ID đơn hàng
 *     tags: [Payment]
 *     parameters:
 *       - in: path
 *         name: orderId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID đơn hàng
 *     responses:
 *       200:
 *         description: Trả về thông tin thanh toán
 */
router.get("/order/:orderId", getPaymentByOrderId)

/**
 * @swagger
 * /api/payment/update/{id}:
 *   put:
 *     summary: Cập nhật thông tin thanh toán
 *     tags: [Payment]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID thanh toán
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 example: completed
 *               transaction_id:
 *                 type: string
 *                 example: 987654321
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 */
router.put("/update/:id", updatePayment)

/**
 * @swagger
 * /api/payment/delete/{id}:
 *   delete:
 *     summary: Xóa thông tin thanh toán
 *     tags: [Payment]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
*         required: true
 *         description: ID thanh toán
 *     responses:
 *       200:
 *         description: Xóa thành công
 */
router.delete("/delete/:id", deletePayment)

/**
 * @swagger
 * /api/payment/vnpay_initiate:
 *   post:
 *     summary: Khởi tạo thanh toán qua VNPAY
 *     tags: [Payment]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               orderId:
 *                 type: string
 *                 example: "123456"
 *               amount:
 *                 type: number
 *                 example: 150000
 *               orderInfo:
 *                 type: string
 *                 example: "Thanh toán đơn hàng ABC"
 *               returnUrl:
 *                 type: string
 *                 example: "http://localhost:5000/vnpay_return"
 *               currency:
 *                 type: string
 *                 enum: [VND, USD]
 *                 default: VND
 *     responses:
 *       200:
 *         description: Khởi tạo thanh toán thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: string
 *                   example: "00"
 *                 message:
 *                   type: string
 *                   example: "Khởi tạo thanh toán thành công"
 *                 data:
 *                   type: string
 *                   example: "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?vnp_..."
 *                 paymentId:
 *                   type: string
 *                   example: "abc123"
 *       400:
 *         description: Thông tin thanh toán không hợp lệ hoặc số tiền quá thấp
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: string
 *                   example: "01"
 *                 message:
 *                   type: string
 *                   example: "Thông tin thanh toán không hợp lệ!"
 *       404:
 *         description: Đơn hàng không tồn tại
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: string
 *                   example: "02"
 *                 message:
 *                   type: string
 *                   example: "Đơn hàng không tồn tại!"
 */
router.post('/vnpay_initiate', initiateVNPAYPayment)

/**
 * @swagger
 * /api/payment/vnpay_return:
 *   get:
 *     summary: Kết quả trả về từ VNPAY sau khi thanh toán
 *     tags: [Payment]
 *     responses:
 *       200:
 *         description: Trả về kết quả thanh toán
 */
router.get('/vnpay_return', vnpayReturn)

export default router