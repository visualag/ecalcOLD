// PDF Export pentru Calculator de Salarii
// Genereaza un PDF stilizat in format A4 - Stil Fintech
import { jsPDF } from 'jspdf';

// Helper pentru eliminarea diacriticelor
const removeDiacritics = (str) => {
  const diacriticsMap = {
    'ă': 'a', 'â': 'a', 'î': 'i', 'ș': 's', 'ț': 't',
    'Ă': 'A', 'Â': 'A', 'Î': 'I', 'Ș': 'S', 'Ț': 'T',
  };
  return str.replace(/[ăâîșțĂÂÎȘȚ]/g, match => diacriticsMap[match] || match);
};

export const generateSalaryPDF = (result, year = 2026) => {
  // Cream un document A4
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  let y = margin;

  // Culori - Stil Fintech minimalist
  const primaryColor = [37, 99, 235]; // blue-600
  const grayColor = [100, 116, 139]; // slate-500
  const darkColor = [30, 41, 59]; // slate-800
  const greenColor = [22, 163, 74]; // green-600
  const redColor = [220, 38, 38]; // red-600

  // Header - Logo si Titlu (minimalist fintech style)
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, pageWidth, 30, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.text('eCalc.ro', margin, 15);
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(removeDiacritics('Calculatoare Fiscale Profesionale'), margin, 22);
  
  doc.setFontSize(11);
  doc.text(removeDiacritics(`Fluturas de Salariu - ${year}`), pageWidth - margin - 60, 17);

  y = 45;

  // Subtitlu
  doc.setTextColor(...darkColor);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Raport Calcul Salariu', margin, y);
  
  doc.setFontSize(9);
  doc.setTextColor(...grayColor);
  doc.setFont('helvetica', 'normal');
  const dateStr = new Date().toLocaleDateString('ro-RO', { 
    year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' 
  });
  doc.text(`Generat: ${dateStr}`, pageWidth - margin - 50, y);

  y += 12;

  // Linie separator
  doc.setDrawColor(...primaryColor);
  doc.setLineWidth(0.5);
  doc.line(margin, y, pageWidth - margin, y);
  
  y += 10;

  // Secțiunea 1: Salariu Brut și Net
  doc.setFillColor(240, 249, 255); // blue-50
  doc.roundedRect(margin, y, pageWidth - 2 * margin, 30, 3, 3, 'F');
  
  // Brut
  doc.setTextColor(...grayColor);
  doc.setFontSize(10);
  doc.text('Salariu Brut:', margin + 10, y + 10);
  doc.setTextColor(...darkColor);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text(`${formatNumber(result.gross)} RON`, margin + 10, y + 22);
  
  // Net
  doc.setTextColor(...grayColor);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Salariu Net:', pageWidth - margin - 70, y + 10);
  doc.setTextColor(...greenColor);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text(`${formatNumber(result.net)} RON`, pageWidth - margin - 70, y + 22);

  y += 40;

  // Secțiunea 2: Contribuții Angajat
  doc.setTextColor(...darkColor);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('Contribuții Angajat (reținute din salariu):', margin, y);
  y += 8;

  // Tabel contribuții
  const contributions = [
    { label: 'CAS (Pensii)', value: result.cas, percent: result.breakdown?.casPercent || 25, color: redColor },
    { label: 'CASS (Sănătate)', value: result.cass, percent: result.breakdown?.cassPercent || 10, color: redColor },
    { label: 'Impozit pe venit', value: result.incomeTax, percent: result.breakdown?.taxPercent || 10, color: redColor },
  ];

  if (result.personalDeduction > 0) {
    contributions.push({ label: 'Deducere personală', value: -result.personalDeduction, percent: null, color: greenColor });
  }

  contributions.forEach((item, idx) => {
    const rowY = y + idx * 12;
    
    // Background alternativ
    if (idx % 2 === 0) {
      doc.setFillColor(248, 250, 252);
      doc.rect(margin, rowY - 3, pageWidth - 2 * margin, 11, 'F');
    }
    
    doc.setTextColor(...grayColor);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(item.label, margin + 5, rowY + 4);
    
    if (item.percent !== null) {
      doc.text(`${item.percent}%`, margin + 70, rowY + 4);
    }
    
    doc.setTextColor(...item.color);
    doc.setFont('helvetica', 'bold');
    const sign = item.value < 0 ? '' : '-';
    doc.text(`${sign}${formatNumber(Math.abs(item.value))} RON`, pageWidth - margin - 45, rowY + 4);
  });

  y += contributions.length * 12 + 10;

  // Total contribuții
  const totalContrib = result.cas + result.cass + result.incomeTax;
  doc.setDrawColor(200, 200, 200);
  doc.line(margin, y - 2, pageWidth - margin, y - 2);
  
  doc.setTextColor(...darkColor);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('Total Rețineri:', margin + 5, y + 5);
  doc.setTextColor(...redColor);
  doc.text(`-${formatNumber(totalContrib)} RON`, pageWidth - margin - 45, y + 5);

  y += 18;

  // Secțiunea 3: Contribuții Angajator
  doc.setTextColor(...darkColor);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('Contribuții Angajator (în plus față de brut):', margin, y);
  y += 8;

  const employerContrib = [
    { label: 'CAM (Contribuție Asiguratorie pt. Muncă)', value: result.cam, percent: result.breakdown?.camPercent || 2.25 },
  ];

  if (result.voucherValue > 0) {
    employerContrib.push({ label: 'Tichete de masă', value: result.voucherValue, percent: null });
  }

  employerContrib.forEach((item, idx) => {
    const rowY = y + idx * 12;
    
    if (idx % 2 === 0) {
      doc.setFillColor(240, 253, 244); // green-50
      doc.rect(margin, rowY - 3, pageWidth - 2 * margin, 11, 'F');
    }
    
    doc.setTextColor(...grayColor);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(item.label, margin + 5, rowY + 4);
    
    if (item.percent !== null) {
      doc.text(`${item.percent}%`, margin + 120, rowY + 4);
    }
    
    doc.setTextColor(...greenColor);
    doc.setFont('helvetica', 'bold');
    doc.text(`+${formatNumber(item.value)} RON`, pageWidth - margin - 45, rowY + 4);
  });

  y += employerContrib.length * 12 + 10;

  // Cost Total Angajator
  doc.setFillColor(37, 99, 235, 0.1);
  doc.roundedRect(margin, y, pageWidth - 2 * margin, 18, 3, 3, 'F');
  doc.setTextColor(...darkColor);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('Cost Total Angajator:', margin + 5, y + 12);
  doc.setTextColor(...primaryColor);
  doc.setFontSize(14);
  doc.text(`${formatNumber(result.totalCost)} RON`, pageWidth - margin - 50, y + 12);

  y += 28;

  // Secțiunea 4: Breakdown vizual (bară)
  doc.setTextColor(...darkColor);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('Vizualizare Distribuție Salariu:', margin, y);
  y += 10;

  const barHeight = 15;
  const barWidth = pageWidth - 2 * margin;
  
  // Calculăm proporțiile
  const netPercent = (result.net / result.gross) * 100;
  const casPercent = (result.cas / result.gross) * 100;
  const cassPercent = (result.cass / result.gross) * 100;
  const taxPercent = (result.incomeTax / result.gross) * 100;

  // Bara NET (verde)
  doc.setFillColor(34, 197, 94); // green-500
  doc.rect(margin, y, barWidth * (netPercent / 100), barHeight, 'F');
  
  // Bara CAS (roșu)
  doc.setFillColor(239, 68, 68); // red-500
  doc.rect(margin + barWidth * (netPercent / 100), y, barWidth * (casPercent / 100), barHeight, 'F');
  
  // Bara CASS (portocaliu)
  doc.setFillColor(249, 115, 22); // orange-500
  doc.rect(margin + barWidth * ((netPercent + casPercent) / 100), y, barWidth * (cassPercent / 100), barHeight, 'F');
  
  // Bara Impozit (galben)
  doc.setFillColor(234, 179, 8); // yellow-500
  doc.rect(margin + barWidth * ((netPercent + casPercent + cassPercent) / 100), y, barWidth * (taxPercent / 100), barHeight, 'F');

  // Border
  doc.setDrawColor(200, 200, 200);
  doc.roundedRect(margin, y, barWidth, barHeight, 2, 2);

  y += barHeight + 8;

  // Legendă
  const legendItems = [
    { label: `Net (${netPercent.toFixed(1)}%)`, color: [34, 197, 94] },
    { label: `CAS (${casPercent.toFixed(1)}%)`, color: [239, 68, 68] },
    { label: `CASS (${cassPercent.toFixed(1)}%)`, color: [249, 115, 22] },
    { label: `Impozit (${taxPercent.toFixed(1)}%)`, color: [234, 179, 8] },
  ];

  let legendX = margin;
  legendItems.forEach((item) => {
    doc.setFillColor(...item.color);
    doc.rect(legendX, y, 8, 5, 'F');
    doc.setTextColor(...grayColor);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(item.label, legendX + 10, y + 4);
    legendX += 45;
  });

  y += 20;

  // Footer
  doc.setDrawColor(200, 200, 200);
  doc.line(margin, pageHeight - 25, pageWidth - margin, pageHeight - 25);
  
  doc.setTextColor(...grayColor);
  doc.setFontSize(8);
  doc.text('Informațiile sunt orientative și nu înlocuiesc consultanța unui specialist.', margin, pageHeight - 18);
  doc.text(`© ${year} eCalc.ro - Calculatoare Fiscale Profesionale`, margin, pageHeight - 12);
  doc.text('www.ecalc.ro', pageWidth - margin - 20, pageHeight - 12);

  // Salvăm PDF-ul
  const filename = `fluturas_salariu_${result.gross}_RON_${new Date().toISOString().slice(0, 10)}.pdf`;
  doc.save(filename);
  
  return filename;
};

