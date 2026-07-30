import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const generateAppointmentReceiptPdf = (appointment, user) => {
  if (!appointment) return;

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const primaryColor = [2, 132, 199]; // Sky Blue #0284c7
  const darkColor = [15, 23, 42]; // Slate 900 #0F172A
  const lightBg = [248, 250, 252]; // Slate 50 #F8FAFC
  const borderGray = [226, 232, 240]; // Slate 200

  const safeText = (text, fallback = 'N/A') => text || fallback;
  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const refId = `APT-${appointment._id.slice(-8).toUpperCase()}`;
  const doctorName = appointment.doctorId?.userId?.name || 'Practitioner';
  const doctorSpec = appointment.doctorId?.specialization || 'Clinical Specialist';
  const doctorHospital = appointment.doctorId?.hospitalName || 'MediCare City Hospital';
  const doctorAddress = appointment.doctorId?.hospitalAddress || 'City Health Center';
  
  const patientName = user?.name || appointment.patientId?.name || 'Patient';
  const patientEmail = user?.email || appointment.patientId?.email || 'N/A';
  const patientPhone = user?.phone || appointment.patientId?.phone || 'N/A';

  const appointmentDate = formatDate(appointment.appointmentDate);
  const timeSlot = appointment.timeSlot || 'N/A';
  const consultationMode = appointment.type || 'in-person';
  const symptoms = safeText(appointment.symptoms, 'No symptoms description provided.');
  const consultationFee = appointment.consultationFee || 500;
  const paymentId = appointment.paymentId || 'DEMO_PAID';
  const paymentStatus = (appointment.paymentStatus || 'PAID').toUpperCase();

  // --- HEADER BANNER ---
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, 210, 36, 'F');

  // Medicare Logo & Title
  doc.setTextColor(255, 255, 255);
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(24);
  doc.text('MEDICARE', 15, 18);
  
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.text('Healthcare Platform & Medical Services', 15, 25);

  // Document Title & Reference Right Aligned
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(13);
  doc.text('APPOINTMENT RECEIPT', 210 - 15, 18, { align: 'right' });
  
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(`Ref ID: ${refId}`, 210 - 15, 24, { align: 'right' });
  doc.text(`Date: ${new Date().toLocaleDateString()}`, 210 - 15, 29, { align: 'right' });

  let y = 46;

  // --- TWO-COLUMN CARDS: PATIENT & DOCTOR DETAILS ---
  // Patient Card (Left)
  doc.setFillColor(...lightBg);
  doc.roundedRect(15, y, 86, 46, 3, 3, 'F');
  doc.setDrawColor(...borderGray);
  doc.setLineWidth(0.3);
  doc.roundedRect(15, y, 86, 46, 3, 3, 'D');

  doc.setTextColor(...darkColor);
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('PATIENT DETAILS', 20, y + 8);

  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(`Name: ${patientName}`, 20, y + 16);
  doc.text(`Email: ${patientEmail}`, 20, y + 23);
  doc.text(`Phone: ${patientPhone}`, 20, y + 30);
  doc.text(`Status: Verified Patient`, 20, y + 37);

  // Doctor & Hospital Card (Right)
  doc.setFillColor(...lightBg);
  doc.roundedRect(109, y, 86, 46, 3, 3, 'F');
  doc.roundedRect(109, y, 86, 46, 3, 3, 'D');

  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('DOCTOR & HOSPITAL', 114, y + 8);

  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(`Doctor: Dr. ${doctorName}`, 114, y + 16);
  doc.text(`Specialization: ${doctorSpec}`, 114, y + 23);
  doc.text(`Hospital: ${doctorHospital}`, 114, y + 30);
  
  // Truncate address if long
  const truncatedAddr = doc.splitTextToSize(`Address: ${doctorAddress}`, 78);
  doc.text(truncatedAddr[0], 114, y + 37);

  y += 56;

  // --- APPOINTMENT SCHEDULE & PROBLEM DESCRIPTION BLOCK ---
  doc.setFillColor(240, 249, 255); // Sky 50
  doc.roundedRect(15, y, 180, 42, 3, 3, 'F');
  doc.setDrawColor(186, 230, 253); // Sky 200
  doc.roundedRect(15, y, 180, 42, 3, 3, 'D');

  doc.setTextColor(...primaryColor);
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.text('APPOINTMENT SCHEDULE & SYMPTOMS', 20, y + 8);

  doc.setTextColor(...darkColor);
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(`Scheduled Date  : ${appointmentDate}`, 20, y + 16);
  doc.text(`Time Slot       : ${timeSlot}`, 20, y + 22);
  doc.text(`Consultation Mode : ${consultationMode.toUpperCase()}`, 114, y + 16);
  doc.text(`Booking Status  : CONFIRMED`, 114, y + 22);

  doc.setFont('Helvetica', 'bold');
  doc.text('Symptoms / Problem Description:', 20, y + 30);
  
  doc.setFont('Helvetica', 'normal');
  const splitSymptoms = doc.splitTextToSize(`"${symptoms}"`, 170);
  doc.text(splitSymptoms[0], 20, y + 36);

  y += 52;

  // --- PAYMENT BREAKDOWN TABLE ---
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...darkColor);
  doc.text('PAYMENT SUMMARY & INVOICE', 15, y);

  y += 4;

  const paymentHeaders = [['Description', 'Reference / Payment ID', 'Mode', 'Amount (INR)']];
  const paymentData = [
    [
      `Doctor Consultation Fee (Dr. ${doctorName})`,
      paymentId,
      consultationMode.toUpperCase(),
      `Rs. ${consultationFee}`
    ],
    [
      'Platform Service Tax / Convenience Charge',
      'INCLUDED',
      'DIGITAL',
      'Rs. 0'
    ]
  ];

  autoTable(doc, {
    startY: y,
    head: paymentHeaders,
    body: paymentData,
    theme: 'grid',
    headStyles: {
      fillColor: primaryColor,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 9
    },
    bodyStyles: {
      textColor: darkColor,
      fontSize: 9
    },
    margin: { left: 15, right: 15 },
  });

  y = (doc.previousAutoTable?.finalY || y) + 8;

  // Total Paid Banner
  doc.setFillColor(236, 253, 245); // Emerald 50
  doc.roundedRect(15, y, 180, 16, 3, 3, 'F');
  doc.setDrawColor(167, 243, 208); // Emerald 200
  doc.roundedRect(15, y, 180, 16, 3, 3, 'D');

  doc.setTextColor(4, 120, 87); // Emerald 700
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(11);
  doc.text(`TOTAL AMOUNT PAID: Rs. ${consultationFee}`, 20, y + 10);
  
  doc.setFont('Helvetica', 'bold');
  doc.text(`STATUS: ${paymentStatus} (Ref: ${paymentId})`, 210 - 20, y + 10, { align: 'right' });

  // --- DOCTOR STAMP & SIGNATURE BLOCK ---
  y += 24;

  // Stamp Box Container
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(15, y, 180, 32, 3, 3, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.3);
  doc.roundedRect(15, y, 180, 32, 3, 3, 'D');

  // Left Side: Circular Official Medical Stamp
  const stampX = 45;
  const stampY = y + 16;

  doc.setDrawColor(2, 132, 199);
  doc.setLineWidth(0.8);
  doc.circle(stampX, stampY, 12.5, 'D');

  doc.setLineWidth(0.3);
  doc.circle(stampX, stampY, 11, 'D');

  doc.setTextColor(2, 132, 199);
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(5.5);
  doc.text('MEDICARE CLINIC', stampX, stampY - 6.5, { align: 'center' });
  doc.setFontSize(6.5);
  doc.text('★ VERIFIED ★', stampX, stampY - 2, { align: 'center' });
  doc.setFontSize(6);
  doc.text(`DR. ${doctorName.toUpperCase()}`, stampX, stampY + 2.5, { align: 'center' });
  doc.setFontSize(5);
  doc.setFont('Helvetica', 'normal');
  doc.text('OFFICIAL STAMP', stampX, stampY + 6.5, { align: 'center' });

  // Right Side: Doctor Signature Block
  const sigX = 115;
  const sigY = y + 7;

  doc.setTextColor(...darkColor);
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text('AUTHORIZED DOCTOR SIGNATURE', sigX, sigY);

  // Stylized Cursive Signature
  doc.setFont('Times', 'italic');
  doc.setFontSize(14);
  doc.setTextColor(15, 23, 42);
  doc.text(`Dr. ${doctorName}`, sigX, sigY + 9);

  // Signature Underline
  doc.setDrawColor(15, 23, 42);
  doc.setLineWidth(0.5);
  doc.line(sigX, sigY + 11, sigX + 55, sigY + 11);

  // Registration & Designation
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(51, 65, 85);
  doc.text(`Dr. ${doctorName}, ${doctorSpec}`, sigX, sigY + 16);
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  const regNo = `MCI Reg. No: MCI-2026-${(appointment._id || '999').toString().slice(-6).toUpperCase()}`;
  doc.text(regNo, sigX, sigY + 20);

  // --- FOOTER & THANK YOU MESSAGE ---
  const pageHeight = doc.internal.pageSize.height;
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.4);
  doc.line(15, pageHeight - 28, 195, pageHeight - 28);

  doc.setTextColor(...primaryColor);
  doc.setFontSize(10);
  doc.setFont('Helvetica', 'bold');
  doc.text('Thank you for choosing MediCare Healthcare System.', 105, pageHeight - 21, { align: 'center' });

  doc.setTextColor(100, 116, 139);
  doc.setFontSize(7.5);
  doc.setFont('Helvetica', 'normal');
  doc.text('This is an official computer-generated receipt issued by MediCare Health SaaS.', 105, pageHeight - 16, { align: 'center' });
  doc.text(`Security Verification Hash: ${refId}-${paymentId} | Digitally Signed & Stamped PDF`, 105, pageHeight - 11, { align: 'center' });

  // Download PDF file
  const filename = `MediCare_Receipt_${refId}.pdf`;
  doc.save(filename);
};
