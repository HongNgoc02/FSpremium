import { DataTypes } from 'sequelize'
import sequelize from '../config/database.js'
import Order from './orders.js'
import User from './users.js'

const Payment = sequelize.define('Payment', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  order_Id: { type: DataTypes.INTEGER, allowNull: false },
  user_Id: { type: DataTypes.INTEGER, allowNull: false },
  total_payment: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  method: { type: DataTypes.STRING, allowNull: false },
  status: { type: DataTypes.STRING, allowNull: false },
  transaction_id: { type: DataTypes.STRING, allowNull: true },
  created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
}, {
  timestamps: false,
})

// Thiết lập quan hệ
Payment.belongsTo(Order, { foreignKey: 'order_Id' })
Payment.belongsTo(User, { foreignKey: 'user_Id' })

export default Payment
