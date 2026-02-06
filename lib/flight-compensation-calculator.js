// Flight Compensation Calculator - EU Regulation 261/2004
// Calculator compensații pentru zboruri întârziate/anulate

export class FlightCompensationCalculator {
  constructor(fiscalRules) {
    this.rules = fiscalRules?.flight || {};
  }

  // Calculează distanța între două aeroporturi (aproximativă bazată pe coordonate)
  calculateDistance(departureAirport, arrivalAirport, airportData) {
    const dep = airportData[departureAirport];
    const arr = airportData[arrivalAirport];
    
    if (!dep || !arr) {
      return null;
    }
    
    // Haversine formula
    const R = 6371; // Radius of Earth in km
    const dLat = this.toRad(arr.lat - dep.lat);
    const dLon = this.toRad(arr.lon - dep.lon);
    
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(this.toRad(dep.lat)) * Math.cos(this.toRad(arr.lat)) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    
    return Math.round(distance);
  }

  toRad(degrees) {
    return degrees * (Math.PI / 180);
  }

  // Calculează suma compensației bazată pe distanță
  calculateCompensation(distanceKm, delayHours, isEUFlight = true) {
    if (!isEUFlight) {
      return {
        eligible: false,
        amount: 0,
        reason: 'Zborul nu este în jurisdicția EU (Regulamentul 261/2004 se aplică doar pentru zboruri din UE sau către UE cu companii EU)',
      };
    }

    if (delayHours < 3) {
      return {
        eligible: false,
        amount: 0,
        reason: 'Întârzierea trebuie să fie de minimum 3 ore la destinație pentru a fi eligibil',
      };
    }

    let baseAmount = 0;
    let category = '';

    // Distanță scurtă (sub 1500 km)
    if (distanceKm < 1500) {
      baseAmount = this.rules.compensation_under_1500 || 250;
      category = 'Sub 1.500 km';
    }
    // Distanță medie (1500-3500 km sau zboruri intra-EU peste 1500 km)
    else if (distanceKm >= 1500 && distanceKm <= 3500) {
      baseAmount = this.rules.compensation_1500_3500 || 400;
      category = '1.500 - 3.500 km';
    }
    // Distanță lungă (peste 3500 km, extra-EU)
    else if (distanceKm > 3500) {
      baseAmount = this.rules.compensation_over_3500 || 600;
      category = 'Peste 3.500 km';
    }

    // Reducere 50% dacă pasagerul ajunge cu întârziere rezonabilă
    let finalAmount = baseAmount;
    let reduction = false;
    
    if (distanceKm < 1500 && delayHours < 4) {
      finalAmount = baseAmount * 0.5;
      reduction = true;
    } else if (distanceKm >= 1500 && distanceKm <= 3500 && delayHours < 5) {
      finalAmount = baseAmount * 0.5;
      reduction = true;
    } else if (distanceKm > 3500 && delayHours < 6) {
      finalAmount = baseAmount * 0.5;
      reduction = true;
    }

    return {
      eligible: true,
      amount: finalAmount,
      currency: 'EUR',
      distanceCategory: category,
      distanceKm,
      delayHours,
      reduction: reduction ? '50%' : 'Nicio reducere',
      baseAmount,
      reason: `Compensație eligibilă conform Regulamentului UE 261/2004`,
    };
  }

  // Verifică excepțiile (circumstanțe extraordinare)
  checkExceptions(reason) {
    const extraordinaryCircumstances = [
      'vreme extremă',
      'greve',
      'instabilitate politică',
      'risc de securitate',
      'defecțiuni ascunse',
      'restricții de trafic aerian',
    ];

    const normalized = reason.toLowerCase();
    const isExtraordinary = extraordinaryCircumstances.some(circ => normalized.includes(circ));

    if (isExtraordinary) {
      return {
        compensationDue: false,
        assistanceDue: true,
        reason: 'Circumstanțe extraordinare - nu se datorează compensație monetară, dar pasagerii au dreptul la asistență (masă, cazare, transport)',
      };
    }

    return {
      compensationDue: true,
      assistanceDue: true,
      reason: 'Circumstanțe normale - se datorează atât compensație monetară cât și asistență',
    };
  }

