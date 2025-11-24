import { DataTypes } from 'sequelize'
import sequelize from '../config/database.js'
import User from './users.js'
import Voucher from './vouchers.js'

const Order = sequelize.define('Order', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  user_Id: { type: DataTypes.INTEGER, allowNull: false },
  total_price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  voucher_Id: { type: DataTypes.INTEGER, allowNull: true },
  status: { type: DataTypes.STRING, allowNull: false },
  payment_status: { type: DataTypes.STRING, allowNull: false },
  created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
}, {
  timestamps: false,
})

// Thiết lập quan hệ
Order.belongsTo(User, { foreignKey: 'user_Id' })
Order.belongsTo(Voucher, { foreignKey: 'voucher_Id' })

export default Order
