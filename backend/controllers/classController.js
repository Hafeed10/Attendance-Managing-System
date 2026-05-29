const { Class } = require('../models');

const createClass = async (req, res) => {
  try {
    const { name, section, academicYear } = req.body;
    if (!name || !academicYear) return res.status(400).json({ error: 'Missing required fields' });

    const newClass = await Class.create({ name, section: section || null, academicYear });
    res.status(201).json({ message: 'Class created', class: newClass });
  } catch (error) {
    console.error('Error creating class:', error);
    res.status(500).json({ error: 'Server error while creating class' });
  }
};

const listClasses = async (req, res) => {
  try {
    const classes = await Class.findAll();
    res.json({ classes });
  } catch (error) {
    console.error('Error fetching classes:', error);
    res.status(500).json({ error: 'Server error while fetching classes' });
  }
};

const getClassById = async (req, res) => {
  try {
    const { id } = req.params;
    const cls = await Class.findByPk(id);
    if (!cls) return res.status(404).json({ error: 'Class not found' });
    res.json({ class: cls });
  } catch (error) {
    console.error('Error fetching class:', error);
    res.status(500).json({ error: 'Server error while fetching class' });
  }
};

const updateClass = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const cls = await Class.findByPk(id);
    if (!cls) return res.status(404).json({ error: 'Class not found' });
    await cls.update(updates);
    res.json({ message: 'Class updated', class: cls });
  } catch (error) {
    console.error('Error updating class:', error);
    res.status(500).json({ error: 'Server error while updating class' });
  }
};

const deleteClass = async (req, res) => {
  try {
    const { id } = req.params;
    const cls = await Class.findByPk(id);
    if (!cls) return res.status(404).json({ error: 'Class not found' });
    await cls.destroy();
    res.json({ message: 'Class removed' });
  } catch (error) {
    console.error('Error deleting class:', error);
    res.status(500).json({ error: 'Server error while deleting class' });
  }
};

module.exports = { createClass, listClasses, getClassById, updateClass, deleteClass };