  // Info despre drepturile pasagerilor
  getPassengerRights() {
    return {
      compensation: 'Compensație de 250-600 EUR în funcție de distanță',
      assistance: {
        meals: 'Masă și băuturi în funcție de durata întârzierii',
        accommodation: 'Cazare hotel dacă este necesar să așteptați peste noapte',
        transport: 'Transport între aeroport și hotel',
        communication: '2 apeluri telefonice sau emailuri gratuite',
      },
      reimbursement: 'Rambursare completă a biletului dacă refuzați zborul alternativ',
      rerouting: 'Re-rutare pe primul zbor disponibil sau la o dată convenabilă',
      howToClaim: [
        '1. Păstrați documentele: boarding pass, bilet, dovada întârzierii',
        '2. Solicitați confirmarea scrisă de la companie privind motivul întârzierii',
        '3. Depuneți reclamația direct la compania aeriană (7 zile - 2 ani)',
        '4. Dacă refuză, puteți apela la Autoritatea Națională de Aviație Civilă sau servicii specializate',
      ],
      contact: {
        AACR: 'Autoritatea Aeronautică Civilă Română',
        website: 'www.caa.ro',
        email: 'office@caa.ro',
        phone: '+40 21 201 6012',
      },
    };
  }

  // Checklist eligibilitate
  getEligibilityChecklist() {
    return [
      { requirement: 'Zbor din UE sau către UE cu companie UE', mandatory: true },
      { requirement: 'Întârziere minimum 3 ore la destinație', mandatory: true },
      { requirement: 'Check-in la timp (conform instrucțiunilor companiei)', mandatory: true },
      { requirement: 'Rezervare confirmată', mandatory: true },
      { requirement: 'Fără circumstanțe extraordinare (vreme extremă, greve, etc.)', mandatory: false },
    ];
  }
}

