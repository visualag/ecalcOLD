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

// Initialize settings
async function initializeSettings(db) {
  const settings = db.collection('settings');
  const existingSettings = await settings.findOne({ key: 'initialized' });
  
  if (!existingSettings) {
    await settings.insertMany([
      { key: 'initialized', value: true },
      { key: 'ad_header', value: '<div><!-- AdSense Header --></div>' },
      { key: 'ad_sidebar', value: '<div><!-- AdSense Sidebar --></div>' },
      { key: 'affiliate_salarii_text', value: 'Obține card salariu gratuit' },
      { key: 'affiliate_salarii_link', value: '#' },
      { key: 'affiliate_concediu_text', value: 'Asigurare medicală' },
      { key: 'affiliate_concediu_link', value: '#' },
      { key: 'affiliate_efactura_text', value: 'Software e-Factura' },
      { key: 'affiliate_efactura_link', value: '#' },
      { key: 'affiliate_impozit_text', value: 'Asigurare RCA' },
      { key: 'affiliate_impozit_link', value: '#' },
      { key: 'affiliate_zboruri_text', value: 'Compensații zbor' },
      { key: 'affiliate_zboruri_link', value: '#' },
      { key: 'affiliate_imobiliare_text', value: 'Credite ipotecare' },
      { key: 'affiliate_imobiliare_link', value: '#' },
      // Tax values 2026
      { key: 'cas_rate', value: 25 },
      { key: 'cass_rate', value: 10 },
      { key: 'income_tax_rate', value: 10 },
      { key: 'deduction_personal', value: 510 },
    ]);
  }

  // Initialize admin user
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

// Helper function to get settings
async function getSettings(db) {
  const settingsCollection = db.collection('settings');
  const settingsArray = await settingsCollection.find({}).toArray();
  const settings = {};
  settingsArray.forEach(setting => {
    settings[setting.key] = setting.value;
  });
  return settings;
}

// POST /api/leads - Save lead
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

// GET /api/leads - Get all leads (admin)
async function handleLeadsGet(request, db) {
  try {
    const leads = db.collection('leads');
    const allLeads = await leads.find({}).sort({ createdAt: -1 }).toArray();
    return NextResponse.json(allLeads);
  } catch (error) {
    console.error('Error fetching leads:', error);
    return NextResponse.json({ error: 'Eroare la preluarea lead-urilor' }, { status: 500 });
  }
}

// GET /api/leads/export - Export leads as CSV
async function handleLeadsExport(db) {
  try {
    const leads = db.collection('leads');
    const allLeads = await leads.find({}).sort({ createdAt: -1 }).toArray();
    
    // Create CSV content
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
    return NextResponse.json({ error: 'Eroare la exportul lead-urilor' }, { status: 500 });
  }
}

// POST /api/auth/login - Admin login
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

// GET /api/settings - Get all settings
async function handleSettingsGet(db) {
  try {
    const settings = await getSettings(db);
    return NextResponse.json(settings);
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json({ error: 'Eroare la preluarea setărilor' }, { status: 500 });
  }
}

// PUT /api/settings - Update settings
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
    return NextResponse.json({ error: 'Eroare la actualizarea setărilor' }, { status: 500 });
  }
}

// Main handler
export async function GET(request, { params }) {
  try {
    const { db } = await connectToDatabase();
    await initializeSettings(db);

    const path = params?.path?.join('/') || '';
    
    if (path === 'settings') {
      return handleSettingsGet(db);
    } else if (path === 'leads') {
      return handleLeadsGet(request, db);
    } else if (path === 'leads/export') {
      return handleLeadsExport(db);
    }

    return NextResponse.json({ 
      message: 'eCalc RO API', 
      version: '1.0',
      endpoints: ['/api/leads', '/api/settings', '/api/auth/login']
    });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request, { params }) {
  try {
    const { db } = await connectToDatabase();
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
    
    if (path === 'settings') {
      return handleSettingsPut(request, db);
    }

    return NextResponse.json({ error: 'Not Found' }, { status: 404 });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
