/**
 * Report generation service — PDF export (PRD 4.1.5, 6.3, FR-6).
 * 
 * Generates attendance reports in PDF format using PDFKit.
 */
const PDFDocument = require('pdfkit');
const path = require('path');
const fs = require('fs');
const { AttendanceReport } = require('../models');
const attendanceService = require('./attendanceService');
const { Student, Class, Subject, Attendance } = require('../models');
const { Op } = require('sequelize');

// Ensure reports directory exists
const REPORTS_DIR = path.join(__dirname, '..', 'reports');
if (!fs.existsSync(REPORTS_DIR)) {
  fs.mkdirSync(REPORTS_DIR, { recursive: true });
}

/**
 * Generate a monthly attendance report PDF for a class.
 * @param {Object} options - { classId, month, year, generatedBy }
 * @returns {Promise<Object>} - report record with filePath
 */
const generateMonthlyClassReport = async ({ classId, month, year, generatedBy }) => {
  const classInfo = await Class.findByPk(classId);
  if (!classInfo) throw Object.assign(new Error('Class not found'), { statusCode: 404 });

  const students = await Student.findAll({
    where: { classId },
    order: [['rollNumber', 'ASC']],
  });

  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0);
  const monthName = startDate.toLocaleString('en', { month: 'long' });

  // Create PDF
  const fileName = `report_${classInfo.name}_${classInfo.section || 'all'}_${monthName}_${year}_${Date.now()}.pdf`;
  const filePath = path.join(REPORTS_DIR, fileName);
  const doc = new PDFDocument({ margin: 40, size: 'A4' });
  const stream = fs.createWriteStream(filePath);
  doc.pipe(stream);

  // Header
  doc.fontSize(18).font('Helvetica-Bold')
    .text('Attendance Managing System', { align: 'center' });
  doc.moveDown(0.5);
  doc.fontSize(14)
    .text(`Monthly Attendance Report — ${monthName} ${year}`, { align: 'center' });
  doc.moveDown(0.3);
  doc.fontSize(11).font('Helvetica')
    .text(`Class: ${classInfo.name} ${classInfo.section || ''}  |  Academic Year: ${classInfo.academicYear}`, { align: 'center' });
  doc.moveDown(1);

  // Table header
  const tableTop = doc.y;
  const col1 = 40, col2 = 100, col3 = 280, col4 = 350, col5 = 420, col6 = 490;

  doc.fontSize(10).font('Helvetica-Bold');
  doc.text('Roll No', col1, tableTop);
  doc.text('Student Name', col2, tableTop);
  doc.text('Present', col3, tableTop);
  doc.text('Absent', col4, tableTop);
  doc.text('Total', col5, tableTop);
  doc.text('Percentage', col6, tableTop);

  doc.moveTo(col1, tableTop + 15).lineTo(555, tableTop + 15).stroke();
  let yPos = tableTop + 22;

  doc.font('Helvetica').fontSize(9);
  for (const student of students) {
    if (yPos > 750) {
      doc.addPage();
      yPos = 40;
    }

    const stats = await attendanceService.getMonthlyAttendance(student.id, month, year);
    const pctColor = stats.percentage < 80 ? 'red' : '#333';

    doc.fillColor('#333')
      .text(student.rollNumber, col1, yPos)
      .text(student.name, col2, yPos)
      .text(String(stats.present), col3, yPos)
      .text(String(stats.absent), col4, yPos)
      .text(String(stats.total), col5, yPos);
    doc.fillColor(pctColor)
      .text(`${stats.percentage}%`, col6, yPos);

    yPos += 18;
  }

  // Footer
  doc.fillColor('#888').fontSize(8);
  doc.text(
    `Generated on ${new Date().toLocaleString()} | Students below 80% are highlighted in red`,
    40, 780, { align: 'center' }
  );

  doc.end();

  // Wait for file to finish writing
  await new Promise((resolve) => stream.on('finish', resolve));

  // Save report record to database
  const report = await AttendanceReport.create({
    type: 'monthly',
    generatedBy,
    filePath: fileName,
    format: 'pdf',
    filters: { classId, month, year },
  });

  return report;
};

/**
 * Generate a student-wise attendance report PDF.
 * @param {Object} options - { studentId, month, year, generatedBy }
 * @returns {Promise<Object>}
 */
