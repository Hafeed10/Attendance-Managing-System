const { Subject } = require('../models');

const createSubject = async (req, res) => {
  try {
    const { name, code, classId } = req.body;
    if (!name || !classId) return res.status(400).json({ error: 'Missing required fields' });

    const subject = await Subject.create({ name, code: code || null, classId });
    res.status(201).json({ message: 'Subject created', subject });
  } catch (error) {
    console.error('Error creating subject:', error);
    res.status(500).json({ error: 'Server error while creating subject' });
  }
};

const listSubjects = async (req, res) => {
  try {
    const subjects = await Subject.findAll();
    res.json({ subjects });
  } catch (error) {
    console.error('Error fetching subjects:', error);
    res.status(500).json({ error: 'Server error while fetching subjects' });
  }
};

const getSubject = async (req, res) => {
  try {
    const { id } = req.params;
    const subject = await Subject.findByPk(id);
    if (!subject) return res.status(404).json({ error: 'Subject not found' });
    res.json({ subject });
  } catch (error) {
    console.error('Error fetching subject:', error);
    res.status(500).json({ error: 'Server error while fetching subject' });
  }
};

const updateSubject = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const subject = await Subject.findByPk(id);
    if (!subject) return res.status(404).json({ error: 'Subject not found' });
    await subject.update(updates);
    res.json({ message: 'Subject updated', subject });
  } catch (error) {
    console.error('Error updating subject:', error);
    res.status(500).json({ error: 'Server error while updating subject' });
  }
};

const deleteSubject = async (req, res) => {
  try {
    const { id } = req.params;
    const subject = await Subject.findByPk(id);
    if (!subject) return res.status(404).json({ error: 'Subject not found' });
    await subject.destroy();
    res.json({ message: 'Subject removed' });
  } catch (error) {
    console.error('Error deleting subject:', error);
    res.status(500).json({ error: 'Server error while deleting subject' });
  }
};

module.exports = { createSubject, listSubjects, getSubject, updateSubject, deleteSubject };