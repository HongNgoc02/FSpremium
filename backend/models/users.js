import { DataTypes } from 'sequelize'
import sequelize from '../config/database.js'

const User = sequelize.define('User', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  phone_number: { type: DataTypes.STRING(10), allowNull: false, unique: true },
  password: { type: DataTypes.STRING, allowNull: false },
  fullname: { type: DataTypes.STRING, allowNull: false },
  address: { type: DataTypes.STRING, allowNull: true },
  role_name: { type: DataTypes.STRING, allowNull: false, defaultValue: 'customer' },
  created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  email: { type: DataTypes.STRING, unique: true, allowNull: false },
  reset_token: { type: DataTypes.STRING, allowNull: true},
  reset_token_expires: { type: DataTypes.DATE, allowNull: true }
}, {
  timestamps: false,
})

export default User
