import { Payment, Order, User } from "../models/index.js"
import TryCatch from "../utils/trycatch.js"
import moment from 'moment'
import crypto from 'crypto'
import qs from 'qs'

// Thêm thông tin thanh toán
export const createPayment = TryCatch(async (req, res) => {
  const { order_Id, user_Id, total_payment, method, status, transaction_id } = req.body

  const order = await Order.findByPk(order_Id)
  if (!order) return res.status(404).json({ message: "Đơn hàng không tồn tại!" })

  const user = await User.findByPk(user_Id)
  if (!user) return res.status(404).json({ message: "Người dùng không tồn tại!" })

  const payment = await Payment.create({
    order_Id,
    user_Id,
    total_payment,
    method,
    status,
    transaction_id,
  })

  res.status(201).json({ message: "Thêm thông tin thanh toán thành công!", payment })
})

// Lấy thông tin thanh toán theo order_Id
export const getPaymentByOrderId = TryCatch(async (req, res) => {
  const { orderId } = req.params

  const payment = await Payment.findOne({
    where: { order_Id: orderId },
    include: [{ model: Order, attributes: ["total_price", "status"] }],
  })

  if (!payment) return res.status(404).json({ message: "Không tìm thấy thông tin thanh toán!" })

  res.json(payment)
})

// Cập nhật trạng thái thanh toán
export const updatePayment = TryCatch(async (req, res) => {
  const { id } = req.params
  const { status, transaction_id } = req.body

  const payment = await Payment.findByPk(id)
  console.log('payment', payment)
  if (!payment) return res.status(404).json({ message: "Thông tin thanh toán không tồn tại!" })

  await payment.update({ status, transaction_id })

  res.json({ message: "Cập nhật trạng thái thanh toán thành công!", payment })
})

// Xóa thông tin thanh toán
export const deletePayment = TryCatch(async (req, res) => {
  const { id } = req.params

  const payment = await Payment.findByPk(id)
  if (!payment) return res.status(404).json({ message: "Thông tin thanh toán không tồn tại!" })

  await payment.destroy()
  res.json({ message: "Xóa thông tin thanh toán thành công!" })
})



// Khởi tạo thanh toán VNPAY
export const initiateVNPAYPayment = TryCatch(async (req, res) => {
  console.log('------------------ INITIATE VNPAY PAYMENT ------------------')
  const vnpayConfig = {
    vnp_TmnCode: '6DQ11GO2',
    vnp_HashSecret: '93NR9GHZAQ92R9X5QVQ23DJSFW7X9ROK',
    vnp_Url: 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html',
    vnp_Api: 'https://sandbox.vnpayment.vn/merchant_webapi/api/transaction',
    vnp_ReturnUrl: 'http://localhost:5173/orders',
    vnp_OrderType: 'other',
  };
  
  const { orderId, amount, orderInfo, returnUrl, currency = 'VND' } = req.body

  // Validate input
  if (!orderId || !amount || isNaN(amount) || amount <= 0) {
    return res.status(400).json({
      code: '01',
      message: 'Thông tin thanh toán không hợp lệ!'
    })
  }

  const Order = {
    findByPk: async (id) => {
      if (id === orderId) {
        return { id: orderId, user_Id: 'user123' }
      }
      return null
    }
  }

  const order = await Order.findByPk(orderId)
  if (!order) {
    return res.status(404).json({
      code: '02',
      message: 'Đơn hàng không tồn tại!'
    })
  }

  // Get IP address
  const ipAddr = req.headers['x-forwarded-for'] ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    req.connection.socket.remoteAddress

  // Format date
  const createDate = moment().format('YYYYMMDDHHmmss')

  // Process amount
  let amountVND = Math.round(Number(amount))
  if (currency === 'USD') {
    const exchangeRate = 24500
    amountVND = Math.round(amount * exchangeRate)
  }

  if (amountVND < 1000) {
    return res.status(400).json({
      code: '03',
      message: 'Số tiền thanh toán tối thiểu là 1,000 VND'
    })
  }

  // Create VNPay params - THÊM vnp_ExpireDate
  const vnpParams = {
    vnp_Version: '2.1.0',
    vnp_Command: 'pay',
    vnp_TmnCode: vnpayConfig.vnp_TmnCode,
    vnp_Amount: amountVND * 100,
    vnp_CurrCode: 'VND',
    vnp_TxnRef: orderId.toString(),
    vnp_OrderInfo: orderInfo || `Thanh toán đơn hàng ${orderId}`.substring(0, 255),
    vnp_OrderType: vnpayConfig.vnp_OrderType,
    vnp_Locale: 'vn',
    vnp_ReturnUrl: returnUrl || vnpayConfig.vnp_ReturnUrl,
    vnp_IpAddr: ipAddr.split(',')[0].trim(),
    vnp_CreateDate: createDate,
    vnp_ExpireDate: moment().add(15, 'minutes').format('YYYYMMDDHHmmss') // Thêm thời hạn thanh toán
  }

  // console.log('Params before hash:', JSON.stringify(vnpParams, null, 2))

  // Sort params alphabetically
  const sortedParams = Object.keys(vnpParams).sort().reduce((acc, key) => {
    if (vnpParams[key] !== undefined && vnpParams[key] !== null && vnpParams[key] !== '') {
      acc[key] = vnpParams[key]
    }
    return acc
  }, {})

  // Tạo chuỗi dữ liệu ký - SỬA LẠI CÁCH ENCODE
  const signData = Object.keys(sortedParams)
    .map(key => `${key}=${encodeURIComponent(sortedParams[key])}`)
    .join('&')

  // console.log('Data to hash:', signData)

  // Tạo secure hash - THÊM BUFFER VÀ TRIM() HASH SECRET
  const hmac = crypto.createHmac('sha512', vnpayConfig.vnp_HashSecret.trim())
  const secureHash = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex')
  // console.log('Generated hash:', secureHash)

  // Thêm chữ ký vào params
  const paymentParams = {
    ...sortedParams,
    vnp_SecureHash: secureHash
  }

  // Tạo URL thanh toán - SỬA LẠI CÁCH ENCODE URL
  const paymentUrl = `${vnpayConfig.vnp_Url}?${qs.stringify(paymentParams, { encode: true })}`
  // console.log('Generated payment URL:', paymentUrl)

  const Payment = {
    create: async (data) => {
      return { id: Math.random().toString(36).substring(7), ...data }
    }
  }

  const paymentRecord = await Payment.create({
    order_Id: orderId,
    user_Id: order.user_Id,
    total_payment: amountVND,
    method: 'VNPAY',
    status: 'pending',
    transaction_id: null,
    currency: currency,
    vnp_RequestId: `${orderId}_${Date.now()}`,
    vnp_Amount: amountVND * 100,
  })

  return res.status(200).json({
    code: '00',
    message: 'Khởi tạo thanh toán thành công',
    data: paymentUrl,
    paymentId: paymentRecord.id
  })
})

