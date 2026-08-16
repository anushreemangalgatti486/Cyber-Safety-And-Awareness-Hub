import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

/**
 * Export data to CSV
 * @param {Array|Object} data - The data to export
 * @param {string} filename - The filename without extension
 */
export const exportToCSV = (data, filename) => {
  if (!data || !Object.keys(data).length) return;

  // Flatten the data for simple analytics export
  let csvContent = "data:text/csv;charset=utf-8,";

  // Quick way to flatten the analytics object for CSV
  Object.keys(data).forEach(key => {
    if (Array.isArray(data[key])) {
      csvContent += `\n--- ${key.toUpperCase()} ---\n`;
      if (data[key].length > 0) {
        const headers = Object.keys(data[key][0]);
        csvContent += headers.join(",") + "\n";
        data[key].forEach(row => {
          const values = headers.map(header => {
            const val = row[header];
            return typeof val === 'object' ? JSON.stringify(val).replace(/,/g, ';') : val;
          });
          csvContent += values.join(",") + "\n";
        });
      }
    } else if (typeof data[key] === 'object' && data[key] !== null) {
      csvContent += `\n--- ${key.toUpperCase()} ---\n`;
      const innerKeys = Object.keys(data[key]);
      csvContent += innerKeys.join(",") + "\n";
      const values = innerKeys.map(ik => {
        const val = data[key][ik];
        return typeof val === 'object' ? JSON.stringify(val).replace(/,/g, ';') : val;
      });
      csvContent += values.join(",") + "\n";
    } else {
      csvContent += `${key},${data[key]}\n`;
    }
  });

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Export a DOM element to PDF
 * @param {string} elementId - The ID of the DOM element to capture
 * @param {string} filename - The filename without extension
 */
export const exportToPDF = async (elementId, filename) => {
  const element = document.getElementById(elementId);
  if (!element) return;

  try {
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#0a0f1c' // Match cyber background
    });
    
    const imgData = canvas.toDataURL('image/png');
    
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`${filename}.pdf`);
  } catch (error) {
    console.error("PDF Export failed:", error);
  }
};
