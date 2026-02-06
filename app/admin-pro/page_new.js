'use client';

import { useState, useEffect } from 'react';
import { Settings, Users, DollarSign, Lock, Megaphone, Calculator, Save, RefreshCw, ExternalLink, Info } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedYear, setSelectedYear] = useState(2026);
  const [fiscalRules, setFiscalRules] = useState(null);
  const [settings, setSettings] = useState({});
  const [leads, setLeads] = useState([]);
  const [activeTab, setActiveTab] = useState('fiscal');
  const [activeModule, setActiveModule] = useState('salary');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        setIsAuthenticated(true);
        toast.success('Autentificare reușită!');
        loadData();
      } else {
        toast.error('Credențiale invalide');
      }
    } catch (error) {
      toast.error('Eroare la autentificare');
    }
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const [fiscalRes, settingsRes, leadsRes] = await Promise.all([
        fetch(`/api/fiscal-rules/${selectedYear}`),
        fetch('/api/settings'),
        fetch('/api/leads'),
      ]);

      const fiscalData = await fiscalRes.json();
      const settingsData = await settingsRes.json();
      const leadsData = await leadsRes.json();

      setFiscalRules(fiscalData);
      setSettings(settingsData);
      setLeads(leadsData);
    } catch (error) {
      toast.error('Eroare la încărcarea datelor');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [selectedYear, isAuthenticated]);

  const updateFiscalRules = async () => {
    try {
      setLoading(true);
      await fetch(`/api/fiscal-rules/${selectedYear}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fiscalRules),
      });
      toast.success(`Reguli fiscale ${selectedYear} actualizate cu succes!`);
      loadData();
    } catch (error) {
      toast.error('Eroare la actualizarea regulilor fiscale');
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = async () => {
    try {
      setLoading(true);
      await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      toast.success('Setări actualizate cu succes!');
    } catch (error) {
      toast.error('Eroare la actualizarea setărilor');
    } finally {
      setLoading(false);
    }
  };

  const exportLeads = () => {
    window.open('/api/leads/export', '_blank');
  };

  const updateFiscalField = (module, field, value) => {
    setFiscalRules({
      ...fiscalRules,
      [module]: {
        ...fiscalRules[module],
        [field]: value,
      },
    });
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-6 w-6" />
              Admin Login - eCalc RO
            </CardTitle>
            <CardDescription>Conectați-vă pentru a administra platforma</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                placeholder="admin@ecalc.ro"
              />
            </div>
            <div>
              <Label htmlFor="password">Parolă</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
              />
            </div>
            <Button onClick={handleLogin} className="w-full" size="lg">
              <Lock className="h-4 w-4 mr-2" />
              Autentificare
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!fiscalRules || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-12 w-12 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-slate-600">Se încarcă datele...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">eCalc RO - Admin Dashboard PRO</h1>
              <p className="text-sm text-slate-600">Management complet reguli fiscale & conținut</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Label className="text-sm font-semibold">Anul fiscal:</Label>
                <Select value={selectedYear.toString()} onValueChange={(v) => setSelectedYear(parseInt(v))}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2025">2025</SelectItem>
                    <SelectItem value="2026">2026</SelectItem>
                    <SelectItem value="2027">2027</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button variant="outline" onClick={() => setIsAuthenticated(false)}>
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
            <TabsTrigger value="fiscal">
              <Calculator className="h-4 w-4 mr-2" />
              Reguli Fiscale
            </TabsTrigger>
            <TabsTrigger value="ads">
              <Megaphone className="h-4 w-4 mr-2" />
              Ad Slots
            </TabsTrigger>
            <TabsTrigger value="affiliate">
              <DollarSign className="h-4 w-4 mr-2" />
              Affiliate
            </TabsTrigger>
            <TabsTrigger value="leads">
              <Users className="h-4 w-4 mr-2" />
              Leads ({leads.length})
            </TabsTrigger>
          </TabsList>

          {/* FISCAL RULES TAB */}
          <TabsContent value="fiscal" className="space-y-6">
            <Card className="border-2 border-blue-200 bg-blue-50">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-blue-900">
                    <p className="font-semibold mb-2">Atenție: Modificările se aplică pentru anul {selectedYear}</p>
                    <p>Toate modificările vor fi salvate în baza de date și se vor reflecta automat în calculatoarele pentru anul selectat. Istoricul pentru alți ani rămâne neafectat.</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid lg:grid-cols-4 gap-4">
              {/* Module Selector */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Module Fiscale</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {[
                    { id: 'salary', label: 'Salarii', icon: '💼' },
                    { id: 'pfa', label: 'PFA', icon: '👤' },
                    { id: 'medical_leave', label: 'Concediu Medical', icon: '🏥' },
                    { id: 'car_tax', label: 'Impozit Auto', icon: '🚗' },
                    { id: 'real_estate', label: 'Imobiliare', icon: '🏠' },
                    { id: 'efactura', label: 'e-Factura', icon: '📄' },
                    { id: 'flight', label: 'Zboruri EU261', icon: '✈️' },
                  ].map((module) => (
                    <Button
                      key={module.id}
                      variant={activeModule === module.id ? 'default' : 'outline'}
                      className="w-full justify-start"
                      onClick={() => setActiveModule(module.id)}
                    >
                      <span className="mr-2">{module.icon}</span>
                      {module.label}
                    </Button>
                  ))}
                </CardContent>
              </Card>

              {/* Module Settings */}
              <div className="lg:col-span-3">
                {activeModule === 'salary' && fiscalRules.salary && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Reguli Fiscale - Salarii {selectedYear}</CardTitle>
                      <CardDescription>
                        Configurare CAS, CASS, Impozit, Deduceri și facilități fiscale
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Basic Rates */}
                      <div>
                        <h3 className="font-semibold mb-4 flex items-center gap-2">
                          Rate Standard
                          <a href="https://www.anaf.ro" target="_blank" rel="noopener" className="text-xs text-blue-600 hover:underline flex items-center gap-1">
                            <ExternalLink className="h-3 w-3" />
                            Verifică pe ANAF
                          </a>
                        </h3>
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <Label>CAS - Pensii (%)</Label>
                            <Input
                              type="number"
                              step="0.01"
                              value={fiscalRules.salary.cas_rate || 25}
                              onChange={(e) => updateFiscalField('salary', 'cas_rate', parseFloat(e.target.value))}
                            />
                            <p className="text-xs text-slate-500 mt-1">Contribuție asigurări sociale (standard: 25%)</p>
                          </div>
                          <div>
                            <Label>CASS - Sănătate (%)</Label>
                            <Input
                              type="number"
                              step="0.01"
                              value={fiscalRules.salary.cass_rate || 10}
                              onChange={(e) => updateFiscalField('salary', 'cass_rate', parseFloat(e.target.value))}
                            />
                            <p className="text-xs text-slate-500 mt-1">Contribuție asigurări sănătate (standard: 10%)</p>
                          </div>
                          <div>
                            <Label>Impozit pe Venit (%)</Label>
                            <Input
                              type="number"
                              step="0.01"
                              value={fiscalRules.salary.income_tax_rate || 10}
                              onChange={(e) => updateFiscalField('salary', 'income_tax_rate', parseFloat(e.target.value))}
                            />
                            <p className="text-xs text-slate-500 mt-1">Impozit venit net (standard: 10%)</p>
                          </div>
                          <div>
                            <Label>CAM - Muncă (%)</Label>
                            <Input
                              type="number"
                              step="0.01"
                              value={fiscalRules.salary.cam_rate || 2.25}
                              onChange={(e) => updateFiscalField('salary', 'cam_rate', parseFloat(e.target.value))}
                            />
                            <p className="text-xs text-slate-500 mt-1">Contribuție asig. accidente muncă (standard: 2.25%)</p>
                          </div>
                        </div>
                      </div>

                      {/* Deductions */}
                      <div className="border-t pt-4">
                        <h3 className="font-semibold mb-4">Deduceri Personale</h3>
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <Label>Deducere Bază (RON/lună)</Label>
                            <Input
                              type="number"
                              value={fiscalRules.salary.personal_deduction_base || 510}
                              onChange={(e) => updateFiscalField('salary', 'personal_deduction_base', parseFloat(e.target.value))}
                            />
                            <p className="text-xs text-slate-500 mt-1">Deducere personală standard (510 RON în 2026)</p>
                          </div>
                          <div>
                            <Label>Deducere per Copil (RON/lună)</Label>
                            <Input
                              type="number"
                              value={fiscalRules.salary.child_deduction || 100}
                              onChange={(e) => updateFiscalField('salary', 'child_deduction', parseFloat(e.target.value))}
                            />
                            <p className="text-xs text-slate-500 mt-1">Deducere suplimentară per copil sub 18 ani la școală</p>
                          </div>
                        </div>
                      </div>

                      {/* Minimum Salary & Thresholds */}
                      <div className="border-t pt-4">
                        <h3 className="font-semibold mb-4">Praguri și Salarii Minime</h3>
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <Label>Salariu Minim Brut (RON/lună)</Label>
                            <Input
                              type="number"
                              value={fiscalRules.salary.minimum_salary || 4050}
                              onChange={(e) => updateFiscalField('salary', 'minimum_salary', parseFloat(e.target.value))}
                            />
                            <p className="text-xs text-slate-500 mt-1">Salariu minim pe economie (4050 RON în 2026)</p>
                          </div>
                          <div>
                            <Label>Valoare Max Tichet Masă (RON)</Label>
                            <Input
                              type="number"
                              value={fiscalRules.salary.meal_voucher_max || 40}
                              onChange={(e) => updateFiscalField('salary', 'meal_voucher_max', parseFloat(e.target.value))}
                            />
                            <p className="text-xs text-slate-500 mt-1">Valoare maximă tichet de masă neimpozabil</p>
                          </div>
                        </div>
                      </div>

                      {/* IT Sector Facilities */}
                      <div className="border-t pt-4">
                        <h3 className="font-semibold mb-4">Facilitate Fiscală IT</h3>
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <Label className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={fiscalRules.salary.it_tax_exempt || false}
                                onChange={(e) => updateFiscalField('salary', 'it_tax_exempt', e.target.checked)}
                                className="h-4 w-4"
                              />
                              Scutire Impozit IT Activă
                            </Label>
                            <p className="text-xs text-slate-500 mt-1">Permite scutirea de impozit pentru sector IT</p>
                          </div>
                          <div>
                            <Label>Prag Scutire IT (RON brut/lună)</Label>
                            <Input
                              type="number"
                              value={fiscalRules.salary.it_threshold || 10000}
                              onChange={(e) => updateFiscalField('salary', 'it_threshold', parseFloat(e.target.value))}
                              disabled={!fiscalRules.salary.it_tax_exempt}
                            />
                            <p className="text-xs text-slate-500 mt-1">Scutire impozit pentru primii X RON (10000 în 2026)</p>
                          </div>
                        </div>
                      </div>

                      {/* Construction Sector */}
                      <div className="border-t pt-4">
                        <h3 className="font-semibold mb-4">Facilitate Fiscală Construcții/Agricultură</h3>
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <Label>CAS Redus Construcții (%)</Label>
                            <Input
                              type="number"
                              step="0.01"
                              value={fiscalRules.salary.construction_cas_rate || 21.25}
                              onChange={(e) => updateFiscalField('salary', 'construction_cas_rate', parseFloat(e.target.value))}
                            />
                            <p className="text-xs text-slate-500 mt-1">CAS special pentru construcții (21.25%)</p>
                          </div>
                          <div>
                            <Label className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={fiscalRules.salary.construction_cass_exempt || false}
                                onChange={(e) => updateFiscalField('salary', 'construction_cass_exempt', e.target.checked)}
                                className="h-4 w-4"
                              />
                              Scutire CASS Construcții
                            </Label>
                            <p className="text-xs text-slate-500 mt-1">Scutire CASS pentru sectorul construcții</p>
                          </div>
                        </div>
                      </div>

                      <Button onClick={updateFiscalRules} className="w-full" size="lg">
                        <Save className="h-4 w-4 mr-2" />
                        Salvează Reguli Salarii {selectedYear}
                      </Button>
                    </CardContent>
                  </Card>
                )}

                {/* PFA MODULE */}
                {activeModule === 'pfa' && fiscalRules.pfa && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Reguli Fiscale - PFA {selectedYear}</CardTitle>
                      <CardDescription>
                        Rate, plafoane CAS/CASS, și praguri TVA
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div>
                        <h3 className="font-semibold mb-4 flex items-center gap-2">
                          Rate Standard PFA
                          <a href="https://www.anaf.ro" target="_blank" rel="noopener" className="text-xs text-blue-600 hover:underline flex items-center gap-1">
                            <ExternalLink className="h-3 w-3" />
                            Verifică pe ANAF
                          </a>
                        </h3>
                        <div className="grid md:grid-cols-3 gap-4">
                          <div>
                            <Label>CAS - Pensii (%)</Label>
                            <Input
                              type="number"
                              step="0.01"
                              value={fiscalRules.pfa.cas_rate || 25}
                              onChange={(e) => updateFiscalField('pfa', 'cas_rate', parseFloat(e.target.value))}
                            />
                          </div>
                          <div>
                            <Label>CASS - Sănătate (%)</Label>
                            <Input
                              type="number"
                              step="0.01"
                              value={fiscalRules.pfa.cass_rate || 10}
                              onChange={(e) => updateFiscalField('pfa', 'cass_rate', parseFloat(e.target.value))}
                            />
                          </div>
                          <div>
                            <Label>Impozit pe Venit (%)</Label>
                            <Input
                              type="number"
                              step="0.01"
                              value={fiscalRules.pfa.income_tax_rate || 10}
                              onChange={(e) => updateFiscalField('pfa', 'income_tax_rate', parseFloat(e.target.value))}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="border-t pt-4">
                        <h3 className="font-semibold mb-4">Plafoane CASS (în salarii minime)</h3>
                        <div className="grid md:grid-cols-3 gap-4">
                          <div>
                            <Label>Prag Minim CASS</Label>
                            <Input
                              type="number"
                              value={fiscalRules.pfa.cass_min_threshold || 6}
                              onChange={(e) => updateFiscalField('pfa', 'cass_min_threshold', parseFloat(e.target.value))}
                            />
                            <p className="text-xs text-slate-500 mt-1">Sub această valoare, CASS opțional (6 salarii)</p>
                          </div>
                          <div>
                            <Label>Plafon Maxim CASS</Label>
                            <Input
                              type="number"
                              value={fiscalRules.pfa.cass_max_threshold || 60}
                              onChange={(e) => updateFiscalField('pfa', 'cass_max_threshold', parseFloat(e.target.value))}
                            />
                            <p className="text-xs text-slate-500 mt-1">Plafon maxim pentru calcul CASS (60 salarii)</p>
                          </div>
                          <div>
                            <Label>Salariu Minim (RON)</Label>
                            <Input
                              type="number"
                              value={fiscalRules.pfa.minimum_salary || 4050}
                              onChange={(e) => updateFiscalField('pfa', 'minimum_salary', parseFloat(e.target.value))}
                            />
                            <p className="text-xs text-slate-500 mt-1">Pentru calcul praguri</p>
                          </div>
                        </div>
                      </div>

                      <div className="border-t pt-4">
                        <h3 className="font-semibold mb-4">Plafoane CAS (în salarii minime)</h3>
                        <div className="grid md:grid-cols-3 gap-4">
                          <div>
                            <Label>Prag Opțional CAS</Label>
                            <Input
                              type="number"
                              value={fiscalRules.pfa.cas_optional_threshold || 12}
                              onChange={(e) => updateFiscalField('pfa', 'cas_optional_threshold', parseFloat(e.target.value))}
                            />
                            <p className="text-xs text-slate-500 mt-1">Sub 12 salarii, CAS opțional</p>
                          </div>
                          <div>
                            <Label>Bază CAS 12-24 salarii</Label>
                            <Input
                              type="number"
                              value={fiscalRules.pfa.cas_base_12 || 12}
                              onChange={(e) => updateFiscalField('pfa', 'cas_base_12', parseFloat(e.target.value))}
                            />
                            <p className="text-xs text-slate-500 mt-1">CAS la baza de 12 salarii</p>
                          </div>
                          <div>
                            <Label>Bază CAS >24 salarii</Label>
                            <Input
                              type="number"
                              value={fiscalRules.pfa.cas_base_24 || 24}
                              onChange={(e) => updateFiscalField('pfa', 'cas_base_24', parseFloat(e.target.value))}
                            />
                            <p className="text-xs text-slate-500 mt-1">CAS la baza de 24 salarii</p>
                          </div>
                        </div>
                      </div>

                      <div className="border-t pt-4">
                        <h3 className="font-semibold mb-4">Praguri și Limite</h3>
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <Label>Limită TVA (EUR)</Label>
                            <Input
                              type="number"
                              value={fiscalRules.pfa.vat_threshold_eur || 88500}
                              onChange={(e) => updateFiscalField('pfa', 'vat_threshold_eur', parseFloat(e.target.value))}
                            />
                            <p className="text-xs text-slate-500 mt-1">Prag obligativitate TVA (88.500 EUR în 2026)</p>
                          </div>
                          <div>
                            <Label>Limită Normă de Venit (EUR)</Label>
                            <Input
                              type="number"
                              value={fiscalRules.pfa.norm_limit_eur || 25000}
                              onChange={(e) => updateFiscalField('pfa', 'norm_limit_eur', parseFloat(e.target.value))}
                            />
                            <p className="text-xs text-slate-500 mt-1">Venit maxim pentru normă (25.000 EUR)</p>
                          </div>
                        </div>
                      </div>

                      <Button onClick={updateFiscalRules} className="w-full" size="lg">
                        <Save className="h-4 w-4 mr-2" />
                        Salvează Reguli PFA {selectedYear}
                      </Button>
                    </CardContent>
                  </Card>
                )}

                {/* Placeholder for other modules - will add in next iteration */}
                {!['salary', 'pfa'].includes(activeModule) && (
                  <Card>
                    <CardContent className="py-12 text-center">
                      <Settings className="h-12 w-12 mx-auto mb-4 text-slate-400" />
                      <p className="text-slate-600">Configurare modul {activeModule} în dezvoltare...</p>
                      <p className="text-sm text-slate-500 mt-2">Momentan modificați direct în baza de date</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>

          {/* ADS TAB - Keep existing functionality */}
          <TabsContent value="ads">
            <Card>
              <CardHeader>
                <CardTitle>Google AdSense Slots (4 Poziții)</CardTitle>
                <CardDescription>
                  Lipește codul HTML AdSense în câmpurile de mai jos
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>1. Ad Header (Top de pagină)</Label>
                  <Input
                    value={settings.ad_header || ''}
                    onChange={(e) => setSettings({ ...settings, ad_header: e.target.value })}
                    placeholder="<div><!-- AdSense Code --></div>"
                  />
                </div>
                <div>
                  <Label>2. Ad Sidebar (Lateral pe desktop)</Label>
                  <Input
                    value={settings.ad_sidebar || ''}
                    onChange={(e) => setSettings({ ...settings, ad_sidebar: e.target.value })}
                    placeholder="<div><!-- AdSense Code --></div>"
                  />
                </div>
                <div>
                  <Label>3. Above Results Ad (Deasupra rezultatelor)</Label>
                  <Input
                    value={settings.ad_above_results || ''}
                    onChange={(e) => setSettings({ ...settings, ad_above_results: e.target.value })}
                    placeholder="<div><!-- AdSense Code --></div>"
                  />
                </div>
                <div>
                  <Label>4. Below Results Ad (Sub rezultate)</Label>
                  <Input
                    value={settings.ad_below_results || ''}
                    onChange={(e) => setSettings({ ...settings, ad_below_results: e.target.value })}
                    placeholder="<div><!-- AdSense Code --></div>"
                  />
                </div>
                <Button onClick={updateSettings} className="w-full">
                  <Save className="h-4 w-4 mr-2" />
                  Salvează Ad Slots
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* AFFILIATE TAB - Keep existing */}
          <TabsContent value="affiliate">
            <div className="space-y-4">
              {['salarii', 'concediu', 'efactura', 'impozit', 'zboruri', 'imobiliare'].map((calc) => (
                <Card key={calc}>
                  <CardHeader>
                    <CardTitle className="capitalize">{calc} - Affiliate Links</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {[1, 2, 3].map((slot) => (
                      <div key={slot} className="border-l-4 border-blue-500 pl-4 py-2 bg-blue-50">
                        <h4 className="font-semibold mb-3">Slot {slot}</h4>
                        <div className="grid md:grid-cols-2 gap-3">
                          <div>
                            <Label>Text Buton</Label>
                            <Input
                              value={settings[`affiliate_${calc}_text_${slot}`] || ''}
                              onChange={(e) =>
                                setSettings({ ...settings, [`affiliate_${calc}_text_${slot}`]: e.target.value })
                              }
                            />
                          </div>
                          <div>
                            <Label>Link</Label>
                            <Input
                              value={settings[`affiliate_${calc}_link_${slot}`] || ''}
                              onChange={(e) =>
                                setSettings({ ...settings, [`affiliate_${calc}_link_${slot}`]: e.target.value })
                              }
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              ))}
              <Button onClick={updateSettings} className="w-full" size="lg">
                <Save className="h-4 w-4 mr-2" />
                Salvează Toate Link-urile
              </Button>
            </div>
          </TabsContent>

          {/* LEADS TAB - Keep existing */}
          <TabsContent value="leads">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Lead-uri Colectate</CardTitle>
                  <Button onClick={exportLeads} variant="outline">
                    Export CSV
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Nume</th>
                        <th className="text-left p-2">Email</th>
                        <th className="text-left p-2">Telefon</th>
                        <th className="text-left p-2">Calculator</th>
                        <th className="text-left p-2">Data</th>
                      </tr>
                    </thead>
                    <tbody>
                      {leads.map((lead, idx) => (
                        <tr key={lead.id || idx} className="border-b">
                          <td className="p-2">{lead.name}</td>
                          <td className="p-2">{lead.email}</td>
                          <td className="p-2">{lead.phone}</td>
                          <td className="p-2">{lead.calculatorType}</td>
                          <td className="p-2">{new Date(lead.createdAt).toLocaleDateString('ro-RO')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
