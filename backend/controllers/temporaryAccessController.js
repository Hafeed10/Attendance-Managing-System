const { TemporaryAccess, Faculty, Class, Subject } = require('../models');
const auditService = require('../services/auditService');

const assignTemporaryAccess = async (req, res) => {
  try {
    const { originalFacultyId, replacementFacultyId, classId, subjectId, startDate, endDate, reason } = req.body;

    if (!originalFacultyId || !replacementFacultyId || !classId || !subjectId || !startDate || !endDate) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const originalFaculty = await Faculty.findByPk(originalFacultyId);
    const replacementFaculty = await Faculty.findByPk(replacementFacultyId);
    const classRecord = await Class.findByPk(classId);
    const subject = await Subject.findByPk(subjectId);

    if (!originalFaculty || !replacementFaculty || !classRecord || !subject) {
      return res.status(404).json({ error: 'Original faculty, replacement faculty, class or subject not found' });
    }

    const temporaryAccess = await TemporaryAccess.create({
      originalFacultyId,
      replacementFacultyId,
      classId,
      subjectId,
      startDate,
      endDate,
      reason: reason || null,
      isActive: true,
    });

    await auditService.logAction({
      userId: req.user.id,
      action: 'CREATE_TEMPORARY_ACCESS',
      entity: 'TemporaryAccess',
      entityId: temporaryAccess.id,
      changes: temporaryAccess.toJSON(),
      ipAddress: req.ip,
    });

    res.status(201).json({ message: 'Temporary access granted', temporaryAccess });
  } catch (error) {
    console.error('Error assigning temporary access:', error);
    res.status(500).json({ error: 'Server error while assigning temporary access', details: error.message });
  }
};

const listTemporaryAccess = async (req, res) => {
  try {
    const accessList = await TemporaryAccess.findAll({
      include: [
        { model: Faculty, as: 'OriginalFaculty', attributes: ['id', 'userId', 'phone'] },
        { model: Faculty, as: 'ReplacementFaculty', attributes: ['id', 'userId', 'phone'] },
        { model: Class, attributes: ['id', 'name', 'section', 'academicYear'] },
        { model: Subject, attributes: ['id', 'name', 'code'] },
      ],
      order: [['createdAt', 'DESC']],
    });
    res.json({ temporaryAccess: accessList });
  } catch (error) {
    console.error('Error listing temporary access:', error);
    res.status(500).json({ error: 'Server error while fetching temporary access' });
  }
};

const getTemporaryAccess = async (req, res) => {
  try {
    const { id } = req.params;
    const access = await TemporaryAccess.findByPk(id, {
      include: [
        { model: Faculty, as: 'OriginalFaculty', attributes: ['id', 'userId', 'phone'] },
        { model: Faculty, as: 'ReplacementFaculty', attributes: ['id', 'userId', 'phone'] },
        { model: Class, attributes: ['id', 'name', 'section', 'academicYear'] },
        { model: Subject, attributes: ['id', 'name', 'code'] },
      ],
    });
    if (!access) return res.status(404).json({ error: 'Temporary access record not found' });
    res.json({ temporaryAccess: access });
  } catch (error) {
    console.error('Error fetching temporary access:', error);
    res.status(500).json({ error: 'Server error while fetching temporary access' });
  }
};

const updateTemporaryAccess = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const access = await TemporaryAccess.findByPk(id);
    if (!access) return res.status(404).json({ error: 'Temporary access record not found' });

    const before = access.toJSON();
    await access.update(updates);
    const after = access.toJSON();

    await auditService.logAction({
      userId: req.user.id,
      action: 'UPDATE_TEMPORARY_ACCESS',
      entity: 'TemporaryAccess',
      entityId: access.id,
      changes: auditService.buildChanges(before, after),
      ipAddress: req.ip,
    });

    res.json({ message: 'Temporary access updated', temporaryAccess: access });
  } catch (error) {
    console.error('Error updating temporary access:', error);
    res.status(500).json({ error: 'Server error while updating temporary access', details: error.message });
  }
};

const revokeTemporaryAccess = async (req, res) => {
  try {
    const { id } = req.params;
    const access = await TemporaryAccess.findByPk(id);
    if (!access) return res.status(404).json({ error: 'Temporary access record not found' });

    if (!access.isActive) return res.status(400).json({ error: 'Temporary access is already revoked' });

    const before = access.toJSON();
    await access.update({ isActive: false });
    const after = access.toJSON();

    await auditService.logAction({
      userId: req.user.id,
      action: 'REVOKE_TEMPORARY_ACCESS',
      entity: 'TemporaryAccess',
      entityId: access.id,
      changes: auditService.buildChanges(before, after),
      ipAddress: req.ip,
    });

    res.json({ message: 'Temporary access revoked', temporaryAccess: access });
  } catch (error) {
    console.error('Error revoking temporary access:', error);
    res.status(500).json({ error: 'Server error while revoking temporary access', details: error.message });
  }
};

module.exports = {
  assignTemporaryAccess,
  listTemporaryAccess,
  getTemporaryAccess,
  updateTemporaryAccess,
  revokeTemporaryAccess,
};