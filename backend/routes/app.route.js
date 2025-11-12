import express from "express"
const router = express.Router()

// Chèn các routes
import userRoutes from './user.route.js'
import categoryRoutes from './category.route.js'
import menuItemRoutes from './menuItem.route.js'
import orderRoutes from './order.route.js'
import orderDetailRoutes from './orderDetail.route.js'
import cartRoutes from './cart.route.js'
import reviewRoutes from "./review.route.js"
import voucherRoutes from "./voucher.route.js"
import paymentRoutes from './payment.route.js'
import messageRoutes from './message.route.js'

// Sử dụng các routes
router.use('/users', userRoutes)
router.use('/category', categoryRoutes)
router.use('/menu-items', menuItemRoutes)
router.use('/orders', orderRoutes)
router.use('/order-detail', orderDetailRoutes)
router.use('/cart', cartRoutes)
router.use('/review', reviewRoutes)
router.use('/voucher', voucherRoutes)
router.use('/payment', paymentRoutes)
router.use('/message', messageRoutes)

// Xuất router ra app.js
export default router