// Bază de date aeroporturi majore România și Europa
export const AIRPORTS_DATABASE = {
  // România
  'OTP': { code: 'OTP', name: 'București Henri Coandă', city: 'București', country: 'România', lat: 44.5711, lon: 26.0850 },
  'BBU': { code: 'BBU', name: 'București Băneasa', city: 'București', country: 'România', lat: 44.5032, lon: 26.1020 },
  'CLJ': { code: 'CLJ', name: 'Cluj-Napoca', city: 'Cluj-Napoca', country: 'România', lat: 46.7852, lon: 23.6862 },
  'TSR': { code: 'TSR', name: 'Timișoara Traian Vuia', city: 'Timișoara', country: 'România', lat: 45.8099, lon: 21.3379 },
  'IAS': { code: 'IAS', name: 'Iași', city: 'Iași', country: 'România', lat: 47.1785, lon: 27.6206 },
  'SBZ': { code: 'SBZ', name: 'Sibiu', city: 'Sibiu', country: 'România', lat: 45.7856, lon: 24.0913 },
  'CRA': { code: 'CRA', name: 'Craiova', city: 'Craiova', country: 'România', lat: 44.3182, lon: 23.8886 },
  'SUJ': { code: 'SUJ', name: 'Satu Mare', city: 'Satu Mare', country: 'România', lat: 47.7033, lon: 22.8857 },
  'OMR': { code: 'OMR', name: 'Oradea', city: 'Oradea', country: 'România', lat: 47.0253, lon: 21.9025 },
  'BCM': { code: 'BCM', name: 'Bacău', city: 'Bacău', country: 'România', lat: 46.5219, lon: 26.9103 },
  'TGM': { code: 'TGM', name: 'Târgu Mureș', city: 'Târgu Mureș', country: 'România', lat: 46.4677, lon: 24.4125 },
  'SCV': { code: 'SCV', name: 'Suceava', city: 'Suceava', country: 'România', lat: 47.6875, lon: 26.3541 },
  'CND': { code: 'CND', name: 'Constanța', city: 'Constanța', country: 'România', lat: 44.3622, lon: 28.4883 },
  'ARW': { code: 'ARW', name: 'Arad', city: 'Arad', country: 'România', lat: 46.1766, lon: 21.2620 },
  'BAY': { code: 'BAY', name: 'Baia Mare', city: 'Baia Mare', country: 'România', lat: 47.6584, lon: 23.4700 },
  
  // Europa - Destinații majore
  'LHR': { code: 'LHR', name: 'London Heathrow', city: 'London', country: 'UK', lat: 51.4700, lon: -0.4543 },
  'CDG': { code: 'CDG', name: 'Paris Charles de Gaulle', city: 'Paris', country: 'Franța', lat: 49.0097, lon: 2.5479 },
  'FRA': { code: 'FRA', name: 'Frankfurt', city: 'Frankfurt', country: 'Germania', lat: 50.0379, lon: 8.5622 },
  'MUC': { code: 'MUC', name: 'München', city: 'München', country: 'Germania', lat: 48.3538, lon: 11.7861 },
  'AMS': { code: 'AMS', name: 'Amsterdam Schiphol', city: 'Amsterdam', country: 'Olanda', lat: 52.3105, lon: 4.7683 },
  'FCO': { code: 'FCO', name: 'Roma Fiumicino', city: 'Roma', country: 'Italia', lat: 41.8003, lon: 12.2389 },
  'BCN': { code: 'BCN', name: 'Barcelona El Prat', city: 'Barcelona', country: 'Spania', lat: 41.2974, lon: 2.0833 },
  'MAD': { code: 'MAD', name: 'Madrid Barajas', city: 'Madrid', country: 'Spania', lat: 40.4936, lon: -3.5668 },
  'VIE': { code: 'VIE', name: 'Viena', city: 'Viena', country: 'Austria', lat: 48.1103, lon: 16.5697 },
  'BRU': { code: 'BRU', name: 'Bruxelles', city: 'Bruxelles', country: 'Belgia', lat: 50.9010, lon: 4.4856 },
  'ZRH': { code: 'ZRH', name: 'Zürich', city: 'Zürich', country: 'Elveția', lat: 47.4647, lon: 8.5492 },
  'CPH': { code: 'CPH', name: 'Copenhaga', city: 'Copenhaga', country: 'Danemarca', lat: 55.6180, lon: 12.6508 },
  'ARN': { code: 'ARN', name: 'Stockholm Arlanda', city: 'Stockholm', country: 'Suedia', lat: 59.6519, lon: 17.9186 },
  'OSL': { code: 'OSL', name: 'Oslo Gardermoen', city: 'Oslo', country: 'Norvegia', lat: 60.1939, lon: 11.1004 },
  'ATH': { code: 'ATH', name: 'Atena', city: 'Atena', country: 'Grecia', lat: 37.9364, lon: 23.9445 },
  'IST': { code: 'IST', name: 'Istanbul', city: 'Istanbul', country: 'Turcia', lat: 41.2753, lon: 28.7519 },
  'WAW': { code: 'WAW', name: 'Varșovia Chopin', city: 'Varșovia', country: 'Polonia', lat: 52.1657, lon: 20.9671 },
  'PRG': { code: 'PRG', name: 'Praga Václav Havel', city: 'Praga', country: 'Cehia', lat: 50.1008, lon: 14.2632 },
  'BUD': { code: 'BUD', name: 'Budapesta Ferenc Liszt', city: 'Budapesta', country: 'Ungaria', lat: 47.4299, lon: 19.2611 },
  'SOF': { code: 'SOF', name: 'Sofia', city: 'Sofia', country: 'Bulgaria', lat: 42.6952, lon: 23.4114 },
  'LIS': { code: 'LIS', name: 'Lisabona', city: 'Lisabona', country: 'Portugalia', lat: 38.7813, lon: -9.1359 },
  'DUB': { code: 'DUB', name: 'Dublin', city: 'Dublin', country: 'Irlanda', lat: 53.4213, lon: -6.2701 },
  'HEL': { code: 'HEL', name: 'Helsinki Vantaa', city: 'Helsinki', country: 'Finlanda', lat: 60.3172, lon: 24.9633 },
};
