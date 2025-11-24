import Voucher from "../models/vouchers.js"
import TryCatch from '../utils/trycatch.js'
import { Order } from "../models/index.js"


// Thêm voucher mới
export const createVoucher = TryCatch(async (req, res) => {
    const newVoucher = await Voucher.create(req.body)
    res.status(201).json({ message: "Tạo voucher thành công!", voucher: newVoucher })
})

// Lấy danh sách tất cả voucher
export const getVouchers = TryCatch(async (req, res) => {
    const vouchers = await Voucher.findAll()
    res.status(200).json(vouchers)
})

// Lấy chi tiết một voucher theo ID
export const getVoucherById = TryCatch(async (req, res) => {
    const { id } = req.params
    const voucher = await Voucher.findByPk(id)
    if (!voucher) {
        return res.status(404).json({ message: "Voucher không tồn tại!" })
    }
    res.status(200).json(voucher)
})

// Cập nhật voucher
export const updateVoucher = TryCatch(async (req, res) => {
    const { id } = req.params
    const [updated] = await Voucher.update(req.body, { where: { id } })

    if (!updated) {
        return res.status(404).json({ message: "Voucher không tồn tại hoặc không có thay đổi!" })
    }

    const updatedVoucher = await Voucher.findByPk(id)
    res.status(200).json({ message: "Cập nhật voucher thành công!", voucher: updatedVoucher })
})

// Xóa voucher
export const deleteVoucher = TryCatch(async (req, res) => {
    const { id } = req.params
    const deleted = await Voucher.destroy({ where: { id } })

    if (!deleted) {
        return res.status(404).json({ message: "Voucher không tồn tại!" })
    }

    res.status(200).json({ message: "Xóa voucher thành công!" })
})

// Check voucher
export const checkVoucher = TryCatch(async (req, res) => {
    const { code, total_price } = req.body;

    // Tìm voucher
    const voucher = await Voucher.findOne({ where: { code } });
    if (!voucher) {
        return res.json({ valid: false, message: 'Voucher không tồn tại' });
    }

    // Kiểm tra thời hạn
    const now = new Date();
    if (now < new Date(voucher.start_date) || now > new Date(voucher.end_date)) {
        return res.json({ valid: false, message: 'Voucher đã hết hạn' });
    }

    // Kiểm tra điều kiện sử dụng
    if (total_price < voucher.min_order_amount) {
        return res.json({
            valid: false,
            message: `Đơn hàng phải có giá trị tối thiểu ${voucher.min_order_amount} VNĐ`
        });
    }

    // Kiểm tra số lần sử dụng
    if (voucher.limit > 0) {
        const usedCount = await Order.count({ where: { voucher_Id: voucher.id } });
        if (usedCount >= voucher.limit) {
            return res.json({ valid: false, message: 'Voucher đã hết lượt sử dụng' });
        }
    }

    // Nếu tất cả điều kiện đều hợp lệ
    return res.json({
        valid: true,
        voucher: {
            id: voucher.id,
            code: voucher.code,
            description: voucher.description,
            discount_type: voucher.discount_type,
            discount_value: voucher.discount_value,
            min_order_amount: voucher.min_order_amount,
            max_discount: voucher.max_discount,
            start_date: voucher.start_date,
            end_date: voucher.end_date
        }
    });
})