import { Order, OrderDetail, User, Voucher, MenuItem } from "../models/index.js"
import TryCatch from "../utils/trycatch.js"

// Tạo đơn hàng
export const createOrder = TryCatch(async (req, res) => {
  const { user_Id, total_price, voucher_Id, status, payment_status } = req.body

  const user = await User.findByPk(user_Id)
  if (!user) return res.status(404).json({ message: "Người dùng không tồn tại!" })

  if (voucher_Id) {
    const voucher = await Voucher.findByPk(voucher_Id)
    if (!voucher) return res.status(404).json({ message: "Voucher không hợp lệ!" })
  }

  const order = await Order.create({ user_Id, total_price, voucher_Id, status, payment_status })
  res.status(201).json({ message: "Tạo đơn hàng thành công!", order })
})

// Lấy danh sách đơn hàng
export const getAllOrders = TryCatch(async (req, res) => {
  const orders = await Order.findAll({
    include: [
      { model: User, attributes: ["fullname", "phone_number"] },
      { model: Voucher, attributes: ["code"] }
    ],
  })
  res.json(orders)
})

// Lấy thông tin đơn hàng theo ID
export const getOrderById = TryCatch(async (req, res) => {
  const { id } = req.params
  const order = await Order.findByPk(id, {
    include: [
      { model: User, attributes: ["fullname", "phone_number"] },
      { model: Voucher, attributes: ["code"] }
    ],
  })

  if (!order) return res.status(404).json({ message: "Đơn hàng không tồn tại!" })
  res.json(order)
})

// Lấy thông tin đơn hàng theo User ID
export const getOrderByUserID = TryCatch(async (req, res) => {
  const { userId } = req.params

  const user = await User.findByPk(userId)
  if (!user) return res.status(404).json({ message: "Người dùng không tồn tại!" })

  const orders = await Order.findAll({
    where: { user_Id: userId },
    include: [
      { model: Voucher, attributes: ["code"] },
      {
        model: OrderDetail,
        include: [{ model: MenuItem, attributes: ["name", "img", "price"] }]
      }
    ],
    order: [['created_at', 'DESC']]
  })

  res.json(orders || [])
})

// Cập nhật đơn hàng
export const updateOrder = TryCatch(async (req, res) => {
  const { id } = req.params
  const { status, payment_status } = req.body

  const order = await Order.findByPk(id)
  if (!order) return res.status(404).json({ message: "Đơn hàng không tồn tại!" })

  await order.update({ status, payment_status })
  res.json({ message: "Cập nhật đơn hàng thành công!", order })
})

// Hủy đơn hàng
export const cancelOrder = TryCatch(async (req, res) => {
  const { id } = req.params

  const order = await Order.findByPk(id)
  if (!order) return res.status(404).json({ message: "Đơn hàng không tồn tại!" })

  if (!['pending', 'processing'].includes(order.status.toLowerCase())) {
    return res.status(400).json({ message: "Không thể hủy đơn hàng ở trạng thái này!" })
  }

  await order.update({ status: 'cancelled' })
  res.json({ message: "Hủy đơn hàng thành công!", order })
})

// Xóa đơn hàng
export const deleteOrder = TryCatch(async (req, res) => {
  const { id } = req.params

  const order = await Order.findByPk(id)
  if (!order) return res.status(404).json({ message: "Đơn hàng không tồn tại!" })

  await order.destroy()
  res.json({ message: "Xóa đơn hàng thành công!" })
})

// Tổng doanh thu
export const getRevenue = TryCatch(async (req, res) => {
  // Lấy tất cả đơn hàng đã hoàn thành
  const orders = await Order.findAll({
    where: { status: 'completed' }
  });

  // Tính tổng doanh thu
  const totalRevenue = orders.reduce((sum, order) => sum + order.totalPrice, 0);

  res.json({ revenue: totalRevenue });
})