const generateStudentReport = async ({ studentId, month, year, generatedBy }) => {
  const student = await Student.findByPk(studentId, {
    include: [{ model: Class }],
  });
  if (!student) throw Object.assign(new Error('Student not found'), { statusCode: 404 });

  const monthlyData = await attendanceService.getMonthlyAttendance(studentId, month, year);
  const subjectData = await attendanceService.getSubjectWiseAttendance(studentId);
  const monthName = new Date(year, month - 1, 1).toLocaleString('en', { month: 'long' });

  const fileName = `report_student_${student.rollNumber}_${monthName}_${year}_${Date.now()}.pdf`;
  const filePath = path.join(REPORTS_DIR, fileName);
  const doc = new PDFDocument({ margin: 40, size: 'A4' });
  const stream = fs.createWriteStream(filePath);
  doc.pipe(stream);

  // Header
  doc.fontSize(18).font('Helvetica-Bold')
    .text('Attendance Managing System', { align: 'center' });
  doc.moveDown(0.5);
  doc.fontSize(14)
    .text(`Student Attendance Report — ${monthName} ${year}`, { align: 'center' });
  doc.moveDown(1);

  // Student info
  doc.fontSize(11).font('Helvetica');
  doc.text(`Name: ${student.name}`);
  doc.text(`Roll Number: ${student.rollNumber}`);
  doc.text(`Class: ${student.Class ? `${student.Class.name} ${student.Class.section || ''}` : 'N/A'}`);
  doc.text(`Division: ${student.division}`);
  doc.moveDown(0.5);

  // Monthly summary
  doc.font('Helvetica-Bold').text('Monthly Summary');
  doc.font('Helvetica');
  doc.text(`Total Classes: ${monthlyData.total}`);
  doc.text(`Present: ${monthlyData.present}`);
  doc.text(`Absent: ${monthlyData.absent}`);
  doc.text(`Late: ${monthlyData.late}`);
  const pctText = `Overall Percentage: ${monthlyData.percentage}%`;
  doc.fillColor(monthlyData.percentage < 80 ? 'red' : '#333').text(pctText);
  doc.fillColor('#333');
  doc.moveDown(1);

  // Subject-wise breakdown
  doc.font('Helvetica-Bold').text('Subject-wise Attendance');
  doc.moveDown(0.3);

  doc.fontSize(10).font('Helvetica-Bold');
  const sCol1 = 40, sCol2 = 200, sCol3 = 300, sCol4 = 400;
  doc.text('Subject', sCol1, doc.y);
  const headerY = doc.y;
  doc.text('Present', sCol2, headerY);
  doc.text('Total', sCol3, headerY);
  doc.text('Percentage', sCol4, headerY);
  doc.moveDown(0.2);
  doc.moveTo(sCol1, doc.y).lineTo(500, doc.y).stroke();
  doc.moveDown(0.3);

  doc.font('Helvetica').fontSize(9);
  for (const sub of subjectData) {
    const subName = sub.subject ? `${sub.subject.name} (${sub.subject.code || ''})` : 'Unknown';
    doc.text(subName, sCol1, doc.y);
    const rowY = doc.y;
    doc.text(String(sub.present), sCol2, rowY);
    doc.text(String(sub.total), sCol3, rowY);
    doc.fillColor(sub.percentage < 80 ? 'red' : '#333')
      .text(`${sub.percentage}%`, sCol4, rowY);
    doc.fillColor('#333');
    doc.moveDown(0.3);
  }

  doc.end();
  await new Promise((resolve) => stream.on('finish', resolve));

  const report = await AttendanceReport.create({
    type: 'student_wise',
    generatedBy,
    filePath: fileName,
    format: 'pdf',
    filters: { studentId, month, year },
  });

  return report;
};

/**
 * Generate a defaulter report PDF.
 * @param {Object} options - { classId (optional), generatedBy }
 * @returns {Promise<Object>}
 */
const generateDefaulterReport = async ({ classId, generatedBy }) => {
  const defaulters = await attendanceService.getDefaulters(classId);

  const fileName = `report_defaulters_${classId || 'all'}_${Date.now()}.pdf`;
  const filePath = path.join(REPORTS_DIR, fileName);
  const doc = new PDFDocument({ margin: 40, size: 'A4' });
  const stream = fs.createWriteStream(filePath);
  doc.pipe(stream);

  doc.fontSize(18).font('Helvetica-Bold')
    .text('Attendance Managing System', { align: 'center' });
  doc.moveDown(0.5);
  doc.fontSize(14)
    .text('Defaulter Report — Students Below 80% Attendance', { align: 'center' });
  doc.moveDown(1);

  if (defaulters.length === 0) {
    doc.fontSize(12).font('Helvetica')
      .text('No defaulters found. All students meet the minimum attendance requirement.', { align: 'center' });
  } else {
    // Table
    const col1 = 40, col2 = 100, col3 = 250, col4 = 340, col5 = 420, col6 = 490;
    doc.fontSize(10).font('Helvetica-Bold');
    doc.text('Roll No', col1, doc.y);
    const headerY = doc.y;
    doc.text('Name', col2, headerY);
    doc.text('Class', col3, headerY);
    doc.text('Percentage', col4, headerY);
    doc.text('Status', col5, headerY);
    doc.moveDown(0.2);
    doc.moveTo(col1, doc.y).lineTo(555, doc.y).stroke();
    doc.moveDown(0.3);

    doc.font('Helvetica').fontSize(9);
    for (const d of defaulters) {
      doc.fillColor('#333')
        .text(d.rollNumber, col1, doc.y);
      const rowY = doc.y;
      doc.text(d.name, col2, rowY);
      doc.text(d.class ? `${d.class.name} ${d.class.section || ''}` : 'N/A', col3, rowY);
      doc.fillColor('red').text(`${d.percentage}%`, col4, rowY);
      doc.fillColor(d.status === 'defaulter' ? 'red' : '#cc8800')
        .text(d.status.toUpperCase(), col5, rowY);
      doc.fillColor('#333');
      doc.moveDown(0.3);
    }
  }

  doc.end();
  await new Promise((resolve) => stream.on('finish', resolve));

  const report = await AttendanceReport.create({
    type: 'defaulter',
    generatedBy,
    filePath: fileName,
    format: 'pdf',
    filters: { classId },
  });

  return report;
};

/**
 * Get the full file path for a report.
 */
const getReportFilePath = (fileName) => path.join(REPORTS_DIR, fileName);

module.exports = {
  generateMonthlyClassReport,
  generateStudentReport,
  generateDefaulterReport,
  getReportFilePath,
  REPORTS_DIR,
};
