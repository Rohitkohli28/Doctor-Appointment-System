import jsPDF from 'jspdf';
import 'jspdf-autotable';

export const generatePdfReport = (record, patientProfile, user) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const primaryColor = [2, 132, 199]; // Sky Blue #0284c7
  const darkColor = [30, 41, 59]; // Slate 800
  const lightGray = [241, 245, 249]; // Slate 100

  // Format Helper
  const safeText = (text) => text || 'Not provided during this consultation.';
  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const doctorName = record.doctor?.userId?.name || record.doctorId?.userId?.name || 'N/A';
  const doctorSpec = record.doctor?.specialization || record.doctorId?.specialization || 'N/A';
  const doctorExp = record.doctor?.experience || record.doctorId?.experience || 'N/A';
  const doctorHospital = record.doctor?.hospitalName || record.doctorId?.hospitalName || 'Medicare Clinic';

  const patientName = user?.name || record.patient?.name || 'N/A';
  const patientId = user?._id || record.patient?._id || 'N/A';
  const patientEmail = user?.email || record.patient?.email || 'N/A';
  const patientGender = user?.gender || record.patient?.gender || 'N/A';
  const patientAge = user?.dateOfBirth 
    ? new Date().getFullYear() - new Date(user.dateOfBirth).getFullYear() 
    : 'N/A';
  const bloodGroup = patientProfile?.bloodGroup || 'N/A';

  const appointmentDate = record.appointment?.appointmentDate || record.appointmentDate || record.createdAt;
  const timeSlot = record.appointment?.timeSlot || record.timeSlot || 'N/A';
  const consultationType = record.consultationType || record.appointment?.type || record.type || 'in-person';
  const symptoms = record.symptoms || record.appointment?.symptoms || 'N/A';
  
  const reportId = `MR-${record._id?.toString().slice(-8).toUpperCase() || 'TEMP'}`;
  const generatedDate = new Date().toLocaleString();
  const appointmentId = record.appointment?._id || record.appointment || 'N/A';

  // --- HEADER SECTION ---
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, 210, 40, 'F');

  // Medicare Brand
  doc.setTextColor(255, 255, 255);
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(28);
  doc.text('MEDICARE', 15, 20);
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(10);
  doc.text('Premium Healthcare SaaS Platform', 15, 26);

  // Document Title
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('PATIENT CONSULTATION REPORT', 210 - 15, 20, { align: 'right' });
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(`Report ID: ${reportId}`, 210 - 15, 26, { align: 'right' });
  doc.text(`Generated: ${generatedDate}`, 210 - 15, 31, { align: 'right' });

  let y = 50;

  // --- TWO COLUMN METADATA BLOCK ---
  // Background card for Patient Details
  doc.setFillColor(...lightGray);
  doc.roundedRect(15, y, 85, 45, 3, 3, 'F');
  
  doc.setTextColor(...darkColor);
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('PATIENT INFORMATION', 20, y + 8);
  
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.text(`Name: ${patientName}`, 20, y + 16);
  doc.text(`Patient ID: ${patientId.toString().slice(-8).toUpperCase()}`, 20, y + 22);
  doc.text(`Age / Gender: ${patientAge} / ${patientGender}`, 20, y + 28);
  doc.text(`Blood Group: ${bloodGroup}`, 20, y + 34);
  doc.text(`Email: ${patientEmail}`, 20, y + 40);

  // Background card for Doctor Details
  doc.setFillColor(...lightGray);
  doc.roundedRect(110, y, 85, 45, 3, 3, 'F');
  
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('DOCTOR & VISIT DETAILS', 115, y + 8);
  
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.text(`Doctor: Dr. ${doctorName}`, 115, y + 16);
  doc.text(`Specialization: ${doctorSpec}`, 115, y + 22);
  doc.text(`Experience: ${doctorExp} Years`, 115, y + 28);
  doc.text(`Hospital/Clinic: ${doctorHospital}`, 115, y + 34);
  doc.text(`Date & Time: ${formatDate(appointmentDate)} @ ${timeSlot}`, 115, y + 40);

  y += 55;

  // --- SYMPTOMS & DIAGNOSIS ---
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...primaryColor);
  doc.text('SYMPTOMS & DIAGNOSIS', 15, y);
  
  // Underline
  doc.setDrawColor(...primaryColor);
  doc.setLineWidth(0.5);
  doc.line(15, y + 2, 195, y + 2);
  
  y += 8;
  doc.setTextColor(...darkColor);
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.text('Symptoms / Reason for Visit:', 15, y);
  doc.setFont('Helvetica', 'normal');
  const splitSymptoms = doc.splitTextToSize(safeText(symptoms), 180);
  doc.text(splitSymptoms, 15, y + 5);

  y += 8 + (splitSymptoms.length * 4.5);
  doc.setFont('Helvetica', 'bold');
  doc.text('Clinical Diagnosis:', 15, y);
  doc.setFont('Helvetica', 'normal');
  const splitDiagnosis = doc.splitTextToSize(safeText(record.diagnosis), 180);
  doc.text(splitDiagnosis, 15, y + 5);

  y += 8 + (splitDiagnosis.length * 4.5);

  // --- PRESCRIPTION ---
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...primaryColor);
  doc.text('PRESCRIPTION DETAILS', 15, y);
  doc.line(15, y + 2, 195, y + 2);
  
  y += 6;

  const prescriptionHeaders = [['Medicine Name', 'Dosage', 'Frequency', 'Duration', 'Instructions']];
  const prescriptionData = record.prescriptions?.map(p => [
    p.medicineName,
    p.dosage || '-',
    p.frequency || '-',
    p.duration || '-',
    p.instructions || '-'
  ]) || [];

  if (prescriptionData.length === 0) {
    prescriptionData.push(['No prescription available.', '-', '-', '-', '-']);
  }

  doc.autoTable({
    startY: y,
    head: prescriptionHeaders,
    body: prescriptionData,
    theme: 'grid',
    headStyles: {
      fillColor: primaryColor,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 9
    },
    bodyStyles: {
      textColor: darkColor,
      fontSize: 8.5
    },
    margin: { left: 15, right: 15 },
    didDrawPage: (data) => {
      y = data.cursor.y + 12;
    }
  });

  // Ensure spacing is updated after autotable
  y = doc.previousAutoTable.finalY + 10;

  // Check if we need a new page for notes and details
  if (y > 230) {
    doc.addPage();
    y = 25;
  }

  // --- ADDITIONAL CONSULTATION DETAILS ---
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...primaryColor);
  doc.text('ADDITIONAL CLINICAL NOTES', 15, y);
  doc.line(15, y + 2, 195, y + 2);

  y += 8;
  doc.setTextColor(...darkColor);
  
  // Doctor Notes
  doc.setFont('Helvetica', 'bold');
  doc.text("Doctor's Notes:", 15, y);
  doc.setFont('Helvetica', 'normal');
  const splitNotes = doc.splitTextToSize(safeText(record.doctorNotes || record.notes), 180);
  doc.text(splitNotes, 15, y + 5);
  
  y += 8 + (splitNotes.length * 4.5);

  // Recommended Tests
  doc.setFont('Helvetica', 'bold');
  doc.text('Recommended Tests:', 15, y);
  doc.setFont('Helvetica', 'normal');
  const testsStr = record.recommendedTests?.length > 0 
    ? record.recommendedTests.join(', ') 
    : 'Not provided during this consultation.';
  const splitTests = doc.splitTextToSize(testsStr, 180);
  doc.text(splitTests, 15, y + 5);

  y += 8 + (splitTests.length * 4.5);

  // Medical Advice
  doc.setFont('Helvetica', 'bold');
  doc.text('Medical Advice / Lifestyle Guidance:', 15, y);
  doc.setFont('Helvetica', 'normal');
  const splitAdvice = doc.splitTextToSize(safeText(record.medicalAdvice), 180);
  doc.text(splitAdvice, 15, y + 5);

  y += 8 + (splitAdvice.length * 4.5);

  // Follow up details
  doc.setFont('Helvetica', 'bold');
  doc.text('Follow-up schedule:', 15, y);
  doc.setFont('Helvetica', 'normal');
  const followUpStr = record.followUpDate 
    ? `Schedule follow-up on ${formatDate(record.followUpDate)}.${record.followUpInstructions ? ` Instructions: ${record.followUpInstructions}` : ''}`
    : 'No follow-up scheduled.';
  const splitFollowUp = doc.splitTextToSize(followUpStr, 180);
  doc.text(splitFollowUp, 15, y + 5);

  // --- FOOTER AND DISCLAIMER ---
  const pageHeight = doc.internal.pageSize.height;
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.3);
  doc.line(15, pageHeight - 30, 195, pageHeight - 30);

  doc.setTextColor(100, 116, 139);
  doc.setFontSize(8);
  doc.setFont('Helvetica', 'normal');
  doc.text('This report was digitally generated by the MediCare Healthcare Platform.', 105, pageHeight - 25, { align: 'center' });
  doc.text('Medical information in this report is based on the consultation record entered by the healthcare professional.', 105, pageHeight - 21, { align: 'center' });
  doc.text(`Document reference: ${appointmentId} | Page 1 of 1`, 105, pageHeight - 17, { align: 'center' });

  // Save the report
  const filename = `MediCare_Medical_Report_${patientName.replace(/\s+/g, '_')}_${new Date(appointmentDate).toISOString().split('T')[0]}.pdf`;
  doc.save(filename);
};
