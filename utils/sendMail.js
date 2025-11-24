import nodemailer from 'nodemailer'

export const sendMail = async (to, subject, htmlContent) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    }
  })

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject,
    html: htmlContent,
  }

  try {
    const info = await transporter.sendMail(mailOptions)
    console.log('✅ Gửi email thành công!')
    return info
  } catch (error) {
    console.error('❌ Lỗi khi gửi email:', error)
    throw new Error('Gửi email thất bại')
  }
}
