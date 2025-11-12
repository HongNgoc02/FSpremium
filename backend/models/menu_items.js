import { DataTypes } from 'sequelize'
import Category from './categories.js'
import sequelize from '../config/database.js'

const MenuItem = sequelize.define('MenuItem', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false },
  img: { type: DataTypes.STRING, allowNull: true },
  price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  cat_Id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Category,
      key: 'id',
    },
  },
  status: { type: DataTypes.STRING, allowNull: false },
  created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
}, {
  tableName: 'menu_items',
  timestamps: false,
})

// Thiết lập quan hệ với Category
MenuItem.belongsTo(Category, { foreignKey: 'cat_Id' })

export default MenuItem