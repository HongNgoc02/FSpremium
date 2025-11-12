import { DataTypes } from 'sequelize'
import sequelize from '../config/database.js'
import User from './users.js'
import Order from './orders.js'

const Message = sequelize.define('Message', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  user_Id: { type: DataTypes.INTEGER, allowNull: false },
  order_Id: { type: DataTypes.INTEGER, allowNull: true },
  content: { type: DataTypes.TEXT, allowNull: false },
  sent_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
}, {
  timestamps: false,
})

// Thiết lập quan hệ
Message.belongsTo(User, { foreignKey: 'user_Id' })
Message.belongsTo(Order, {
  foreignKey: 'order_Id',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE',
})

export default Message
