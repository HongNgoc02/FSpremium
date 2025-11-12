import { DataTypes } from 'sequelize'
import sequelize from '../config/database.js'
import User from './users.js'

const Review = sequelize.define('Review', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    user_Id: { type: DataTypes.INTEGER, allowNull: false },
    rating: { type: DataTypes.DECIMAL(2, 1), allowNull: false },
    comment: { type: DataTypes.TEXT, allowNull: true },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
}, {
    timestamps: false,
})

// Thiết lập quan hệ với User
Review.belongsTo(User, { foreignKey: 'user_Id' })

export default Review
