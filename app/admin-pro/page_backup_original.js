'use client';

import { useState, useEffect } from 'react';
import { Settings, Users, DollarSign, Lock, Megaphone, Calendar, Building2, FileText, Car, Home, Briefcase, Plane } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedYear, setSelectedYear] = useState(2026);
  const [fiscalRules, setFiscalRules] = useState(null);
  const [settings, setSettings] = useState({});
  const [leads, setLeads] = useState([]);
  const [activeTab, setActiveTab] = useState('fiscal');

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
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [selectedYear, isAuthenticated]);

  const updateFiscalRules = async () => {
    try {
      await fetch(`/api/fiscal-rules/${selectedYear}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fiscalRules),
      });
      toast.success(`Reguli fiscale ${selectedYear} actualizate cu succes!`);
    } catch (error) {
      toast.error('Eroare la actualizarea regulilor fiscale');
    }
  };

  const updateSettings = async () => {
    try {
      await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      toast.success('Setări actualizate cu succes!');
    } catch (error) {
      toast.error('Eroare la actualizarea setărilor');
    }
  };

  const exportLeads = () => {
    window.open('/api/leads/export', '_blank');
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-6 w-6" />
              Admin Login
            </CardTitle>
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
            <Button onClick={handleLogin} className="w-full">
              Autentificare
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-slate-900">eCalc RO - Admin Dashboard</h1>
            <Button variant="outline" onClick={() => setIsAuthenticated(false)}>
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-wrap gap-4 mb-6">
          <Button
            variant={activeTab === 'settings' ? 'default' : 'outline'}
            onClick={() => setActiveTab('settings')}
          >
            <Settings className="h-4 w-4 mr-2" />
            Setări Fiscale
          </Button>
          <Button
            variant={activeTab === 'ads' ? 'default' : 'outline'}
            onClick={() => setActiveTab('ads')}
          >
            <Megaphone className="h-4 w-4 mr-2" />
            Ad Slots (4)
          </Button>
          <Button
            variant={activeTab === 'affiliate' ? 'default' : 'outline'}
            onClick={() => setActiveTab('affiliate')}
          >
            <DollarSign className="h-4 w-4 mr-2" />
            Affiliate Links
          </Button>
          <Button
            variant={activeTab === 'leads' ? 'default' : 'outline'}
            onClick={() => setActiveTab('leads')}
          >
            <Users className="h-4 w-4 mr-2" />
            Lead-uri ({leads.length})
          </Button>
        </div>

        {activeTab === 'settings' && (
          <Card>
            <CardHeader>
              <CardTitle>Valori Fiscale 2026</CardTitle>
              <p className="text-sm text-muted-foreground">
                Modificările se vor reflecta automat în toate calculatoarele
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>CAS (%)</Label>
                  <Input
                    type="number"
                    value={settings.cas_rate || 25}
                    onChange={(e) => setSettings({ ...settings, cas_rate: parseFloat(e.target.value) })}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Contribuția la asigurări sociale (implicit: 25%)
                  </p>
                </div>
                <div>
                  <Label>CASS (%)</Label>
                  <Input
                    type="number"
                    value={settings.cass_rate || 10}
                    onChange={(e) => setSettings({ ...settings, cass_rate: parseFloat(e.target.value) })}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Contribuția la asigurări de sănătate (implicit: 10%)
                  </p>
                </div>
                <div>
                  <Label>Impozit Venit (%)</Label>
                  <Input
                    type="number"
                    value={settings.income_tax_rate || 10}
                    onChange={(e) => setSettings({ ...settings, income_tax_rate: parseFloat(e.target.value) })}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Impozit pe venitul net (implicit: 10%)
                  </p>
                </div>
                <div>
                  <Label>Deducere Personală (RON)</Label>
                  <Input
                    type="number"
                    value={settings.deduction_personal || 510}
                    onChange={(e) => setSettings({ ...settings, deduction_personal: parseFloat(e.target.value) })}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Deducere lunară (implicit: 510 RON)
                  </p>
                </div>
              </div>

              <Button onClick={updateSettings} className="w-full mt-4">
                Salvează Setări Fiscale
              </Button>
            </CardContent>
          </Card>
        )}

        {activeTab === 'ads' && (
          <Card>
            <CardHeader>
              <CardTitle>Google AdSense Slots (4 Poziții)</CardTitle>
              <p className="text-sm text-muted-foreground">
                Lipește codul HTML AdSense în câmpurile de mai jos
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>1. Ad Header (Top de pagină)</Label>
                <Input
                  value={settings.ad_header || ''}
                  onChange={(e) => setSettings({ ...settings, ad_header: e.target.value })}
                  placeholder="<div><!-- AdSense Code --></div>"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Afișat în header-ul tuturor paginilor
                </p>
              </div>
              
              <div>
                <Label>2. Ad Sidebar (Lateral pe desktop)</Label>
                <Input
                  value={settings.ad_sidebar || ''}
                  onChange={(e) => setSettings({ ...settings, ad_sidebar: e.target.value })}
                  placeholder="<div><!-- AdSense Code --></div>"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Afișat lateral pe paginile calculatoarelor
                </p>
              </div>

              <div className="border-t pt-4">
                <h3 className="font-semibold mb-2 text-green-600">🆕 Ad Slots NOI (Maximum Revenue)</h3>
              </div>
              
              <div>
                <Label>3. Above Results Ad (Deasupra rezultatelor) 💰</Label>
                <Input
                  value={settings.ad_above_results || ''}
                  onChange={(e) => setSettings({ ...settings, ad_above_results: e.target.value })}
                  placeholder="<div><!-- AdSense Code --></div>"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Afișat IMEDIAT deasupra rezultatului calculului (CTR foarte mare!)
                </p>
              </div>
              
              <div>
                <Label>4. Below Results Ad (Sub rezultate) 💰</Label>
                <Input
                  value={settings.ad_below_results || ''}
                  onChange={(e) => setSettings({ ...settings, ad_below_results: e.target.value })}
                  placeholder="<div><!-- AdSense Code --></div>"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Afișat IMEDIAT sub rezultatul calculului (CTR foarte mare!)
                </p>
              </div>

              <Button onClick={updateSettings} className="w-full mt-4">
                Salvează Ad Slots
              </Button>
            </CardContent>
          </Card>
        )}

        {activeTab === 'affiliate' && (
          <div className="space-y-4">
            {['salarii', 'concediu', 'efactura', 'impozit', 'zboruri', 'imobiliare'].map((calc) => (
              <Card key={calc}>
                <CardHeader>
                  <CardTitle className="capitalize flex items-center justify-between">
                    <span>{calc}</span>
                    <span className="text-sm font-normal text-green-600">3 Affiliate Slots</span>
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Oferă utilizatorilor 3 opțiuni de afiliere pentru conversie mai mare
                  </p>
                </CardHeader>
                <CardContent className="space-y-6">
                  {[1, 2, 3].map((slot) => (
                    <div key={slot} className="border-l-4 border-blue-500 pl-4 py-2 bg-blue-50">
                      <h4 className="font-semibold mb-3">Slot {slot}</h4>
                      <div className="space-y-3">
                        <div>
                          <Label>Text Buton</Label>
                          <Input
                            value={settings[`affiliate_${calc}_text_${slot}`] || ''}
                            onChange={(e) =>
                              setSettings({ ...settings, [`affiliate_${calc}_text_${slot}`]: e.target.value })
                            }
                            placeholder={`ex: Ofertă ${slot}`}
                          />
                        </div>
                        <div>
                          <Label>Link Affiliate</Label>
                          <Input
                            value={settings[`affiliate_${calc}_link_${slot}`] || ''}
                            onChange={(e) =>
                              setSettings({ ...settings, [`affiliate_${calc}_link_${slot}`]: e.target.value })
                            }
                            placeholder="https://..."
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
            <Button onClick={updateSettings} className="w-full" size="lg">
              Salvează Toate Link-urile Affiliate
            </Button>
          </div>
        )}

        {activeTab === 'leads' && (
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
        )}
      </div>
    </div>
  );
}
