import axios from 'axios';
import moment from 'moment-timezone';
import cron from 'node-cron';
import nodemailer from 'nodemailer';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

// Lấy __dirname trong ES6
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cấu hình
const API_DOMAIN = 'http://localhost:5000';
const TIMEZONE = 'Asia/Da_Nang';

const EMAIL_CONFIG = {
  service: 'Gmail',
  auth: {
    user: 'huuthuytrann3004@gmail.com',
    pass: 'dhgv reub rwjw fdcq',
  },
};
const EMAIL_RECIPIENT = 'huuthuytrann3004@gmail.com';
const EMAIL_SUBJECT = 'Thống kê đơn hằng ngày';

const LOG_FILE_PATH = path.join(__dirname, 'daily_report.log');

const getDailyOrderSummary = async () => {
  const today = moment().tz(TIMEZONE).format('YYYY-MM-DD');
  const apiUrl = `${API_DOMAIN}/api/orders/daily-summary?date=${today}`;

  try {
    const response = await axios.get(apiUrl);
    return {
      orderCount: response.data.order_count || 0,
      totalPrice: response.data.total_price || 0,
    };
  } catch (error) {
    const errorMessage = `Lỗi khi gọi API: ${error.message}`;
    console.error(errorMessage);
    await logMessage(errorMessage);
    return { orderCount: 0, totalPrice: 0 };
  }
};

const sendEmail = async (subject, body) => {
  try {
    const transporter = nodemailer.createTransport(EMAIL_CONFIG);
    const todayFormatted = moment().tz(TIMEZONE).format('DD [tháng] MM [năm] YYYY');

    const emailHTML = `
      <!DOCTYPE html>
      <html lang="vi">
      <head>
        <meta charset="UTF-8" />
        <title>${subject}</title>
        <style>
          body { font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px; }
          .container { max-width: 600px; margin: auto; background: white; padding: 30px; border-radius: 8px; }
          h2 { color: #007bff; border-bottom: 2px solid #eee; padding-bottom: 10px; }
          p { margin-bottom: 15px; }
          .highlight { font-weight: bold; color: #28a745; }
          .footer { margin-top: 25px; font-size: 0.9em; color: #777; text-align: center; }
        </style>
      </head>
      <body>
        <div class="container">
          <h2>${subject} - ${todayFormatted}</h2>
          <p>Xin chào,</p>
          <p>Đây là thống kê đơn hàng ngày của chúng tôi:</p>
          ${body.split('\n').map(line => `<p>${line}</p>`).join('')}
          <p>Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi!</p>
          <div class="footer">Đây là email tự động. Vui lòng không trả lời.</div>
        </div>
      </body>
      </html>
    `;

    await transporter.sendMail({
      from: EMAIL_CONFIG.auth.user,
      to: EMAIL_RECIPIENT,
      subject,
      html: emailHTML,
    });

    const logMessageText = 'Email thống kê đã được gửi thành công.';
    console.log(logMessageText);
    await logMessage(logMessageText);
  } catch (error) {
    const errorMessage = `Lỗi khi gửi email: ${error.message}`;
    console.error(errorMessage);
    await logMessage(errorMessage);
  }
};

const logMessage = async (message) => {
  const timestamp = moment().tz(TIMEZONE).format('YYYY-MM-DD HH:mm:ss');
  const logEntry = `[${timestamp}] ${message}\n`;

  try {
    await fs.appendFile(LOG_FILE_PATH, logEntry, 'utf8');
  } catch (error) {
    console.error('Lỗi khi ghi log:', error);
  }
};

const main = async () => {
  const { orderCount, totalPrice } = await getDailyOrderSummary();
  const todayFormatted = moment().tz(TIMEZONE).format('YYYY-MM-DD');
  const formattedTotalPrice = totalPrice.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });

  const message = `Thống kê đơn hàng ngày ${todayFormatted}:\n` +
                  `- Số lượng đơn hàng: ${orderCount}\n` +
                  `- Tổng giá trị đơn hàng: ${formattedTotalPrice}`;

  console.log('Thông tin thống kê:', message);
  await logMessage(`Thông tin thống kê: ${message}`);
  await sendEmail(EMAIL_SUBJECT, message);
};

// Cron job mỗi phút (test)
cron.schedule('* * * * * *', main, {
  scheduled: true,
  timezone: TIMEZONE,
});

console.log('⏰ Cron job đã được thiết lập.');
