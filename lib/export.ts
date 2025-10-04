import jsPDF from 'jspdf';

export function exportToPDF(data: any, filename: string) {
  const doc = new jsPDF();

  // Add header
  doc.setFontSize(20);
  doc.text('NextBoomCity Report', 20, 30);

  // Add data
  doc.setFontSize(12);
  let yPosition = 50;

  Object.entries(data).forEach(([key, value]) => {
    doc.text(`${key}: ${value}`, 20, yPosition);
    yPosition += 10;

    if (yPosition > 270) {
      doc.addPage();
      yPosition = 30;
    }
  });

  // Save the PDF
  doc.save(filename);
}

export function exportToCSV(data: any[], filename: string) {
  if (data.length === 0) return;

  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row => headers.map(header => row[header]).join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
}