const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt')
const { Admin } = require('../../models');

const SECRET_KEY = process.env.JWT_SECRET || 'MONPT';

exports.createAdmin = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'กรุณาระบุ username และ password' });
    }

    const existing = await Admin.findOne({ where: { username } });
    if (existing) {
      return res.status(409).json({ error: 'มีชื่อผู้ใช้นี้อยู่แล้ว' });
    }

    const saltRounds = 10;
    const password_hash = await bcrypt.hash(password, saltRounds);

    const newAdmin = await Admin.create({
      username,
      password_hash
    });

    return res.status(201).json({
      message: 'สร้างผู้ดูแลระบบสำเร็จ',
      admin: {
        id: newAdmin.id,
        username: newAdmin.username,
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


