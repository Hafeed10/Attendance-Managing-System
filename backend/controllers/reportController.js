const fs = require('fs');
const path = require('path');
const { AttendanceReport } = require('../models');
const reportService = require('../services/reportService');
const auditService = require('../services/auditService');

const generateClassReport = async (req, res) => {
  try {
    const { classId, month, year } = req.body;
    if (!classId || !month || !year) {
      return res.status(400).json({ error: 'Missing required fields classId, month, year' });
    }

    const report = await reportService.generateMonthlyClassReport({ classId, month, year, generatedBy: req.user.id });

    await auditService.logAction({
      userId: req.user.id,
      action: 'GENERATE_CLASS_REPORT',
      entity: 'AttendanceReport',
      entityId: report.id,
      changes: report.toJSON(),
      ipAddress: req.ip,
    });

    res.status(201).json({ message: 'Class report generated', report, downloadUrl: `/api/admin/reports/download/${report.filePath}` });
  } catch (error) {
    console.error('Error generating class report:', error);
    res.status(error.statusCode || 500).json({ error: error.message || 'Server error while generating report' });
  }
};

const generateStudentReport = async (req, res) => {
  try {
    const { studentId, month, year } = req.body;
    if (!studentId || !month || !year) {
      return res.status(400).json({ error: 'Missing required fields studentId, month, year' });
    }

    const report = await reportService.generateStudentReport({ studentId, month, year, generatedBy: req.user.id });

    await auditService.logAction({
      userId: req.user.id,
      action: 'GENERATE_STUDENT_REPORT',
      entity: 'AttendanceReport',
      entityId: report.id,
      changes: report.toJSON(),
      ipAddress: req.ip,
    });

    res.status(201).json({ message: 'Student report generated', report, downloadUrl: `/api/admin/reports/download/${report.filePath}` });
  } catch (error) {
    console.error('Error generating student report:', error);
    res.status(error.statusCode || 500).json({ error: error.message || 'Server error while generating report' });
  }
};

const generateDefaulterReport = async (req, res) => {
  try {
    const { classId } = req.body;

    const report = await reportService.generateDefaulterReport({ classId, generatedBy: req.user.id });

    await auditService.logAction({
      userId: req.user.id,
      action: 'GENERATE_DEFAULTER_REPORT',
      entity: 'AttendanceReport',
      entityId: report.id,
      changes: report.toJSON(),
      ipAddress: req.ip,
    });

    res.status(201).json({ message: 'Defaulter report generated', report, downloadUrl: `/api/admin/reports/download/${report.filePath}` });
  } catch (error) {
    console.error('Error generating defaulter report:', error);
    res.status(error.statusCode || 500).json({ error: error.message || 'Server error while generating report' });
  }
};

const listReports = async (req, res) => {
  try {
    const reports = await AttendanceReport.findAll({ order: [['createdAt', 'DESC']], limit: 100 });
    res.json({ reports });
  } catch (error) {
    console.error('Error listing reports:', error);
    res.status(500).json({ error: 'Server error while listing reports' });
  }
};

const downloadReport = async (req, res) => {
  try {
    const fileName = path.basename(req.params.fileName);
    const filePath = reportService.getReportFilePath(fileName);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Report file not found' });
    }

    res.download(filePath, fileName);
  } catch (error) {
    console.error('Error downloading report:', error);
    res.status(500).json({ error: 'Server error while downloading report' });
  }
};

module.exports = {
  generateClassReport,
  generateStudentReport,
  generateDefaulterReport,
  listReports,
  downloadReport,
};