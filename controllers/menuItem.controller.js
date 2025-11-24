import { MenuItem, Category } from "../models/index.js"
import TryCatch from "../utils/trycatch.js"

// Thêm món ăn
export const createMenuItem = TryCatch(async (req, res) => {
  const { name, price, cat_Id, status, img } = req.body

  const category = await Category.findByPk(cat_Id)
  if (!category) {
    return res.status(400).json({ message: "Danh mục không tồn tại!" })
  }

  const menuItem = await MenuItem.create({
    name,
    price,
    cat_Id,
    status,
    img,
  })

  res.status(201).json({ message: "Món ăn đã được thêm!", menuItem })
})

// Lấy danh sách tất cả món ăn
export const getMenuItems = TryCatch(async (req, res) => {
  const menuItems = await MenuItem.findAll({
    include: [{ model: Category, attributes: ["name"] }]
  })
  res.json(menuItems)
})

// Lấy thông tin một món ăn
export const getMenuItemById = TryCatch(async (req, res) => {
  const { id } = req.params
  const menuItem = await MenuItem.findByPk(id, {
    include: [{ model: Category, attributes: ["name"] }]
  })

  if (!menuItem) {
    return res.status(404).json({ message: "Món ăn không tồn tại!" })
  }

  res.json(menuItem)
})

// Cập nhật món ăn
export const updateMenuItem = TryCatch(async (req, res) => {
  const { id } = req.params
  const { name, price, cat_Id, status, img } = req.body

  const menuItem = await MenuItem.findByPk(id)
  if (!menuItem) {
    return res.status(404).json({ message: "Món ăn không tồn tại!" })
  }

  if (cat_Id) {
    const category = await Category.findByPk(cat_Id)
    if (!category) {
      return res.status(400).json({ message: "Danh mục không tồn tại!" })
    }
  }

  await menuItem.update({
    name,
    price,
    cat_Id,
    status,
    img,
  })

  res.json({ message: "Cập nhật món ăn thành công!", menuItem })
})

// Xóa món ăn
export const deleteMenuItem = TryCatch(async (req, res) => {
  const { id } = req.params
  const menuItem = await MenuItem.findByPk(id)
  if (!menuItem) {
    return res.status(404).json({ message: "Món ăn không tồn tại!" })
  }

  await menuItem.destroy()
  res.json({ message: "Xóa món ăn thành công!" })
})
