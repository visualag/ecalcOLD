'use client';

import { Calculator, FileText, Plane, Home as HomeIcon, Car, HeartPulse } from 'lucide-react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const calculators = [
  {
    id: 'salarii',
    title: 'Calculator Salariu Brut/Net',
    description: 'Calculează salariul net din brut sau invers, cu toate contribuțiile 2026',
    icon: Calculator,
    href: '/salarii',
    color: 'bg-blue-500',
  },
  {
    id: 'concediu-medical',
    title: 'Concediu Medical',
    description: 'Calculează indemnizația de concediu medical conform OUG 2026',
    icon: HeartPulse,
    href: '/concediu-medical',
    color: 'bg-green-500',
  },
  {
    id: 'e-factura',
    title: 'e-Factura - Termene & Amenzi',
    description: 'Verifică termenele de raportare și calculează amenzile',
    icon: FileText,
    href: '/e-factura',
    color: 'bg-purple-500',
  },
  {
    id: 'impozit-auto',
    title: 'Impozit Auto',
    description: 'Calculează impozitul de autovehicul pentru 2026',
    icon: Car,
    href: '/impozit-auto',
    color: 'bg-orange-500',
  },
  {
    id: 'zboruri',
    title: 'Compensații Zboruri EU261',
    description: 'Calculează compensația pentru zbor întârziat sau anulat',
    icon: Plane,
    href: '/zboruri',
    color: 'bg-red-500',
  },
  {
    id: 'imobiliare',
    title: 'Calculator Randament Imobiliar',
    description: 'Calculează yield-ul investiției imobiliare',
    icon: Home,
    href: '/imobiliare',
    color: 'bg-teal-500',
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Calculator className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-slate-900">eCalc RO</h1>
            </div>
            <Link href="/admin">
              <Button variant="outline" size="sm">Admin</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
            Calculatoare Fiscale & Utilitare
          </h2>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Platformă gratuită pentru calcularea impozitelor, salariilor și alte utilități fiscale pentru România - 2026
          </p>
        </div>
      </section>

      {/* Calculators Grid */}
      <section className="pb-16 px-4">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {calculators.map((calc) => {
              const Icon = calc.icon;
              return (
                <Link key={calc.id} href={calc.href}>
                  <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer h-full">
                    <CardHeader>
                      <div className={`w-12 h-12 rounded-lg ${calc.color} flex items-center justify-center mb-4`}>
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <CardTitle className="text-xl">{calc.title}</CardTitle>
                      <CardDescription className="text-slate-600">
                        {calc.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button className="w-full" variant="outline">
                        Calculează acum
                      </Button>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-8">
        <div className="container mx-auto px-4 text-center text-slate-600">
          <p>© 2026 eCalc RO - Toate drepturile rezervate</p>
          <p className="text-sm mt-2">Date actualizate conform legislației fiscale 2026</p>
        </div>
      </footer>
    </div>
  );
}
