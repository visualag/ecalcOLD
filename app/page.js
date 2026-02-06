'use client';

import { Calculator, FileText, Plane, Home as HomeIcon, Car, HeartPulse, Briefcase, Building2, TrendingUp, Scale, ArrowRight, Star } from 'lucide-react';
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
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Header */}
      <header className="bg-slate-900/50 backdrop-blur border-b border-slate-700 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <Calculator className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">eCalc.ro</h1>
                <p className="text-xs text-slate-400">Calculatoare Fiscale Profesionale</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Link href="/admin-pro">
                <Button variant="default" size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                  Admin Pro
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-600/20 border border-blue-500/30 text-blue-400 text-sm mb-6">
            <Star className="h-4 w-4" />
            Actualizat pentru {currentYear}
          </div>
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Calculatoare Fiscale
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
              Profesionale România
            </span>
          </h2>
          <p className="text-xl text-slate-400 max-w-3xl mx-auto mb-8">
            Platforma completă pentru calcule fiscale, comparații forme juridice, 
            simulări credit și analiza drepturilor - conformă cu legislația {currentYear}
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href={`/calculator-salarii-pro/${currentYear}`}>
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                Calculator Salarii
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
            <Link href={`/calculator-pfa/${currentYear}`}>
              <Button size="lg" variant="outline" className="border-slate-600 text-white hover:bg-slate-800">
                Calculator PFA
              </Button>
            </Link>
            <Link href={`/decision-maker/${currentYear}`}>
              <Button size="lg" variant="outline" className="border-purple-500 text-purple-400 hover:bg-purple-600/20">
                Decision Maker
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
                <Link key={calc.id} href={calc.href}>
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
                      <p className="text-slate-400 text-sm">
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
      <footer className="py-8 px-4 border-t border-slate-800">
        <div className="container mx-auto text-center text-slate-500 text-sm">
          <p>© {currentYear} eCalc.ro - Calculatoare Fiscale Profesionale pentru România</p>
          <p className="mt-2">Informațiile au caracter orientativ. Consultați un specialist pentru situații complexe.</p>
        </div>
      </footer>
    </div>
  );
}
