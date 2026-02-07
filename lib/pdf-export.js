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

  y = 38;

  // Subtitlu
  doc.setTextColor(...darkColor);
  doc.setFontSize(15);
  doc.setFont('helvetica', 'bold');
  doc.text(removeDiacritics('Raport Calcul Salariu'), margin, y);
  
  doc.setFontSize(8);
  doc.setTextColor(...grayColor);
  doc.setFont('helvetica', 'normal');
  const dateStr = new Date().toLocaleDateString('en-GB', { 
    year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' 
  }).replace(/\//g, '.');
  doc.text(removeDiacritics(`Generat: ${dateStr}`), pageWidth - margin - 45, y);

  y += 10;

  // Linie separator
  doc.setDrawColor(...primaryColor);
  doc.setLineWidth(0.3);
  doc.line(margin, y, pageWidth - margin, y);
  
  y += 12;

  // Sectiunea 1: Salariu Brut si Net (style fintech - cards side by side)
  doc.setFillColor(240, 249, 255); // blue-50
  doc.roundedRect(margin, y, (pageWidth - 2 * margin - 5) / 2, 26, 2, 2, 'F');
  
  // Brut Card
  doc.setTextColor(...grayColor);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(removeDiacritics('Salariu Brut'), margin + 5, y + 8);
  doc.setTextColor(...darkColor);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text(`${formatNumber(result.gross)} RON`, margin + 5, y + 19);
  
  // Net Card
  doc.setFillColor(240, 253, 244); // green-50
  doc.roundedRect(margin + (pageWidth - 2 * margin) / 2 + 2.5, y, (pageWidth - 2 * margin - 5) / 2, 26, 2, 2, 'F');
  
  doc.setTextColor(...grayColor);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(removeDiacritics('Salariu Net'), pageWidth - margin - 50, y + 8);
  doc.setTextColor(...greenColor);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text(`${formatNumber(result.net)} RON`, pageWidth - margin - 50, y + 19);

  y += 36;

  // Sectiunea 2: Contributii Angajat
  doc.setTextColor(...darkColor);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text(removeDiacritics('Contributii Angajat (retinute din salariu):'), margin, y);
  y += 7;

  // Tabel contributii - Style fintech clean
  const contributions = [
    { label: 'CAS (Pensii)', value: result.cas, percent: result.breakdown?.casPercent || 25, color: redColor },
    { label: removeDiacritics('CASS (Sanatate)'), value: result.cass, percent: result.breakdown?.cassPercent || 10, color: redColor },
    { label: 'Impozit pe venit', value: result.incomeTax, percent: result.breakdown?.taxPercent || 10, color: redColor },
  ];

  if (result.personalDeduction > 0) {
    contributions.push({ label: removeDiacritics('Deducere personala'), value: -result.personalDeduction, percent: null, color: greenColor });
  }
  
  if (result.childDeduction > 0) {
    contributions.push({ label: removeDiacritics('Deducere copii'), value: -result.childDeduction, percent: null, color: greenColor });
  }

  contributions.forEach((item, idx) => {
    const rowY = y + idx * 10;
    
    // Background alternativ subtil
    if (idx % 2 === 0) {
      doc.setFillColor(249, 250, 251);
      doc.rect(margin, rowY - 2.5, pageWidth - 2 * margin, 9, 'F');
    }
    
    doc.setTextColor(...grayColor);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(item.label, margin + 3, rowY + 3.5);
    
    if (item.percent !== null) {
      doc.setTextColor(...grayColor);
      doc.text(`${item.percent}%`, margin + 60, rowY + 3.5);
    }
    
    doc.setTextColor(...item.color);
    doc.setFont('helvetica', 'bold');
    const sign = item.value < 0 ? '+' : '-';
    doc.text(`${sign}${formatNumber(Math.abs(item.value))} RON`, pageWidth - margin - 40, rowY + 3.5);
  });

  y += contributions.length * 10 + 8;

  // Total contributii
  const totalContrib = result.cas + result.cass + result.incomeTax;
  doc.setDrawColor(220, 220, 220);
  doc.setLineWidth(0.2);
  doc.line(margin, y - 2, pageWidth - margin, y - 2);
  
  doc.setTextColor(...darkColor);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text(removeDiacritics('Total Retineri:'), margin + 3, y + 4);
  doc.setTextColor(...redColor);
  doc.text(`-${formatNumber(totalContrib)} RON`, pageWidth - margin - 40, y + 4);

  y += 15;

  // Sectiunea 3: Contributii Angajator
  doc.setTextColor(...darkColor);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text(removeDiacritics('Contributii Angajator (in plus fata de brut):'), margin, y);
  y += 7;

  const employerContrib = [
    { label: removeDiacritics('CAM (Contributie Asiguratorie pt. Munca)'), value: result.cam, percent: result.breakdown?.camPercent || 2.25 },
  ];

  if (result.voucherValue > 0) {
    employerContrib.push({ label: removeDiacritics('Tichete de masa'), value: result.voucherValue, percent: null });
  }
  
  if (result.employerExtraCAS > 0) {
    employerContrib.push({ label: 'Extra CAS (part-time)', value: result.employerExtraCAS, percent: null });
  }
  
  if (result.employerExtraCASS > 0) {
    employerContrib.push({ label: 'Extra CASS (part-time)', value: result.employerExtraCASS, percent: null });
  }

  employerContrib.forEach((item, idx) => {
    const rowY = y + idx * 10;
    
    if (idx % 2 === 0) {
      doc.setFillColor(249, 250, 251);
      doc.rect(margin, rowY - 2.5, pageWidth - 2 * margin, 9, 'F');
    }
    
    doc.setTextColor(...grayColor);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(item.label, margin + 3, rowY + 3.5);
    
    if (item.percent !== null) {
      doc.setTextColor(...grayColor);
      doc.text(`${item.percent}%`, margin + 115, rowY + 3.5);
    }
    
    doc.setTextColor(...primaryColor);
    doc.setFont('helvetica', 'bold');
    doc.text(`+${formatNumber(item.value)} RON`, pageWidth - margin - 40, rowY + 3.5);
  });

  y += employerContrib.length * 10 + 8;

  // Cost Total Angajator
  doc.setFillColor(239, 246, 255);
  doc.roundedRect(margin, y, pageWidth - 2 * margin, 16, 2, 2, 'F');
  doc.setTextColor(...darkColor);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text(removeDiacritics('Cost Total Angajator:'), margin + 5, y + 10);
  doc.setTextColor(...primaryColor);
  doc.setFontSize(13);
  doc.text(`${formatNumber(result.totalCost)} RON`, pageWidth - margin - 45, y + 10);

  y += 25;

  // Sectiunea 4: Distributie procentuala (DOAR TEXT, fara grafic bara)
  doc.setTextColor(...darkColor);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text(removeDiacritics('Distributie Salariu:'), margin, y);
  y += 10;

  // Calculam procentiile
  const netPercent = (result.net / result.totalCost) * 100;
  const stateTaxes = result.cas + result.cass + result.incomeTax + result.cam + (result.employerExtraCAS || 0) + (result.employerExtraCASS || 0);
  const statePercent = (stateTaxes / result.totalCost) * 100;

  // Cards style pentru procente
  const cardWidth = (pageWidth - 2 * margin - 5) / 2;
  
  // Card Stat
  doc.setFillColor(254, 242, 242);
  doc.roundedRect(margin, y, cardWidth, 20, 2, 2, 'F');
  doc.setTextColor(...grayColor);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('Total Taxe Stat', margin + 5, y + 7);
  doc.setTextColor(...redColor);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text(`${statePercent.toFixed(2)}%`, margin + 5, y + 15);
  doc.setTextColor(...grayColor);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.text(`${formatNumber(stateTaxes)} RON`, margin + 5, y + 18.5);
  
  // Card Angajat
  doc.setFillColor(240, 253, 244);
  doc.roundedRect(margin + cardWidth + 5, y, cardWidth, 20, 2, 2, 'F');
  doc.setTextColor(...grayColor);
  doc.setFontSize(8);
  doc.text('Salariu Net Angajat', pageWidth - margin - cardWidth + 5, y + 7);
  doc.setTextColor(...greenColor);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text(`${netPercent.toFixed(2)}%`, pageWidth - margin - cardWidth + 5, y + 15);
  doc.setTextColor(...grayColor);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.text(`${formatNumber(result.net)} RON`, pageWidth - margin - cardWidth + 5, y + 18.5);

  y += 28;

  // Footer
  doc.setDrawColor(220, 220, 220);
  doc.setLineWidth(0.2);
  doc.line(margin, pageHeight - 22, pageWidth - margin, pageHeight - 22);
  
  doc.setTextColor(...grayColor);
  doc.setFontSize(7);
  doc.text(removeDiacritics('Informatiile sunt orientative si nu inlocuiesc consultanta unui specialist.'), margin, pageHeight - 16);
  doc.text(removeDiacritics(`(c) ${year} eCalc.ro - Calculatoare Fiscale Profesionale`), margin, pageHeight - 11);
  doc.text('www.ecalc.ro', pageWidth - margin - 20, pageHeight - 11);

  // Salvam PDF-ul
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
