import sequelize from "../config/database.js";

// Import models
import User from "./users.js";
import Category from "./categories.js";
import MenuItem from "./menu_items.js";
import Voucher from "./vouchers.js";
import Order from "./orders.js";
import OrderDetail from "./order_details.js";
import Payment from "./payments.js";
import Review from "./reviews.js";
import Message from "./messages.js";
import Cart from "./carts.js";

// ==========================
// Thiết lập quan hệ giữa các bảng
// ==========================

// ==== User relationships ====
User.hasMany(Order, { foreignKey: "user_Id", onDelete: "CASCADE", hooks: true });
Order.belongsTo(User, { foreignKey: "user_Id" });

User.hasMany(Payment, { foreignKey: "user_Id", onDelete: "CASCADE", hooks: true });
Payment.belongsTo(User, { foreignKey: "user_Id" });

User.hasMany(Review, { foreignKey: "user_Id", onDelete: "CASCADE", hooks: true });
Review.belongsTo(User, { foreignKey: "user_Id" });

User.hasMany(Message, { foreignKey: "user_Id", onDelete: "CASCADE", hooks: true });
Message.belongsTo(User, { foreignKey: "user_Id" });

User.hasOne(Cart, { foreignKey: "user_id", onDelete: "CASCADE", hooks: true, as: "Cart" });
Cart.belongsTo(User, { foreignKey: "user_id", as: "User" });

// ==== Category - MenuItem ====
Category.hasMany(MenuItem, { foreignKey: "cat_Id", onDelete: "SET NULL", hooks: true });
MenuItem.belongsTo(Category, { foreignKey: "cat_Id" });

// ==== Voucher - Order ====
Voucher.hasMany(Order, { foreignKey: "voucher_Id", onDelete: "SET NULL", hooks: true });
Order.belongsTo(Voucher, { foreignKey: "voucher_Id" });

// ==== Order - OrderDetail ====
Order.hasMany(OrderDetail, { foreignKey: "order_Id", onDelete: "CASCADE", hooks: true });
OrderDetail.belongsTo(Order, { foreignKey: "order_Id" });

// ==== MenuItem - OrderDetail ====
MenuItem.hasMany(OrderDetail, { foreignKey: "menu_item_Id", onDelete: "CASCADE", hooks: true });
OrderDetail.belongsTo(MenuItem, { foreignKey: "menu_item_Id" });

// ==== Order - Payment ====
Order.hasMany(Payment, { foreignKey: "order_Id", onDelete: "CASCADE", hooks: true });
Payment.belongsTo(Order, { foreignKey: "order_Id" });

// ==== Order - Message ====
Order.hasMany(Message, { foreignKey: "order_Id", onDelete: "CASCADE", hooks: true });
Message.belongsTo(Order, { foreignKey: "order_Id" });

// ==========================
// Đồng bộ model với database
// ==========================
const syncDB = async () => {
    try {
        await sequelize.sync({ force: false }); // {force: true} để xóa DB
        console.log("✅ Database synced successfully!");
    } catch (error) {
        console.error("❌ Database sync failed:", error);
    }
};

// ==========================
// Export
// ==========================
export {
    sequelize,
    syncDB,
    User,
    Category,
    MenuItem,
    Voucher,
    Order,
    OrderDetail,
    Payment,
    Review,
    Message,
    Cart
};
