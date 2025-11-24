import express from "express"
import { getCart, getCartCount, addToCart, updateCartItem, removeFromCart, clearCart } from "../controllers/cart.controller.js"

const router = express.Router()

/**
 * @swagger
 * /api/cart/{userId}:
 *   get:
 *     summary: Lấy giỏ hàng của người dùng
 *     tags: [Cart]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID của người dùng
 *     responses:
 *       200:
 *         description: Trả về giỏ hàng
 */
router.get("/:userId", getCart)

/**
 * @swagger
 * /api/cart/{userId}/count:
 *   get:
 *     summary: Lấy số lượng sản phẩm trong giỏ hàng
 *     tags: [Cart]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Trả về số lượng sản phẩm
 */
router.get("/:userId/count", getCartCount)

/**
 * @swagger
 * /api/cart/{userId}/add:
 *   post:
 *     summary: Thêm sản phẩm vào giỏ hàng
 *     tags: [Cart]
 *     parameters:
 *       - in: path
 *         name: userId
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
 *               menuItemId:
 *                 type: integer
 *               quantity:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Đã thêm sản phẩm vào giỏ
 */
router.post("/:userId/add", addToCart)

/**
 * @swagger
 * /api/cart/{userId}/items/{itemId}:
 *   put:
 *     summary: Cập nhật số lượng sản phẩm trong giỏ
 *     tags: [Cart]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: itemId
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
 *               quantity:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Đã cập nhật sản phẩm
 */
router.put("/:userId/items/:itemId", updateCartItem)

/**
 * @swagger
 * /api/cart/{userId}/items/{itemId}:
 *   delete:
 *     summary: Xóa sản phẩm khỏi giỏ
 *     tags: [Cart]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: itemId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Đã xóa sản phẩm
 */
router.delete("/:userId/items/:itemId", removeFromCart)

/**
 * @swagger
 * /api/cart/{userId}/clear:
 *   delete:
 *     summary: Xóa toàn bộ giỏ hàng
 *     tags: [Cart]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Đã xóa toàn bộ giỏ hàng
 */
router.delete("/:userId/clear", clearCart)

export default router