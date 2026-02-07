
import { MongoClient } from 'mongodb';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

const uri = process.env.MONGO_URL;
const dbName = process.env.DB_NAME || 'ecalc_ro';

let cachedClient = null;
let cachedDb = null;

async function connectToDatabase() {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }
  const client = await MongoClient.connect(uri, {
    maxPoolSize: 10,
    minPoolSize: 2,
  });
  const db = client.db(dbName);
  cachedClient = client;
  cachedDb = db;
  return { client, db };
}

// Initialize fiscal rules for multi-year architecture
async function initializeFiscalRules(db) {
  const fiscalRules = db.collection('fiscal_rules');
  
  // Check if 2026 rules exist
  const existing2026 = await fiscalRules.findOne({ year: 2026 });
  
  if (!existing2026) {
    await fiscalRules.insertOne({
      year: 2026,
      salary: {
        // === PRAGURI FUNDAMENTALE ===
        minimum_salary: 4050,
        average_salary: 7500,
        
        // === PROCENTE TAXE STANDARD ===
        cas_rate: 25,
        pilon2_rate: 4.75, // Procent din CAS care merge la Pilon 2 (pensie privata)
        cass_rate: 10,
        income_tax_rate: 10,
        cam_rate: 2.25,
        
        // === SUME NETAXABILE SI BENEFICII ===
        untaxed_amount_enabled: true, // Toggle pentru suma netaxabila 300 RON
        untaxed_amount: 300, // Suma netaxabila lunara (se scade inaintea tuturor taxelor)
        meal_voucher_max: 40, // Valoare maxima zilnica tichet masa
        gift_voucher_threshold: 300, // Prag neimpozabil tichete cadou (peste = 10% IV)
        meal_allowance_max: 70, // Diurna neimpozabila maxima/zi (se adauga direct la Net)
        
        // === DEDUCERI PERSONALE (FORMULA REGRESIVA) ===
        personal_deduction_base: 510, // Deducere maxima (la salariu <= minim)
        personal_deduction_range: 2000, // Prag regresiv peste salariu minim
        child_deduction: 100, // Deducere per copil (fix, nu regresiv)
        dependent_deduction: 0, // Deducere per persoana in intretinere (altii decat copii)
        
        // === DEDUCTIBILITATE ABONAMENTE SI PILONUL 3 ===
        medical_subscription_limit_eur: 400, // Limita anuala deductibila abonament medical (in EUR)
        pilon3_limit_eur: 400, // Limita anuala deductibila Pilon 3 (in EUR)
        union_fee_deductible: true, // Cotizatie sindicat deductibila din baza IV
        
        // === SCUTIRI SI EXCEPTII ===
        tax_exemption_threshold: 10000, // Prag general scutire (ex: IT, Constructii)
        youth_exemption_enabled: true, // Scutire IV pentru sub 26 ani
        youth_exemption_age: 26, // Varsta maxima pentru scutire tineri
        youth_exemption_threshold: 6050, // Prag maxim venit pentru scutire < 26 ani (SalMin + 2000)
        disability_tax_exempt: true, // Scutire IV pentru persoane cu handicap
        
        // === SECTOR IT (SCUTIRI SPECIALE) ===
        it_tax_exempt: true,
        it_threshold: 10000, // Prag scutire IV pentru IT (primii 10.000 RON)
        it_pilon2_optional: true, // In IT, Pilon 2 poate fi optional (bifabil)
        
        // === SECTOR CONSTRUCTII / AGRICULTURA ===
        construction_cas_rate: 21.25, // CAS redus
        construction_tax_exempt: true, // Scutire IV pana la prag
        construction_cass_exempt: false, // CASS se aplica normal
        agriculture_cas_rate: 21.25, // Identic cu constructii
        agriculture_tax_exempt: true,
        agriculture_cass_exempt: false,
        
        // === CONCEDIU MEDICAL (CM) ===
        medical_leave_calculation_enabled: true, // Permite calcul zile CM
        medical_leave_rate_75: true, // 75% din medie pentru boala obisnuita
        medical_leave_rate_100: false, // 100% pentru anumite coduri (maternitate, accident)
        medical_leave_cass_exempt: true, // CM scutit de CASS
        medical_leave_cam_exempt: true, // CM scutit de CAM
        
        // === SUPRATAXARE PART-TIME ===
        part_time_overtax_enabled: true, // Aplica suprataxare sub salariu minim
        part_time_minor_exempt: true, // Sub 18 ani exceptati de la suprataxare
        part_time_student_exempt: true, // Studenti exceptati
        part_time_pensioner_exempt: true, // Pensionari exceptati
        part_time_second_job_exempt: true, // Al 2-lea job (daca au alt contract full) exceptat
      },
      exchange_rate: {
        eur: 5.0923,
        auto_update: true,
      },
      pfa: {
        minimum_salary: 4050,
        cas_rate: 25,
        cass_rate: 10,
        income_tax_rate: 10,
        cass_min_threshold: 6, // 6 salarii minime
        cass_max_threshold: 60, // 60 salarii minime
        cas_min_optional: 12, // optional sub 12 salarii
        cas_obligatory_12: 12,
        cas_obligatory_24: 24,
        norm_limit_eur: 25000,
      },
      medical_leave: {
        minimum_months: 6,
        max_base_salaries: 12,
        code_01_rate: 75, // Boala obisnuita
        code_06_rate: 100, // Urgenta
        code_08_rate: 85, // Maternitate
        employer_days: 5,
        apply_cass: false,
      },
      car_tax: {
        under_1600: 72,
        from_1601_to_2000: 144,
        from_2001_to_2600: 288,
        from_2601_to_3000: 432,
        over_3000: 576,
        electric_exempt: true,
        hybrid_reduction: 50,
        motorcycle_under_1600: 25,
        motorcycle_over_1600: 50,
      },
      real_estate: {
        rental_tax_rate: 10,
        rental_deduction: 20,
        maintenance_rate: 1,
        vacancy_rate: 8.33, // 1 month/year
        reserve_fund: 10,
      },
      efactura: {
        business_days: 5,
        fine_min_micro: 1000,
        fine_max_micro: 5000,
        fine_min_medium: 5000,
        fine_max_medium: 10000,
        fine_min_large: 10000,
        fine_max_large: 25000,
      },
      flight: {
        under_1500km: 250,
        from_1500_to_3500km: 400,
        over_3500km: 600,
        minimum_delay_hours: 3,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  // Add 2025 rules for comparison
  const existing2025 = await fiscalRules.findOne({ year: 2025 });
  if (!existing2025) {
    await fiscalRules.insertOne({
      year: 2025,
      salary: {
        // === PRAGURI FUNDAMENTALE ===
        minimum_salary: 3700,
        average_salary: 7000,
        
        // === PROCENTE TAXE STANDARD ===
        cas_rate: 25,
        pilon2_rate: 4.75,
        cass_rate: 10,
        income_tax_rate: 10,
        cam_rate: 2.25,
        
        // === SUME NETAXABILE SI BENEFICII ===
        untaxed_amount_enabled: true,
        untaxed_amount: 300,
        meal_voucher_max: 40,
        gift_voucher_threshold: 300,
        meal_allowance_max: 70,
        
        // === DEDUCERI PERSONALE ===
        personal_deduction_base: 510,
        personal_deduction_range: 2000,
        child_deduction: 100,
        dependent_deduction: 0,
        
        // === DEDUCTIBILITATE ABONAMENTE ===
        medical_subscription_limit_eur: 400,
        pilon3_limit_eur: 400,
        union_fee_deductible: true,
        
        // === SCUTIRI SI EXCEPTII ===
        tax_exemption_threshold: 10000,
        youth_exemption_enabled: true,
        youth_exemption_age: 26,
        youth_exemption_threshold: 5700, // 3700 + 2000
        disability_tax_exempt: true,
        
        // === SECTOR IT ===
        it_tax_exempt: true,
        it_threshold: 10000,
        it_pilon2_optional: true,
        
        // === CONSTRUCTII / AGRICULTURA ===
        construction_cas_rate: 21.25,
        construction_tax_exempt: true,
        construction_cass_exempt: false,
        agriculture_cas_rate: 21.25,
        agriculture_tax_exempt: true,
        agriculture_cass_exempt: false,
        
        // === CONCEDIU MEDICAL ===
        medical_leave_calculation_enabled: true,
        medical_leave_rate_75: true,
        medical_leave_rate_100: false,
        medical_leave_cass_exempt: true,
        medical_leave_cam_exempt: true,
        
        // === SUPRATAXARE PART-TIME ===
        part_time_overtax_enabled: true,
        part_time_minor_exempt: true,
        part_time_student_exempt: true,
        part_time_pensioner_exempt: true,
        part_time_second_job_exempt: true,
      },
      exchange_rate: {
        eur: 5.0923,
        auto_update: true,
      },
      pfa: {
        minimum_salary: 3700,
        cas_rate: 25,
        cass_rate: 10,
        income_tax_rate: 10,
        cass_min_threshold: 6,
        cass_max_threshold: 60,
        cas_min_optional: 12,
        cas_obligatory_12: 12,
        cas_obligatory_24: 24,
        norm_limit_eur: 25000,
      },
      medical_leave: {
        minimum_months: 6,
        max_base_salaries: 12,
        code_01_rate: 75,
        code_06_rate: 100,
        code_08_rate: 85,
        employer_days: 5,
        apply_cass: false,
      },
      car_tax: {
        under_1600: 72,
        from_1601_to_2000: 144,
        from_2001_to_2600: 288,
        from_2601_to_3000: 432,
        over_3000: 576,
        electric_exempt: true,
        hybrid_reduction: 50,
        motorcycle_under_1600: 25,
        motorcycle_over_1600: 50,
      },
      real_estate: {
        rental_tax_rate: 10,
        rental_deduction: 20,
        maintenance_rate: 1,
        vacancy_rate: 8.33,
        reserve_fund: 10,
      },
      efactura: {
        business_days: 5,
        fine_min_micro: 1000,
        fine_max_micro: 5000,
        fine_min_medium: 5000,
        fine_max_medium: 10000,
        fine_min_large: 10000,
        fine_max_large: 25000,
      },
      flight: {
        under_1500km: 250,
        from_1500_to_3500km: 400,
        over_3500km: 600,
        minimum_delay_hours: 3,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }
  
  // Add templates for 2027-2030 (cu valori estimate, editabile din admin)
  for (let year = 2027; year <= 2030; year++) {
    const existingYear = await fiscalRules.findOne({ year });
    if (!existingYear) {
      const estimatedMinSalary = 4050 + (year - 2026) * 200; // Estimare crestere ~200 RON/an
      await fiscalRules.insertOne({
        year,
        salary: {
          // === PRAGURI FUNDAMENTALE ===
          minimum_salary: estimatedMinSalary,
          average_salary: 7500 + (year - 2026) * 300,
          
          // === PROCENTE TAXE STANDARD ===
          cas_rate: 25,
          pilon2_rate: 4.75,
          cass_rate: 10,
          income_tax_rate: 10,
          cam_rate: 2.25,
          
          // === SUME NETAXABILE SI BENEFICII ===
          untaxed_amount_enabled: true,
          untaxed_amount: 300,
          meal_voucher_max: 40 + (year - 2026) * 5, // Estimare crestere tichete
          gift_voucher_threshold: 300,
          meal_allowance_max: 70 + (year - 2026) * 5,
          
          // === DEDUCERI PERSONALE ===
          personal_deduction_base: 510,
          personal_deduction_range: 2000,
          child_deduction: 100,
          dependent_deduction: 0,
          
          // === DEDUCTIBILITATE ABONAMENTE ===
          medical_subscription_limit_eur: 400,
          pilon3_limit_eur: 400,
          union_fee_deductible: true,
          
          // === SCUTIRI SI EXCEPTII ===
          tax_exemption_threshold: 10000,
          youth_exemption_enabled: true,
          youth_exemption_age: 26,
          youth_exemption_threshold: estimatedMinSalary + 2000,
          disability_tax_exempt: true,
          
          // === SECTOR IT ===
          it_tax_exempt: true,
          it_threshold: 10000,
          it_pilon2_optional: true,
          
          // === CONSTRUCTII / AGRICULTURA ===
          construction_cas_rate: 21.25,
          construction_tax_exempt: true,
          construction_cass_exempt: false,
          agriculture_cas_rate: 21.25,
          agriculture_tax_exempt: true,
          agriculture_cass_exempt: false,
          
          // === CONCEDIU MEDICAL ===
          medical_leave_calculation_enabled: true,
          medical_leave_rate_75: true,
          medical_leave_rate_100: false,
          medical_leave_cass_exempt: true,
          medical_leave_cam_exempt: true,
          
          // === SUPRATAXARE PART-TIME ===
          part_time_overtax_enabled: true,
          part_time_minor_exempt: true,
          part_time_student_exempt: true,
          part_time_pensioner_exempt: true,
          part_time_second_job_exempt: true,
        },
        exchange_rate: {
          eur: 5.0923,
          auto_update: true,
        },
        pfa: {
          minimum_salary: estimatedMinSalary,
          cas_rate: 25,
          cass_rate: 10,
          income_tax_rate: 10,
          cass_min_threshold: 6,
          cass_max_threshold: 60,
          cas_min_optional: 12,
          cas_obligatory_12: 12,
          cas_obligatory_24: 24,
          norm_limit_eur: 25000,
        },
        medical_leave: {
          minimum_months: 6,
          max_base_salaries: 12,
          code_01_rate: 75,
          code_06_rate: 100,
          code_08_rate: 85,
          employer_days: 5,
          apply_cass: false,
        },
        car_tax: {
          under_1600: 72,
          from_1601_to_2000: 144,
          from_2001_to_2600: 288,
          from_2601_to_3000: 432,
          over_3000: 576,
          electric_exempt: true,
          hybrid_reduction: 50,
          motorcycle_under_1600: 25,
          motorcycle_over_1600: 50,
        },
        real_estate: {
          rental_tax_rate: 10,
          rental_deduction: 20,
          maintenance_rate: 1,
          vacancy_rate: 8.33,
          reserve_fund: 10,
        },
        efactura: {
          business_days: 5,
          fine_min_micro: 1000,
          fine_max_micro: 5000,
          fine_min_medium: 5000,
          fine_max_medium: 10000,
          fine_min_large: 10000,
          fine_max_large: 25000,
        },
        flight: {
          under_1500km: 250,
          from_1500_to_3500km: 400,
          over_3500km: 600,
          minimum_delay_hours: 3,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
  }
}

// Initialize admin users and old settings
async function initializeSettings(db) {
  const settings = db.collection('settings');
  const existingSettings = await settings.findOne({ key: 'initialized' });
  
  if (!existingSettings) {
    await settings.insertMany([
      { key: 'initialized', value: true },
      { key: 'ad_header', value: '<div><!-- AdSense Header --></div>' },
      { key: 'ad_sidebar', value: '<div><!-- AdSense Sidebar --></div>' },
      { key: 'ad_above_results', value: '<div><!-- AdSense Above Results --></div>' },
      { key: 'ad_below_results', value: '<div><!-- AdSense Below Results --></div>' },
    ]);
    
    const calculators = ['salarii', 'concediu', 'efactura', 'impozit', 'zboruri', 'imobiliare'];
    const defaultTexts = {
      salarii: ['Obține card salariu gratuit', 'Credit rapid online', 'Consultanță fiscală'],
      concediu: ['Asigurare medicală', 'Concedii medicale online', 'Clinici private'],
      efactura: ['Software e-Factura', 'Contabilitate online', 'Soluții fiscale'],
      impozit: ['Asigurare RCA', 'Leasing auto', 'Service auto profesional'],
      zboruri: ['Compensații zbor', 'Asigurare călătorie', 'Bilete avion ieftine'],
      imobiliare: ['Credite ipotecare', 'Agenție imobiliară', 'Evaluare proprietăți']
    };
    
    const affiliateSettings = [];
    calculators.forEach(calc => {
      for (let i = 1; i <= 3; i++) {
        affiliateSettings.push({ 
          key: `affiliate_${calc}_text_${i}`, 
          value: defaultTexts[calc][i-1] 
        });
        affiliateSettings.push({ 
          key: `affiliate_${calc}_link_${i}`, 
          value: '#' 
        });
      }
    });
    
    await settings.insertMany(affiliateSettings);
  }

  const adminUsers = db.collection('adminUsers');
  const existingAdmin = await adminUsers.findOne({ email: process.env.ADMIN_EMAIL });
  
  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'Admin2026!', 10);
    await adminUsers.insertOne({
      email: process.env.ADMIN_EMAIL || 'admin@ecalc.ro',
      password: hashedPassword,
      createdAt: new Date(),
    });
  }
}

// GET /api/fiscal-rules/:year
async function handleFiscalRulesGet(year, db) {
  try {
    const fiscalRules = db.collection('fiscal_rules');
    const rules = await fiscalRules.findOne({ year: parseInt(year) });
    
    if (!rules) {
      return NextResponse.json({ error: 'Anul nu există în baza de date' }, { status: 404 });
    }
    
    return NextResponse.json(rules);
  } catch (error) {
    console.error('Error fetching fiscal rules:', error);
    return NextResponse.json({ error: 'Eroare la preluarea regulilor fiscale' }, { status: 500 });
  }
}

// PUT /api/fiscal-rules/:year
async function handleFiscalRulesPut(year, request, db) {
  try {
    const body = await request.json();
    const fiscalRules = db.collection('fiscal_rules');
    
    // Remove _id from body to avoid MongoDB immutable field error
    const { _id, ...updateData } = body;
    
    await fiscalRules.updateOne(
      { year: parseInt(year) },
      { 
        $set: { 
          ...updateData,
          year: parseInt(year),
          updatedAt: new Date() 
        } 
      },
      { upsert: true }
    );
    
    return NextResponse.json({ success: true, message: 'Reguli fiscale actualizate cu succes' });
  } catch (error) {
    console.error('Error updating fiscal rules:', error);
    return NextResponse.json({ error: 'Eroare la actualizarea regulilor fiscale' }, { status: 500 });
  }
}

// GET /api/fiscal-rules (all years)
async function handleFiscalRulesGetAll(db) {
  try {
    const fiscalRules = db.collection('fiscal_rules');
    const allRules = await fiscalRules.find({}).sort({ year: -1 }).toArray();
    return NextResponse.json(allRules);
  } catch (error) {
    console.error('Error fetching all fiscal rules:', error);
    return NextResponse.json({ error: 'Eroare' }, { status: 500 });
  }
}

// POST /api/leads
async function handleLeadPost(request, db) {
  try {
    const body = await request.json();
    const { name, email, phone, calculatorType, data } = body;

    const lead = {
      id: uuidv4(),
      name,
      email,
      phone,
      calculatorType,
      data: data || {},
      createdAt: new Date(),
    };

    const leads = db.collection('leads');
    await leads.insertOne(lead);

    return NextResponse.json({ success: true, message: 'Lead salvat cu succes' });
  } catch (error) {
    console.error('Error saving lead:', error);
    return NextResponse.json({ error: 'Eroare la salvarea lead-ului' }, { status: 500 });
  }
}

// GET /api/leads
async function handleLeadsGet(request, db) {
  try {
    const leads = db.collection('leads');
    const allLeads = await leads.find({}).sort({ createdAt: -1 }).toArray();
    return NextResponse.json(allLeads);
  } catch (error) {
    console.error('Error fetching leads:', error);
    return NextResponse.json({ error: 'Eroare' }, { status: 500 });
  }
}

// GET /api/leads/export
async function handleLeadsExport(db) {
  try {
    const leads = db.collection('leads');
    const allLeads = await leads.find({}).sort({ createdAt: -1 }).toArray();
    
    let csv = 'ID,Nume,Email,Telefon,Calculator,Data Creării\n';
    allLeads.forEach(lead => {
      csv += `${lead.id},"${lead.name}","${lead.email}","${lead.phone}","${lead.calculatorType}","${lead.createdAt}"\n`;
    });

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename=leads.csv',
      },
    });
  } catch (error) {
    console.error('Error exporting leads:', error);
    return NextResponse.json({ error: 'Eroare' }, { status: 500 });
  }
}

// POST /api/auth/login
async function handleLogin(request, db) {
  try {
    const body = await request.json();
    const { email, password } = body;

    const adminUsers = db.collection('adminUsers');
    const admin = await adminUsers.findOne({ email });

    if (!admin) {
      return NextResponse.json({ error: 'Credențiale invalide' }, { status: 401 });
    }

    const isValid = await bcrypt.compare(password, admin.password);
    if (!isValid) {
      return NextResponse.json({ error: 'Credențiale invalide' }, { status: 401 });
    }

    return NextResponse.json({ 
      success: true, 
      token: 'admin-token-' + uuidv4(),
      email: admin.email 
    });
  } catch (error) {
    console.error('Error logging in:', error);
    return NextResponse.json({ error: 'Eroare la autentificare' }, { status: 500 });
  }
}

// GET /api/settings
async function handleSettingsGet(db) {
  try {
    const settingsCollection = db.collection('settings');
    const settingsArray = await settingsCollection.find({}).toArray();
    const settings = {};
    settingsArray.forEach(setting => {
      settings[setting.key] = setting.value;
    });
    return NextResponse.json(settings);
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json({ error: 'Eroare' }, { status: 500 });
  }
}

// PUT /api/settings
async function handleSettingsPut(request, db) {
  try {
    const body = await request.json();
    const settingsCollection = db.collection('settings');

    for (const [key, value] of Object.entries(body)) {
      await settingsCollection.updateOne(
        { key },
        { $set: { key, value } },
        { upsert: true }
      );
    }

    return NextResponse.json({ success: true, message: 'Setări actualizate cu succes' });
  } catch (error) {
    console.error('Error updating settings:', error);
    return NextResponse.json({ error: 'Eroare' }, { status: 500 });
  }
}

// Main handler
export async function GET(request, { params }) {
  try {
    const { db } = await connectToDatabase();
    await initializeFiscalRules(db);
    await initializeSettings(db);

    const path = params?.path?.join('/') || '';
    
    if (path.startsWith('fiscal-rules/')) {
      const year = path.split('/')[1];
      if (year === 'all' || !year) {
        return handleFiscalRulesGetAll(db);
      }
      return handleFiscalRulesGet(year, db);
    } else if (path === 'fiscal-rules') {
      return handleFiscalRulesGetAll(db);
    } else if (path === 'settings') {
      return handleSettingsGet(db);
    } else if (path === 'leads') {
      return handleLeadsGet(request, db);
    } else if (path === 'leads/export') {
      return handleLeadsExport(db);
    }

    return NextResponse.json({ 
      message: 'eCalc RO API - Professional Edition', 
      version: '2.0',
      endpoints: [
        '/api/fiscal-rules/:year',
        '/api/fiscal-rules/all',
        '/api/leads',
        '/api/settings',
        '/api/auth/login'
      ]
    });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request, { params }) {
  try {
    const { db } = await connectToDatabase();
    await initializeFiscalRules(db);
    await initializeSettings(db);

    const path = params?.path?.join('/') || '';
    
    if (path === 'leads') {
      return handleLeadPost(request, db);
    } else if (path === 'auth/login') {
      return handleLogin(request, db);
    }

    return NextResponse.json({ error: 'Not Found' }, { status: 404 });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const { db } = await connectToDatabase();
    
    const path = params?.path?.join('/') || '';
    
    if (path.startsWith('fiscal-rules/')) {
      const year = path.split('/')[1];
      return handleFiscalRulesPut(year, request, db);
    } else if (path === 'settings') {
      return handleSettingsPut(request, db);
    }

    return NextResponse.json({ error: 'Not Found' }, { status: 404 });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
