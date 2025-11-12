import { OrderDetail, Order, MenuItem } from "../models/index.js"
import TryCatch from "../utils/trycatch.js"

// Thêm chi tiết đơn hàng
export const createOrderDetail = TryCatch(async (req, res) => {
  const { order_Id, menu_item_Id, quantity, price } = req.body

  const order = await Order.findByPk(order_Id)
  if (!order) return res.status(404).json({ message: "Đơn hàng không tồn tại!" })

  const menuItem = await MenuItem.findByPk(menu_item_Id)
  if (!menuItem) return res.status(404).json({ message: "Món ăn không tồn tại!" })

  const subtotal = quantity * price

  const orderDetail = await OrderDetail.create({ order_Id, menu_item_Id, quantity, price, subtotal })

  res.status(201).json({ message: "Thêm chi tiết đơn hàng thành công!", orderDetail })
})

// Lấy danh sách chi tiết đơn hàng theo order_Id
export const getOrderDetailsByOrderId = TryCatch(async (req, res) => {
  const { orderId } = req.params

  const orderDetails = await OrderDetail.findAll({
    where: { order_Id: orderId },
    include: [{ model: MenuItem, attributes: ["name", "img"] }],
  })

  if (orderDetails.length === 0) {
    return res.status(404).json({ message: "Không có chi tiết đơn hàng nào!" })
  }

  res.json(orderDetails)
})

// Cập nhật chi tiết đơn hàng
export const updateOrderDetail = TryCatch(async (req, res) => {
  const { id } = req.params
  const { quantity, price } = req.body

  const orderDetail = await OrderDetail.findByPk(id)
  if (!orderDetail) return res.status(404).json({ message: "Chi tiết đơn hàng không tồn tại!" })

  const subtotal = quantity * price

  await orderDetail.update({ quantity, price, subtotal })

  res.json({ message: "Cập nhật chi tiết đơn hàng thành công!", orderDetail })
})

// Xóa chi tiết đơn hàng
export const deleteOrderDetail = TryCatch(async (req, res) => {
  const { id } = req.params

  const orderDetail = await OrderDetail.findByPk(id)
  if (!orderDetail) return res.status(404).json({ message: "Chi tiết đơn hàng không tồn tại!" })

  await orderDetail.destroy()
  res.json({ message: "Xóa chi tiết đơn hàng thành công!" })
})