// Funcție de formatare numere
const formatNumber = (num) => {
  return new Intl.NumberFormat('ro-RO', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(num);
};

// Export pentru alte calculatoare
export const generateGenericPDF = (title, data, year = 2026) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  let y = margin;

  // Header
  doc.setFillColor(37, 99, 235);
  doc.rect(0, 0, pageWidth, 30, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text('eCalc.ro', margin, 15);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Raport: ${title}`, margin, 23);

  y = 40;

  // Titlu
  doc.setTextColor(30, 41, 59);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text(title, margin, y);
  
  y += 10;

  // Date
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  
  Object.entries(data).forEach(([key, value]) => {
    if (y > pageHeight - 30) {
      doc.addPage();
      y = margin;
    }
    
    doc.setTextColor(100, 116, 139);
    doc.text(`${key}:`, margin, y);
    doc.setTextColor(30, 41, 59);
    doc.setFont('helvetica', 'bold');
    doc.text(String(value), margin + 60, y);
    doc.setFont('helvetica', 'normal');
    y += 8;
  });

  // Footer
  doc.setTextColor(100, 116, 139);
  doc.setFontSize(8);
  doc.text(`© ${year} eCalc.ro`, margin, pageHeight - 10);

  const filename = `raport_${title.toLowerCase().replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.pdf`;
  doc.save(filename);
  
  return filename;
};

// Export pentru impozit auto
export const generateCarTaxPDF = (result, year = 2026) => {
  const data = {
    'Capacitate cilindrică': `${result.engineCC} cmc`,
    'Tip vehicul': result.vehicleTypeName,
    'Normă poluare': result.euroNormName,
    'Localitate': result.location,
    'Coeficient localitate': result.locationCoefficient?.toFixed(2),
    'Impozit anual': `${formatNumber(result.finalTax)} RON`,
    'Plată trimestrială': `${formatNumber(result.quarterly)} RON`,
  };
  
  return generateGenericPDF(`Calculator Impozit Auto ${year}`, data, year);
};

// Export pentru compensații zboruri
export const generateFlightCompensationPDF = (result, year = 2026) => {
  const data = {
    'Aeroport plecare': result.departure?.name || 'N/A',
    'Aeroport sosire': result.arrival?.name || 'N/A',
    'Distanță': `${result.distance} km`,
    'Compensație posibilă': `${result.compensation?.amount || 0} EUR`,
    'Categorie distanță': result.compensation?.category || 'N/A',
  };
  
  return generateGenericPDF(`Compensație Zbor ${year}`, data, year);
};
