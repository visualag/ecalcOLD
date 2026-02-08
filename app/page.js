'use client';

import { useState, useEffect } from 'react';
import { Calculator, FileText, Plane, Home as HomeIcon, Car, HeartPulse, Briefcase, Building2, TrendingUp, Scale, ArrowRight, Star, Menu, X, ChevronDown, Sun, Moon, CloudSun } from 'lucide-react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const currentYear = 2026;

const professionalCalculators = [
  {
    id: 'salarii-pro',
    title: 'Calculator Salarii PRO',
    description: 'Brut→Net, Net→Brut, Cost→Net • IT/Construcții • Tichete masă • Part-time',
    icon: Calculator,
    href: `/calculator-salarii-pro/${currentYear}`,
    color: 'bg-blue-600',
    badge: 'PRO',
  },
  {
    id: 'pfa',
    title: 'Calculator PFA',
    description: 'Sistem Real vs Normă de Venit • CASS/CAS • Comparație SRL',
    icon: Briefcase,
    href: `/calculator-pfa/${currentYear}`,
    color: 'bg-emerald-600',
    badge: 'NOU',
  },
  {
    id: 'decision-maker',
    title: 'Decision Maker',
    description: 'Compară Salariu vs PFA vs SRL - găsește forma juridică optimă',
    icon: TrendingUp,
    href: `/decision-maker/${currentYear}`,
    color: 'bg-purple-600',
    badge: 'POPULAR',
  },
  {
    id: 'concediu-medical',
    title: 'Concediu Medical',
    description: 'OUG 158/2005 • Toate codurile • Maternitate • Split angajator/FNUASS',
    icon: HeartPulse,
    href: `/calculator-concediu-medical/${currentYear}`,
    color: 'bg-rose-600',
    badge: 'PRO',
  },
  {
    id: 'impozit-auto',
    title: 'Impozit Auto',
    description: 'Capacitate motor • Tip vehicul • Orașe România • Coeficienți',
    icon: Car,
    href: `/calculator-impozit-auto/${currentYear}`,
    color: 'bg-amber-600',
  },
  {
    id: 'imobiliare',
    title: 'Calculator Imobiliare',
    description: 'Randament Brut/Net • Credit Ipotecar • Cash-on-Cash • Analiză',
    icon: Building2,
    href: `/calculator-imobiliare-pro/${currentYear}`,
    color: 'bg-indigo-600',
    badge: 'PRO',
  },
  {
    id: 'efactura',
    title: 'Calculator e-Factura',
    description: 'Termene transmitere • Obligativitate B2B/B2C • Zile lucrătoare',
    icon: FileText,
    href: `/calculator-efactura/${currentYear}`,
    color: 'bg-violet-600',
    badge: 'NOU',
  },
  {
    id: 'compensatii-zboruri',
    title: 'Compensații Zboruri',
    description: 'EU Regulation 261/2004 • Calculează despăgubiri întârzieri/anulări',
    icon: Plane,
    href: `/calculator-compensatii-zboruri/${currentYear}`,
    color: 'bg-sky-600',
    badge: 'NOU',
  },
];

