import bcrypt from "bcryptjs"
import {
  sequelize,
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
} from "../models/index.js"

const seedDatabase = async () => {
  try {
    console.log("🚀 Seeding started...")

    await sequelize.sync({ alter: true })
    console.log("🛠️ Database synced!")

    await Promise.all([
      Message.destroy({ where: {} }),
      Review.destroy({ where: {} }),
      Payment.destroy({ where: {} }),
      OrderDetail.destroy({ where: {} }),
      Order.destroy({ where: {} }),
      Voucher.destroy({ where: {} }),
      Cart.destroy({ where: {} }),
      MenuItem.destroy({ where: {} }),
      Category.destroy({ where: {} }),
      User.destroy({ where: {} })
    ])
    console.log("🧹 Old data cleared!")

    // Users
    const users = await Promise.all([
      User.create({
        email: "admin@example.com",
        phone_number: "0987654321",
        password: await bcrypt.hash("123456", 10),
        fullname: "Admin",
        address: "Hà Nội",
        role_name: "admin"
      }),
      User.create({
        email: "huuthuytrann3004@gmail.com",
        phone_number: "0943752093",
        password: await bcrypt.hash("1234567", 10),
        fullname: "Trần Hữu Thủy",
        address: "Đà Nẵng",
        role_name: "customer"
      }),
      User.create({
        email: "maiquangvu@gmail.com",
        phone_number: "0912345678",
        password: await bcrypt.hash("abcdef", 10),
        fullname: "Mai Quang Vũ",
        address: "Đà Nẵng",
        role_name: "customer"
      })
    ])
    console.log("✅ Users created!")

    // Categories
    const categories = await Category.bulkCreate([
      { name: "Burgers", description: "Bánh mì kẹp thịt ngon với bò, gà hoặc thực vật", img: "burgers.jpg" },
      { name: "Gà rán", description: "Gà rán và cánh gà giòn rụm", img: "fried_chicken.jpg" },
      { name: "Pizza", description: "Pizza nóng hổi với phô mai thơm béo", img: "pizza.jpg" },
      { name: "Khoai tây & Món phụ", description: "Khoai tây chiên, hành tây chiên và các món phụ khác", img: "fries.jpg" },
      { name: "Sandwiches", description: "Bánh mì sandwich và bánh mì dài tiện lợi", img: "sandwiches.jpg" },
      { name: "Tacos & Cuốn", description: "Tacos và cuốn hấp dẫn", img: "tacos_wraps.jpg" },
      { name: "Đồ uống nhanh", description: "Nước ngọt, trà đá và sữa lắc", img: "fast_beverages.jpg" },
      { name: "Combo", description: "Các phần ăn combo đầy đủ", img: "combo_meals.jpg" }
    ]);
    console.log("✅ Categories created!")

    // Menu Items
    const menuItems = await MenuItem.bulkCreate([
      // 🍔 Hamburger
      { name: "Burger phô mai", img: "https://i.pinimg.com/736x/77/fe/73/77fe73fe2444046dc17eed609e2b5bfc.jpg", price: 45000, cat_Id: categories[0].id, status: "available" },
      { name: "Burger bò kép", img: "https://i.pinimg.com/736x/f3/ec/56/f3ec56efb86db9f06b081ca7963b2c62.jpg", price: 60000, cat_Id: categories[0].id, status: "available" },

      // 🍗 Gà rán
      { name: "Đùi gà rán", img: "https://i.pinimg.com/736x/76/2f/46/762f46447081fb6863c8843933960139.jpg", price: 55000, cat_Id: categories[1].id, status: "available" },
      { name: "Cánh gà cay", img: "https://i.pinimg.com/736x/a6/f1/b0/a6f1b0266d5d44dd151cdedff6023818.jpg", price: 50000, cat_Id: categories[1].id, status: "available" },

      // 🍕 Pizza
      { name: "Pizza xúc xích", img: "https://i.pinimg.com/736x/e0/c5/b5/e0c5b5ee8e4c56894a8550da6c789d73.jpg", price: 80000, cat_Id: categories[2].id, status: "available" },
      { name: "Pizza Margherita", img: "https://i.pinimg.com/736x/9d/2f/62/9d2f62b46c1a23bd26df0d455c3a388f.jpg", price: 75000, cat_Id: categories[2].id, status: "available" },

      // 🍟 Khoai & Món phụ
      { name: "Khoai tây chiên", img: "https://i.pinimg.com/736x/6e/7b/5e/6e7b5e91357a7ce785a75d3449c1ded5.jpg", price: 30000, cat_Id: categories[3].id, status: "available" },
      { name: "Hành tây chiên vòng", img: "https://i.pinimg.com/736x/e8/fe/bf/e8febf720617dc63c7a370aa72db4ff4.jpg", price: 35000, cat_Id: categories[3].id, status: "available" },

      // 🥪 Bánh mì sandwich
      { name: "Sandwich gà nướng", img: "https://i.pinimg.com/736x/4c/cc/bd/4cccbd99609c0827647a17226772cc4e.jpg", price: 50000, cat_Id: categories[4].id, status: "available" },
      { name: "Sandwich thịt nguội & phô mai", img: "https://i.pinimg.com/736x/5a/0c/b9/5a0cb9995a50900317ce78aac7f68ba0.jpg", price: 48000, cat_Id: categories[4].id, status: "available" },

      // 🌯 Tacos & Cuốn
      { name: "Taco bò", img: "https://i.pinimg.com/736x/91/22/e7/9122e744dc7324dcd949796b0574304d.jpg", price: 45000, cat_Id: categories[5].id, status: "available" },
      { name: "Cuốn gà", img: "https://i.pinimg.com/736x/bd/45/18/bd451857fecc860b598e9d2fc32c503b.jpg", price: 47000, cat_Id: categories[5].id, status: "available" },

      // 🥤 Đồ uống nhanh
      { name: "Coca Cola", img: "https://i.pinimg.com/736x/b6/95/c3/b695c35d2feeba11ec91c563c9d353c4.jpg", price: 20000, cat_Id: categories[6].id, status: "available" },
      { name: "Pepsi", img: "https://i.pinimg.com/736x/aa/30/f4/aa30f4c992ea0945145eaf357a074fa0.jpg", price: 20000, cat_Id: categories[6].id, status: "available" },
      { name: "Sữa lắc socola", img: "https://i.pinimg.com/736x/68/6c/1c/686c1c731d606d0ddc05a2955b1852c5.jpg", price: 35000, cat_Id: categories[6].id, status: "available" },

      // 🍱 Combo
      { name: "Combo burger (Burger + Khoai + Coca)", img: "https://i.pinimg.com/736x/24/ff/05/24ff054dd026853ac5fa4b995c569917.jpg", price: 120000, cat_Id: categories[7].id, status: "available" },
      { name: "Combo pizza (Pizza + Nước)", img: "https://i.pinimg.com/736x/10/c9/80/10c9800d88cf0199dc50b1f416783490.jpg", price: 155000, cat_Id: categories[7].id, status: "available" }
    ]);
    console.log("✅ Menu items created!")

    // Vouchers
    const vouchers = await Voucher.bulkCreate([
      {
        code: "DISCOUNT10",
        description: "Giảm 10% cho đơn hàng từ 100.000đ",
        discount_type: "percent",
        discount_value: 10,
        min_order_amount: 100000,
        max_discount: 20000,
        start_date: new Date(),
        end_date: new Date(new Date().setDate(new Date().getDate() + 30)),
        limit: 100,
        status: "active"
      },
      {
        code: "FREESHIP",
        description: "Miễn phí vận chuyển cho đơn từ 50.000đ",
        discount_type: "flat",
        discount_value: 15000,
        min_order_amount: 50000,
        max_discount: null,
        start_date: new Date(),
        end_date: new Date(new Date().setDate(new Date().getDate() + 15)),
        limit: 50,
        status: "active"
      }
    ])
    console.log("✅ Vouchers created!")

    // Orders
    const orders = await Order.bulkCreate([
      { user_Id: users[1].id, total_price: 75000, voucher_Id: vouchers[0].id, status: "confirmed", payment_status: "paid" },
      { user_Id: users[2].id, total_price: 105000, voucher_Id: vouchers[1].id, status: "pending", payment_status: "unpaid" }
    ])
    console.log("✅ Orders created!")

    // Order Details
    await OrderDetail.bulkCreate([
      { order_Id: orders[0].id, menu_item_Id: menuItems[0].id, quantity: 1, price: 50000, subtotal: 50000 },
      { order_Id: orders[0].id, menu_item_Id: menuItems[2].id, quantity: 1, price: 25000, subtotal: 25000 },
      { order_Id: orders[1].id, menu_item_Id: menuItems[1].id, quantity: 2, price: 55000, subtotal: 110000 }
    ])
    console.log("✅ Order details created!")

    // Payments
    await Payment.bulkCreate([
      {
        order_Id: orders[0].id,
        user_Id: users[1].id,
        total_payment: 75000,
        method: "credit_card",
        status: "success",
        transaction_id: "GD123456"
      }
    ])
    console.log("✅ Payments created!")

    // Reviews
    await Review.bulkCreate([
      { user_Id: users[1].id, rating: 5, comment: "Món ăn rất ngon, phục vụ nhanh!" },
      { user_Id: users[2].id, rating: 4, comment: "Tạm ổn, cần cải thiện thêm phần giao hàng!" }
    ])
    console.log("✅ Reviews created!")

    // Messages
    await Message.bulkCreate([
      { user_Id: users[1].id, order_Id: orders[0].id, content: "Tôi muốn đổi địa chỉ giao hàng sang quận cẩm lệ." },
      { user_Id: users[2].id, order_Id: orders[1].id, content: "Bạn thêm giúp tôi một phần khoai tây chiên nhé!" }
    ])
    console.log("✅ Messages created!")

    // Carts
    await Cart.bulkCreate([
      {
        user_id: users[1].id,
        items: [
          { menu_item_id: menuItems[0].id, name: menuItems[0].name, quantity: 1, price: 50000 },
          { menu_item_id: menuItems[2].id, name: menuItems[2].name, quantity: 2, price: 25000 }
        ],
        status: "active"
      },
      {
        user_id: users[2].id,
        items: [
          { menu_item_id: menuItems[1].id, name: menuItems[1].name, quantity: 2, price: 55000 }
        ],
        status: "checkout"
      }
    ])
    console.log("✅ Carts created!")

    console.log("🎉 Seed data inserted successfully!")
    process.exit()
  } catch (error) {
    console.error("❌ Error inserting sample data:", error)
    process.exit(1)
  }
}

seedDatabase()
