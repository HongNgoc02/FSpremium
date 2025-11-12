// Cài đặt or thêm package vào dự án (project)
import express from 'express'
import cors from 'cors'
import setupSwagger from './swagger/swagger.js'
import dotenv from 'dotenv'
import { syncDB } from './models/index.js'
import http from 'http'
import { initializeSocketIO } from './socket.js'

// Khai báo app
const app = express()
const server = http.createServer(app);

// Sử dụng middleware
app.use(cors())
app.use(express.json())
dotenv.config()

// Gán route cho app
import appRoutes from './routes/app.route.js'

// Using app.routes
app.use('/api', appRoutes)

// Cài đặt swagger
setupSwagger(app)

// Tạo hàm startServer
const startServer = async () => {
    try {
        await syncDB()
        console.log("✅ Database connected & synced!")

        app.get("/", (req, res) => {
            res.send("Backend is running on Windows! 🚀")
        })

        const PORT = process.env.PORT || 5000
        server.listen(PORT, () => {
            console.log(`🚀 Server is running on http://localhost:${PORT}`)
            console.log('📌 API Docs at: http://localhost:5000/api-docs')
            initializeSocketIO(server)
            console.log('🔌 Socket.IO initialized!')
        })
    } catch (error) {
        console.error("❌ Server failed to start:", error)
    }
}

// Khởi động server
startServer()