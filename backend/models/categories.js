import { DataTypes } from 'sequelize'
import sequelize from '../config/database.js'

const Category = sequelize.define('Category', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.STRING, allowNull: true },
}, {
    timestamps: false,
})

export default Category
