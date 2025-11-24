import { Category } from "../models/index.js";
import TryCatch from "../utils/trycatch.js";

// Thêm danh mục mới
export const createCategory = TryCatch(async (req, res) => {
  const { name, description } = req.body;

  let imgPath = null;
  if (req.file) {
    imgPath = `/uploads/${req.file.filename}`;
  }

  const existingCategory = await Category.findOne({ where: { name } });
  if (existingCategory) {
    return res.status(400).json({ message: "Danh mục đã tồn tại!" });
  }

  const category = await Category.create({ name, description, img: imgPath });
  res.status(201).json({ message: "Thêm danh mục thành công!", category });
});

// Lấy danh sách tất cả danh mục
export const getCategories = TryCatch(async (req, res) => {
  const categories = await Category.findAll();
  res.json(categories);
});

// Lấy chi tiết danh mục theo ID
export const getCategoryById = TryCatch(async (req, res) => {
  const { id } = req.params;
  const category = await Category.findByPk(id);

  if (!category) {
    return res.status(404).json({ message: "Danh mục không tồn tại!" });
  }

  res.json(category);
});

// Cập nhật danh mục
export const updateCategory = TryCatch(async (req, res) => {
  const { id } = req.params;
  const { name, description } = req.body;

  const category = await Category.findByPk(id);
  if (!category) {
    return res.status(404).json({ message: "Danh mục không tồn tại!" });
  }

  let imgPath = category.img;
  if (req.file) {
    imgPath = `/uploads/${req.file.filename}`;
  }

  await category.update({ name, description, img: imgPath });
  res.json({ message: "Cập nhật danh mục thành công!", category });
});

// Xóa danh mục
export const deleteCategory = TryCatch(async (req, res) => {
  const { id } = req.params;
  const category = await Category.findByPk(id);

  if (!category) {
    return res.status(404).json({ message: "Danh mục không tồn tại!" });
  }

  await category.destroy();
  res.json({ message: "Xóa danh mục thành công!" });
});
