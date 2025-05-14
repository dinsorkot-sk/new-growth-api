const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt')
const { Admin } = require('../../models');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

const SECRET_KEY = process.env.JWT_SECRET || 'MONPT';

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

exports.createAdmin = async (req, res) => {
  try {
    const { username, password, email } = req.body;

    if (!username || !password || !email) {
      return res.status(400).json({ error: 'กรุณาระบุ username password และ email' });
    }

    const existing = await Admin.findOne({ where: { username } });
    if (existing) {
      return res.status(409).json({ error: 'มีชื่อผู้ใช้นี้อยู่แล้ว' });
    }

    const saltRounds = 10;
    const password_hash = await bcrypt.hash(password, saltRounds);

    const newAdmin = await Admin.create({
      username,
      password_hash,
      email
    });

    return res.status(201).json({
      message: 'สร้างผู้ดูแลระบบสำเร็จ',
      admin: {
        id: newAdmin.id,
        username: newAdmin.username,
        email: newAdmin.email,
        created_at: newAdmin.created_at
      }
    });
  } catch (error) {
    console.error('เกิดข้อผิดพลาดในการสร้างแอดมิน:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.loginAdmin = async (req, res) => {
  try {
    const { username, password } = req.body;

    // ตรวจสอบว่า username และ password ถูกส่งมาหรือยัง
    if (!username || !password) {
      return res.status(400).json({ error: 'กรุณาระบุ username และ password' });
    }

    // หาผู้ใช้จากฐานข้อมูล
    const admin = await Admin.findOne({ where: { username } });

    // ถ้าไม่พบผู้ใช้
    if (!admin) {
      return res.status(401).json({ error: 'ชื่อผู้ใช้นี้ไม่ถูกต้อง' });
    }

    // ตรวจสอบรหัสผ่าน
    const isPasswordValid = await bcrypt.compare(password, admin.password_hash);

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'รหัสผ่านไม่ถูกต้อง' });
    }

    const token = jwt.sign(
      { id: admin.id, username: admin.username, role: 'admin' },
      SECRET_KEY,
      { expiresIn: '1h' }
    );


    // ส่งข้อมูลแอดมินกลับไป
    return res.status(200).json({
      message: 'เข้าสู่ระบบสำเร็จ',
      token,
      admin: {
        id: admin.id,
        username: admin.username,
        created_at: admin.created_at
      }
    });
  } catch (error) {
    console.error('เกิดข้อผิดพลาดในการเข้าสู่ระบบ:', error);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดที่เซิร์ฟเวอร์' });
  }
};


//generate OTP
exports.sendOTP = async (req, res) => {
  const { email } = req.body;

  try {
    const admin = await Admin.findOne({ where: { email } });

    if (!admin) {
      return res.status(404).json({ message: 'Admin not found with this email' });
    }

    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // หมดอายุใน 10 นาที


    admin.otp_code = otp;
    admin.otp_expiry = otpExpiry;
    await admin.save();


    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_HOST,           // อีเมลดึงมากจาก env
        pass: process.env.SMTP_PASSWORD         // App password ดึงมากจาก env
      }
    });

    // ส่งอีเมล
    await transporter.sendMail({
      from: '"Admin Support"' + process.env.EMAIL_HOST,
      to: email,
      subject: 'Your OTP for password reset',
      text: `Your OTP code is: ${otp}. It will expire in 10 minutes.`
    });

    return res.status(200).json({ message: 'OTP sent to your email' });

  } catch (err) {
    console.error('Send OTP Error:', err);
    return res.status(500).json({ message: 'Failed to send OTP', error: err.message });
  }
};


//verify OTP

exports.verifyOtp = async (req, res) => {
  const { email, otp_code } = req.body;

  try {
    const admin = await Admin.findOne({ where: { email } });

    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    // ตรวจสอบ OTP
    if (!admin.otp_code || admin.otp_code !== otp_code) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    // ตรวจสอบเวลาหมดอายุ
    const now = new Date();
    if (admin.otp_expires_at && new Date(admin.otp_expires_at) < now) {
      return res.status(400).json({ message: 'OTP has expired' });
    }

    // OTP ถูกต้อง → เคลียร์ OTP ทิ้ง
    admin.otp_code = null;
    admin.otp_expires_at = null;
    await admin.save();

    res.status(200).json({ message: 'OTP verified successfully' });
  } catch (err) {
    console.error('Verify OTP error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};


//reset password
exports.resetPassword = async (req, res) => {
  const { email, new_password } = req.body;

  try {
    const admin = await Admin.findOne({ where: { email } });

    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    // ตรวจสอบว่า OTP ถูกยืนยันแล้วหรือยัง (เราคลียร์ otp_code หลัง verify สำเร็จ)
    if (admin.otp_code || admin.otp_expires_at) {
      return res.status(400).json({ message: 'OTP not verified yet' });
    }

    // hash รหัสผ่านใหม่
    const hashedPassword = await bcrypt.hash(new_password, 10);

    // บันทึก
    admin.password_hash = hashedPassword;
    await admin.save();

    res.status(200).json({ message: 'Password reset successfully' });
  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ดึงข้อมูลแอดมินทั้งหมด
exports.getAllAdmins = async (req, res) => {
  try {
    const admins = await Admin.findAll();
    res.status(200).json({ admins });
  } catch (error) {
    console.error('เกิดข้อผิดพลาดในการดึงข้อมูลแอดมิน:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// ดึงข้อมูลแอดมินตาม id
exports.getAdminById = async (req, res) => {
  try {
    const { id } = req.params;
    const admin = await Admin.findByPk(id);
    if (!admin) {
      return res.status(404).json({ error: 'ไม่พบแอดมิน' });
    }
    res.status(200).json({ admin });
  } catch (error) {
    console.error('เกิดข้อผิดพลาดในการดึงข้อมูลแอดมิน:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// อัปเดตข้อมูลแอดมิน
exports.updateAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { username, email, password } = req.body;
    const admin = await Admin.findByPk(id);
    if (!admin) {
      return res.status(404).json({ error: 'ไม่พบแอดมิน' });
    }
    if (username) admin.username = username;
    if (email) admin.email = email;
    if (password) {
      const saltRounds = 10;
      admin.password_hash = await bcrypt.hash(password, saltRounds);
    }
    await admin.save();
    res.status(200).json({
      message: 'อัปเดตข้อมูลแอดมินสำเร็จ', admin: {
        id: admin.id,
        username: admin.username,
        email: admin.email,
        created_at: admin.created_at,
        updated_at: admin.updated_at
      }
    });
  } catch (error) {
    console.error('เกิดข้อผิดพลาดในการอัปเดตแอดมิน:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// ลบแอดมิน
exports.deleteAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const admin = await Admin.findByPk(id);
    if (!admin) {
      return res.status(404).json({ error: 'ไม่พบแอดมิน' });
    }
    await admin.destroy();
    res.status(200).json({ message: 'ลบแอดมินสำเร็จ' });
  } catch (error) {
    console.error('เกิดข้อผิดพลาดในการลบแอดมิน:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};


