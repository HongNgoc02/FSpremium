import { Message, User, Order } from '../models/index.js';
import TryCatch from '../utils/trycatch.js';

// Gửi tin nhắn
export const createMessage = TryCatch(async (req, res) => {
    const { user_Id, order_Id, content } = req.body;

    const user = await User.findByPk(user_Id);
    if (!user) {
        return res.status(404).json({ message: "Người dùng không tồn tại!" });
    }

    const message = await Message.create({ user_Id, order_Id, content });
    res.status(201).json({ message: "Gửi tin nhắn thành công!", data: message });
});

// Lấy danh sách tin nhắn theo user
export const getMessagesByUser = TryCatch(async (req, res) => {
    const { userId } = req.params;

    const messages = await Message.findAll({
        where: { user_Id: userId },
        include: [{ model: Order, attributes: ["id", "status"] }],
        order: [["sent_at", "DESC"]],
    });

    res.json(messages);
});

// Xóa tin nhắn
export const deleteMessage = TryCatch(async (req, res) => {
    const { id } = req.params;

    const message = await Message.findByPk(id);
    if (!message) {
        return res.status(404).json({ message: "Tin nhắn không tồn tại!" });
    }

    await message.destroy();
    res.json({ message: "Xóa tin nhắn thành công!" });
});
