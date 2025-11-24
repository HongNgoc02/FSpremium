import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const Cart = sequelize.define(
  "Cart",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Users",
        key: "id"
      }
    },
    items: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: [],
      get() {
        const value = this.getDataValue("items");
        return value ? JSON.parse(JSON.stringify(value)) : [];
      },
      set(value) {
        this.setDataValue("items", value);
      }
    },
    total: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
      get() {
        const value = this.getDataValue("total");
        return value ? Number(value) : 0;
      }
    },
    status: {
      type: DataTypes.ENUM("active", "checkout", "abandoned"),
      allowNull: false,
      defaultValue: "active"
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  },
  {
    tableName: "carts",
    freezeTableName: true,
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    hooks: {
      beforeSave: (instance) => {
        if (instance.total) {
          instance.total = Number(instance.total);
        }

        if (instance.changed("items")) {
          const items = instance.items || [];
          const total = items.reduce((sum, item) => {
            return sum + Number(item.price) * Number(item.quantity);
          }, 0);
          instance.total = total;
        }
      }
    }
  }
);

export default Cart;
