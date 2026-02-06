

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
        minimum_salary: 4050,
        average_salary: 7500,
        cas_rate: 25,
        cass_rate: 10,
        income_tax_rate: 10,
        cam_rate: 2.25,
        meal_voucher_max: 40,
        tax_exemption_threshold: 10000,
        personal_deduction_base: 510,
        child_deduction: 100,
        // IT sector
        it_tax_exempt: true,
        it_threshold: 10000,
        // Construction/Agriculture
        construction_cas_rate: 21.25,
        construction_tax_exempt: true,
        construction_cass_exempt: false,
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
        minimum_salary: 3700,
        average_salary: 7000,
        cas_rate: 25,
        cass_rate: 10,
        income_tax_rate: 10,
        cam_rate: 2.25,
        meal_voucher_max: 40,
        tax_exemption_threshold: 10000,
        personal_deduction_base: 510,
        child_deduction: 100,
        it_tax_exempt: true,
        it_threshold: 10000,
        construction_cas_rate: 21.25,
        construction_tax_exempt: true,
        construction_cass_exempt: false,
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
    
    await fiscalRules.updateOne(
      { year: parseInt(year) },
      { 
        $set: { 
          ...body,
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
