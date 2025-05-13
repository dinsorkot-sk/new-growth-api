const { Admission } = require('../../models');

exports.getAll = async (req, res) => {
  const admissions = await Admission.findAll({ order: [['startDate', 'ASC']] });
  res.json(admissions);
};

exports.create = async (req, res) => {
  const admission = await Admission.create(req.body);
  res.status(201).json(admission);
};

exports.update = async (req, res) => {
  const { id } = req.params;
  await Admission.update(req.body, { where: { id } });
  const updated = await Admission.findByPk(id);
  res.json(updated);
};

exports.delete = async (req, res) => {
  const { id } = req.params;
  await Admission.destroy({ where: { id } });
  res.status(204).send();
};