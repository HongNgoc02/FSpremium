import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { User } from "../models/index.js"
import TryCatch from "../utils/trycatch.js"
import { sendMail } from "../utils/sendMail.js"

// Đăng ký người dùng
export const registerController = TryCatch(async (req, res) => {
    const { phone_number, password, email, fullname, address, role_name } = req.body

    // Kiểm tra số điện thoại đã tồn tại chưa
    const existingUserByPhone = await User.findOne({ where: { phone_number } })
    if (existingUserByPhone) {
        return res.status(400).json({ message: "Số điện thoại đã được sử dụng!" })
    }

    // Kiểm tra email đã tồn tại chưa
    const existingUserByEmail = await User.findOne({ where: { email } })
    if (existingUserByEmail) {
        return res.status(400).json({ message: "Email đã được sử dụng!" })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    try {
        const user = await User.create({
            phone_number,
            password: hashedPassword,
            fullname,
            email,
            address,
            role_name: role_name || 'customer',
        })

        res.status(201).json({ message: "Đăng ký thành công!", user })
    } catch (error) {
        // Xử lý lỗi validation từ Sequelize
        if (error.name === 'SequelizeUniqueConstraintError') {
            const field = error.errors[0]?.path || 'thông tin';
            return res.status(400).json({ 
                message: `${field === 'email' ? 'Email' : field === 'phone_number' ? 'Số điện thoại' : field} đã được sử dụng!` 
            })
        }
        throw error; // Re-throw để TryCatch xử lý
    }
})

// Đăng nhập
export const loginController = TryCatch(async (req, res) => {
    const { phone_number, password } = req.body

    const user = await User.findOne({ where: { phone_number } })

    if (!user) {
        return res.status(404).json({ message: "Số điện thoại không tồn tại!" })
    }

    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
        return res.status(400).json({ message: "Sai mật khẩu!" })
    }

    const token = jwt.sign(
        { userId: user.id, role: user.role_name },
        "secret_key",
        { expiresIn: "1h" }
    )

    res.json({ message: "Đăng nhập thành công!", token, user })
})

// Lấy danh sách tất cả người dùng
export const getAllUserController = TryCatch(async (req, res) => {
    const users = await User.findAll({
        attributes: { exclude: ['password'] }, // bỏ mật khẩu cho an toàn
        order: [['id', 'ASC']] // sắp xếp theo id tăng dần (tuỳ chọn)
    })
    if (!users) {
        return res.status(404).json({ message: "Danh sách không tồn tại!" })
    }
    res.status(200).json({
        message: 'Lấy tất cả danh sách thành công',
        users,
    })
})

// Lấy thông tin một người dùng
export const getUserByIdController = TryCatch(async (req, res) => {
    const { id } = req.params
    const user = await User.findByPk(id, { attributes: { exclude: ["password"] } })

    if (!user) {
        return res.status(404).json({ message: "Người dùng không tồn tại!" })
    }

    res.json(user)
})

// Cập nhật thông tin người dùng
export const updateUserController = TryCatch(async (req, res) => {
    const { id } = req.params
    const { phone_number, password, fullname, address } = req.body

    const user = await User.findByPk(id)
    if (!user) {
        return res.status(404).json({ message: "Người dùng không tồn tại!" })
    }

    const hashedPassword = password ? await bcrypt.hash(password, 10) : user.password

    await user.update({
        phone_number,
        password: hashedPassword,
        fullname,
        address,
    })

    res.json({ message: "Cập nhật thành công!", user })
})

// Xóa người dùng
export const deleteUserController = TryCatch(async (req, res) => {
    const { id } = req.params
    const user = await User.findByPk(id)
    if (!user) {
        return res.status(404).json({ message: "Người dùng không tồn tại!" })
    }

    await user.destroy()
    res.json({ message: "Xóa người dùng thành công!" })
})

// Đổi mật khẩu
export const changePassword = TryCatch(async (req, res) => {
    const { id } = req.params
    const { currentPassword, newPassword } = req.body

    const user = await User.findByPk(id)
    if (!user) {
        return res.status(404).json({ message: "Người dùng không tồn tại!" })
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password)
    if (!isMatch) {
        return res.status(400).json({ message: "Mật khẩu hiện tại không đúng!" })
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10)
    await user.update({ password: hashedPassword })

    res.json({ message: "Đổi mật khẩu thành công!" })
})

// Quên mật khẩu
export const forgotPassword = TryCatch(async (req, res) => {
    const { email } = req.body

    const user = await User.findOne({ where: { email } })
    if (!user) {
        return res.status(404).json({ message: "Email không tồn tại!" })
    }

    // Tạo mã xác thực (token) và lưu vào cơ sở dữ liệu
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
        expiresIn: "1h",
    })

    await user.update({
        reset_token: token,
        reset_token_expires: new Date(Date.now() + 3600000)
    })

    // Gửi email với mã xác thực
    const resetUrl = `http://localhost:5173/reset-password/${token}`
    const htmlContent = `
        <div style="font-family: Arial, sans-serif max-width: 600px margin: auto padding: 20px border: 1px solid #eee border-radius: 8px">
          <h2 style="color: #333">Yêu cầu đặt lại mật khẩu</h2>
          <p style="font-size: 16px color: #555">
            Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn.
          </p>
          <p style="font-size: 16px color: #555">
            Nhấn vào nút bên dưới để thay đổi mật khẩu:
          </p>
          <div style="text-align: center margin: 30px 0">
            <a href="${resetUrl}" style="background-color: #FF3333 color: white text-decoration: none padding: 12px 24px border-radius: 4px display: inline-block">
              Đặt lại mật khẩu
            </a>
          </div>
          <p style="font-size: 14px color: #999">
            Nếu bạn không yêu cầu hành động này, vui lòng bỏ qua email này. Mật khẩu của bạn sẽ không bị thay đổi.
          </p>
        </div>
    `

    await sendMail(email, "Đặt lại mật khẩu", htmlContent)
    res.json({ message: "Đã gửi email đặt lại mật khẩu!" })
})

// Reset mật khẩu
export const resetPassword = TryCatch(async (req, res) => {
    const { token, newPassword } = req.body

    // Kiểm tra token trong DB
    const passwordReset = await User.findOne({
        where: {
            reset_token: token,
        },
    })
    if (!passwordReset || passwordReset.expireAt < Date.now()) return res.status(400).json({ message: 'Mã token không hợp lệ hoặc đã hết hạn' })

    // Cập nhật mật khẩu mới cho người dùng
    const user = await User.findOne({ where: { email: passwordReset.email } })
    if (!user) {
        return res.status(400).json({ message: 'Không tìm thấy người dùng' })
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10)

    // Xóa bản ghi reset token
    await User.update(
        {
            password: hashedPassword,
            reset_token: null,
            reset_token_expires: null
        },
        {
            where: { reset_token: token }
        }
    )

    console.log('✅ Đổi mật khẩu thành công!')
    res.status(200).json({ message: 'Mật khẩu đã được thay đổi thành công' })
})