// Xử lý return từ VNPAY
export const vnpayReturn = TryCatch(async (req, res) => {
  const vnpParams = { ...req.query }
  const secureHash = vnpParams.vnp_SecureHash

  // Xóa các tham số không cần thiết để kiểm tra chữ ký
  delete vnpParams.vnp_SecureHash
  delete vnpParams.vnp_SecureHashType

  // Sắp xếp lại params theo thứ tự
  const sortedParams = Object.keys(vnpParams).sort().reduce((acc, key) => {
    acc[key] = vnpParams[key]
    return acc
  }, {})

  // Tạo chữ ký để kiểm tra
  const signData = qs.stringify(sortedParams, { encode: false })
  const checkHash = crypto
    .createHmac('sha512', vnpayConfig.vnp_HashSecret)
    .update(signData)
    .digest('hex')

  // Kiểm tra chữ ký
  if (secureHash !== checkHash) {
    return res.status(400).json({
      code: '97',
      message: 'Chữ ký không hợp lệ!'
    })
  }

  const orderId = vnpParams.vnp_TxnRef
  const payment = await Payment.findOne({ where: { order_Id: orderId } })

  if (!payment) {
    return res.status(404).json({
      code: '01',
      message: 'Không tìm thấy thanh toán!'
    })
  }

  // Xử lý kết quả thanh toán
  if (vnpParams.vnp_ResponseCode === '00' && vnpParams.vnp_TransactionStatus === '00') {
    await payment.update({
      status: 'success',
      transaction_id: vnpParams.vnp_TransactionNo,
      bank_code: vnpParams.vnp_BankCode,
      pay_date: vnpParams.vnp_PayDate ? moment(vnpParams.vnp_PayDate, 'YYYYMMDDHHmmss').toDate() : null
    })

    // Cập nhật trạng thái đơn hàng nếu cần
    await Order.update(
      { payment_status: 'paid' },
      { where: { id: orderId } }
    )

    return res.status(200).json({
      code: '00',
      message: 'Thanh toán thành công!'
    })
  } else {
    await payment.update({
      status: 'failed',
      error_code: vnpParams.vnp_ResponseCode,
      error_message: vnpParams.vnp_Message
    })

    return res.status(400).json({
      code: vnpParams.vnp_ResponseCode || '99',
      message: vnpParams.vnp_Message || 'Thanh toán thất bại!'
    })
  }
})