export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [userWeather, setUserWeather] = useState(null);

  useEffect(() => {
    async function getLocalWeather() {
      try {
        const ipRes = await fetch('https://ipapi.co/json/');
        const ipData = await ipRes.json();
        if (!ipData.latitude) return;
        const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${ipData.latitude}&longitude=${ipData.longitude}&current=temperature_2m,is_day&timezone=auto`);
        const weatherData = await weatherRes.json();
        setUserWeather({
          city: ipData.city || 'Bucuresti',
          temp: Math.round(weatherData.current.temperature_2m),
          isDay: weatherData.current.is_day,
          slug: (ipData.city || 'Bucuresti').toLowerCase().replace(/\s+/g, '-')
        });
      } catch (err) { console.error(err); }
    }
    const timer = setTimeout(getLocalWeather, 1000); // Executăm la 1s după load
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Header cu meniu complet */}
      <header className="bg-slate-900/50 backdrop-blur border-b border-slate-700 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 shrink-0 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <Calculator className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-xl font-bold text-white">eCalc.ro</p>
                <p className="text-xs text-slate-400">Calculatoare Fiscale Profesionale</p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-1">
              {/* Dropdown Calculatoare */}
              <div className="relative">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="text-slate-300 hover:text-white hover:bg-slate-800"
                >
                  <Calculator className="h-4 w-4 mr-1" />
                  Calculatoare
                  <ChevronDown className={`h-4 w-4 ml-1 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                </Button>

                {dropdownOpen && (
                  <>
                    <div 
                      className="fixed inset-0 z-10" 
                      onClick={() => setDropdownOpen(false)}
                    />
                    <div className="absolute top-full left-0 mt-1 w-64 bg-slate-800 rounded-lg shadow-lg border border-slate-700 py-2 z-20">
                      {professionalCalculators.map((calc) => {
                        const Icon = calc.icon;
                        return (
                          <Link
                            key={calc.href}
                            href={calc.href}
                            onClick={() => setDropdownOpen(false)}
                            className="flex items-center px-4 py-2 hover:bg-slate-700 transition-colors text-slate-300 hover:text-white"
                          >
                            <Icon className="h-4 w-4 mr-3" />
                            {calc.title.replace('Calculator ', '')}
                          </Link>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>
<Link href={`/calculator-salarii-pro/${currentYear}`}>
                <Button variant="ghost" size="sm" className="text-slate-300 hover:text-white hover:bg-slate-800">
                  Salarii
                </Button>
              </Link>
              <Link href={`/calculator-pfa/${currentYear}`}>
                <Button variant="ghost" size="sm" className="text-slate-300 hover:text-white hover:bg-slate-800">
                  PFA
                </Button>
              </Link>
              {/* Widget Vreme Inteligent */}
              <Link href={userWeather ? `/vreme/${userWeather.slug}` : '/vreme/bucuresti'}>
                <Button variant="ghost" size="sm" className="text-slate-300 hover:text-white hover:bg-slate-800 flex items-center gap-2 px-3">
                  {userWeather ? (
                    <>
                      {userWeather.isDay ? <Sun className="h-4 w-4 text-yellow-500 animate-pulse" /> : <Moon className="h-4 w-4 text-indigo-400" />}
                      <span className="font-bold">{userWeather.city}: {userWeather.temp}°</span>
                    </>
                  ) : (
                    <>
                      <CloudSun className="h-4 w-4 text-blue-400" />
                      <span className="font-bold">Vremea</span>
                    </>
                  )}
                </Button>
              </Link>
<Link href={`/decision-maker/${currentYear}`}>
                <Button variant="ghost" size="sm" className="text-slate-300 hover:text-white hover:bg-slate-800">
                  Decision Maker
                </Button>
              </Link>
              <Link href="/admin-pro">
                <Button variant="default" size="sm" className="bg-blue-600 hover:bg-blue-700 text-white ml-2 font-bold">
                  Admin Pro
                </Button>
              </Link>
            </nav>

            {/* Mobile Menu Button */}
            
<button
  aria-label="Meniu principal"
  className="lg:hidden p-2 rounded-lg hover:bg-slate-800 text-slate-300"
  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
>
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="lg:hidden py-4 border-t border-slate-700 mt-3">
              <div className="space-y-1">
                <div className="px-3 py-2 text-xs font-semibold text-slate-500 uppercase">
                  Calculatoare
                </div>
                {professionalCalculators.map((calc) => {
                  const Icon = calc.icon;
                  return (
                    <Link
                      key={calc.href}
                      href={calc.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white"
                    >
                      <Icon className="h-5 w-5 mr-3" />
                      {calc.title}
                    </Link>
                  );
                })}
                <div className="pt-4">
                  <Link href="/admin-pro" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="default" className="w-full bg-blue-600 hover:bg-blue-700">
                      Admin Dashboard
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-600/20 border border-blue-500/30 text-blue-400 text-sm mb-6">
            <Star className="h-4 w-4" />
            Actualizat pentru {currentYear}
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-6 tracking-tight">
            Calculatoare Fiscale
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
              Profesionale România
            </span>
          </h1>
          <p className="text-xl text-slate-200 max-w-3xl mx-auto mb-8">
            Platforma completă pentru calcule fiscale, comparații forme juridice, 
            simulări credit și analiza drepturilor - conformă cu legislația {currentYear}
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href={`/calculator-salarii-pro/${currentYear}`}>
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white">
                Calculator Salarii
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
            <Link href={`/calculator-pfa/${currentYear}`}>
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white">
                Calculator PFA
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
            <Link href={`/decision-maker/${currentYear}`}>
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white">
                Decision Maker
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Calculators Grid */}
      <section className="pb-20 px-4">
        <div className="container mx-auto">
          <h3 className="text-2xl font-bold text-white text-center mb-8">
            Toate Calculatoarele
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {professionalCalculators.map((calc) => {
              const Icon = calc.icon;
              return (
                <Link key={calc.id} href={calc.href} aria-label={`Deschide ${calc.title}`}>
                  <Card className="bg-slate-800/50 border-slate-700 hover:border-slate-500 hover:bg-slate-800 transition-all duration-300 hover:-translate-y-1 cursor-pointer h-full group">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className={`w-12 h-12 rounded-xl ${calc.color} flex items-center justify-center shadow-lg`}>
                          <Icon className="h-6 w-6 text-white" />
                        </div>
                        {calc.badge && (
                          <span className={`text-xs px-2 py-1 rounded-full font-semibold ${
                            calc.badge === 'PRO' ? 'bg-blue-600 text-white' :
                            calc.badge === 'NOU' ? 'bg-green-600 text-white' :
                            'bg-amber-500 text-black'
                          }`}>
                            {calc.badge}
                          </span>
                        )}
                      </div>
                      <CardTitle className="text-white mt-4 group-hover:text-blue-400 transition-colors">
                        {calc.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-slate-300 text-sm">
                        {calc.description}
                      </p>
                      <div className="mt-4 flex items-center text-blue-400 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                        Deschide calculator
                        <ArrowRight className="h-4 w-4 ml-1" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-slate-800/30">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div className="p-6">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-600/20 flex items-center justify-center">
                <TrendingUp className="h-8 w-8 text-blue-400" />
              </div>
              <h4 className="text-lg font-semibold text-white mb-2">Multi-An</h4>
              <p className="text-slate-400 text-sm">
                Reguli fiscale configurabile pe an. Comparație {currentYear - 1} vs {currentYear}.
              </p>
            </div>
            <div className="p-6">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-600/20 flex items-center justify-center">
                <Calculator className="h-8 w-8 text-green-400" />
              </div>
              <h4 className="text-lg font-semibold text-white mb-2">Calcule Complexe</h4>
              <p className="text-slate-400 text-sm">
                IT, Construcții, Part-time, PFA, SRL - toate scenariile fiscale.
              </p>
            </div>
            <div className="p-6">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-purple-600/20 flex items-center justify-center">
                <Scale className="h-8 w-8 text-purple-400" />
              </div>
              <h4 className="text-lg font-semibold text-white mb-2">Conform Legislație</h4>
              <p className="text-slate-400 text-sm">
                OUG 158/2005, EU261, Cod Fiscal - actualizat automat.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-slate-800 bg-slate-950">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <h3 className="text-white font-semibold mb-4">eCalc.ro</h3>
              <p className="text-slate-400 text-sm">
                Calculatoare fiscale profesionale pentru România. 
                Toate calculele sunt orientative și nu înlocuiesc consultanța fiscală.
              </p>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Legal</h3>
              <div className="space-y-2">
                <Link href="/termeni-conditii" className="block text-slate-400 hover:text-white text-sm">
                  Termeni și Condiții
                </Link>
                <Link href="/politica-confidentialitate" className="block text-slate-400 hover:text-white text-sm">
                  Politica de Confidențialitate
                </Link>
              </div>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Surse Oficiale</h3>
              <div className="space-y-2 text-sm">
                <a href="https://www.anaf.ro" target="_blank" rel="noopener" className="block text-slate-400 hover:text-white">
                  ANAF - Agenția Națională de Administrare Fiscală
                </a>
                <a href="https://e-factura.anaf.ro" target="_blank" rel="noopener" className="block text-slate-400 hover:text-white">
                  Portal e-Factura
                </a>
                <a href="https://www.legislatie.just.ro" target="_blank" rel="noopener" className="block text-slate-400 hover:text-white">
                  Legislație România
                </a>
              </div>
            </div>
          </div>
          <div className="text-center pt-8 border-t border-slate-800">
            <p className="text-slate-500 text-sm">© {currentYear} eCalc.ro - Calculatoare Fiscale Profesionale pentru România</p>
            <p className="text-slate-600 text-xs mt-2">Informațiile au caracter orientativ. Consultați un specialist pentru situații complexe.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
