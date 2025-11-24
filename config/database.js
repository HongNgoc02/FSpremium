// import { Sequelize } from 'sequelize'
// import dotenv from 'dotenv'

// dotenv.config()

// const sequelize = new Sequelize(
//   process.env.DB_NAME,
//   process.env.DB_USER,
//   process.env.DB_PASSWORD || null,
//   {
//     host: process.env.DB_HOST,
//     dialect: 'mysql',
//     logging: false,
//   }
// )

// export const connectDB = async () => {
//   try {
//     await sequelize.authenticate()
//     console.log('✅ Connected to MySQL using Sequelize!')
//   } catch (error) {
//     console.error('❌ Database connection failed:', error)
//   }
// }

// export default sequelize



import { Sequelize } from 'sequelize'
import dotenv from 'dotenv'

dotenv.config()

let sequelize;

// Kiểm tra xem có biến môi trường DATABASE_URL không (Render sẽ tự cung cấp cái này)
if (process.env.DATABASE_URL) {
  // 🟢 TRƯỜNG HỢP 1: Chạy trên RENDER (Dùng PostgreSQL + SSL)
  console.log("🚀 Environment: Render (Connecting to PostgreSQL...)");
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    protocol: 'postgres',
    logging: false,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false // Quan trọng: Chấp nhận chứng chỉ SSL của Render để sửa lỗi "self signed certificate"
      }
    }
  });
} else {
  // 🟠 TRƯỜNG HỢP 2: Chạy trên MÁY TÍNH (Dùng MySQL như cũ)
  console.log("🏠 Environment: Localhost (Connecting to MySQL...)");
  sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD || null,
    {
      host: process.env.DB_HOST,
      dialect: 'mysql',
      logging: false,
    }
  );
}

export const connectDB = async () => {
  try {
    await sequelize.authenticate()
    console.log('✅ Database connected successfully!')
  } catch (error) {
    console.error('❌ Database connection failed:', error)
  }
}

export default sequelize