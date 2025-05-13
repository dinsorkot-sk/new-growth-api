const { Admission } = require('../../models');
const { Op } = require('sequelize');

exports.getAll = async (req, res) => {
  const admissions = await Admission.findAll({ order: [['startDate', 'ASC']] });
  res.json(admissions);
};

exports.getActive = async (req, res) => {
  const now = new Date();
  const admissions = await Admission.findAll();
  // ใส่ logic เดียวกับ getCurrentBatch ใน frontend
  // ... (เหมือนในฟังก์ชัน getCurrentBatch)
  // ส่ง batch ที่ตรงกับช่วงเวลาปัจจุบัน
  // (สามารถนำ logic จาก frontend ไปแปลงเป็น JS ฝั่ง backend ได้)
};