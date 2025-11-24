import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import Order from './orders.js';
import MenuItem from './menu_items.js';

const OrderDetail = sequelize.define('OrderDetail', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    order_Id: { type: DataTypes.INTEGER, allowNull: false },
    menu_item_Id: { type: DataTypes.INTEGER, allowNull: false },
    quantity: { type: DataTypes.INTEGER, allowNull: false },
    price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    subtotal: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
}, {
    timestamps: false,
});

// Thiết lập quan hệ
OrderDetail.belongsTo(Order, { foreignKey: 'order_Id' });
OrderDetail.belongsTo(MenuItem, { foreignKey: 'menu_item_Id' });

export default OrderDetail;