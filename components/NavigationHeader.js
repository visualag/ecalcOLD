'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Calculator, Menu, X, Home, Briefcase, HeartPulse, Car, Building2, FileText, Plane,
  TrendingUp, ChevronDown, CloudSun
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const currentYear = new Date().getFullYear();

const calculators = [
  { name: 'Salarii PRO', href: `/calculator-salarii-pro/${currentYear}`, icon: Calculator, color: 'text-blue-600' },
  { name: 'PFA', href: `/calculator-pfa/${currentYear}`, icon: Briefcase, color: 'text-emerald-600' },
  { name: 'Decision Maker', href: `/decision-maker/${currentYear}`, icon: TrendingUp, color: 'text-purple-600' },
  { name: 'Concediu Medical', href: `/calculator-concediu-medical/${currentYear}`, icon: HeartPulse, color: 'text-rose-600' },
  { name: 'Impozit Auto', href: `/calculator-impozit-auto/${currentYear}`, icon: Car, color: 'text-amber-600' },
  { name: 'Imobiliare', href: `/calculator-imobiliare-pro/${currentYear}`, icon: Building2, color: 'text-indigo-600' },
  { name: 'e-Factura', href: `/calculator-efactura/${currentYear}`, icon: FileText, color: 'text-violet-600' },
  { name: 'Compensații Zboruri', href: `/calculator-compensatii-zboruri/${currentYear}`, icon: Plane, color: 'text-sky-600' },
];

export default function NavigationHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const pathname = usePathname();

  const isActive = (href) => pathname?.startsWith(href.split('/').slice(0, -1).join('/'));

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo - Adăugat titlu pentru SEO */}
          <Link href="/" title="Acasă eCalc.ro" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-600 to-purple-700 flex items-center justify-center">
              <Calculator className="h-5 w-5 text-white" aria-hidden="true" />
            </div>
            <div>
              <span className="text-lg font-bold text-slate-900">eCalc.ro</span>
              <span className="hidden sm:inline text-xs text-slate-600 ml-2 font-medium">Calculatoare Fiscale</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1" aria-label="Navigare principală">
            <Link href="/">
              <Button variant="ghost" size="sm" className={pathname === '/' ? 'bg-slate-100 font-bold' : 'text-slate-700'}>
                <Home className="h-4 w-4 mr-1" aria-hidden="true" />
                Acasă
              </Button>
            </Link>

            {/* Calculators Dropdown */}
            <div className="relative">
              <Button 
                variant="ghost" 
                size="sm"
                aria-expanded={dropdownOpen}
                aria-haspopup="true"
                aria-label="Deschide lista de calculatoare"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className={`flex items-center text-slate-700 ${dropdownOpen ? 'bg-slate-50' : ''}`}
              >
                <Calculator className="h-4 w-4 mr-1 text-slate-600" aria-hidden="true" />
                Calculatoare
                <ChevronDown className={`h-4 w-4 ml-1 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} aria-hidden="true" />
              </Button>

              {dropdownOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-10" 
                    onClick={() => setDropdownOpen(false)}
                    aria-hidden="true"
                  />
                  <div className="absolute top-full left-0 mt-1 w-64 bg-white rounded-lg shadow-lg border border-slate-200 py-2 z-20 shadow-blue-900/5">
                    {calculators.map((calc) => {
                      const Icon = calc.icon;
                      return (
                        <Link
                          key={calc.href}
                          href={calc.href}
                          onClick={() => setDropdownOpen(false)}
                          className={`flex items-center px-4 py-2 hover:bg-slate-50 transition-colors ${
                            isActive(calc.href) ? 'bg-blue-50 text-blue-800 font-bold' : 'text-slate-700'
                          }`}
                        >
                          <Icon className={`h-4 w-4 mr-3 ${calc.color}`} aria-hidden="true" />
                          {calc.name}
                        </Link>
                      );
                    })}
                  </div>
                </>
              )}
            </div>

            {/* Quick Links - Contrast îmbunătățit */}
            <Link href={`/calculator-salarii-pro/${currentYear}`}>
              <Button 
                variant="ghost" 
                size="sm"
                className={isActive(`/calculator-salarii-pro`) ? 'bg-blue-50 text-blue-800 font-bold' : 'text-slate-700'}
              >
                Salarii
              </Button>
            </Link>
            <Link href={`/calculator-pfa/${currentYear}`}>
              <Button 
                variant="ghost" 
                size="sm"
                className={isActive(`/calculator-pfa`) ? 'bg-emerald-50 text-emerald-800 font-bold' : 'text-slate-700'}
              >
                PFA
              </Button>
            </Link>
            <Link href={`/decision-maker/${currentYear}`}>
              <Button 
                variant="ghost" 
                size="sm"
                className={isActive(`/decision-maker`) ? 'bg-purple-50 text-purple-800 font-bold' : 'text-slate-700'}
              >
                Decision Maker
              </Button>
            </Link>
            <Link href="/vreme">
              <Button 
                variant="ghost" 
                size="sm"
                className={pathname === '/vreme' ? 'bg-blue-50 text-blue-800 font-bold' : 'text-slate-700'}
              >
                <CloudSun className="h-4 w-4 mr-1 text-blue-600" aria-hidden="true" />
                Vremea
              </Button>
            </Link>
            <Link href="/admin-pro" aria-label="Acces panou administrare">
              <Button variant="outline" size="sm" className="border-slate-300 text-slate-700 font-bold">
                Admin
              </Button>
            </Link>
          </nav>

          {/* Mobile Menu Button - REPARATIE CRITICĂ ARIA-LABEL */}
          <button
            className="lg:hidden p-2 rounded-lg hover:bg-slate-100 transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? "Închide meniul" : "Deschide meniul"}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6 text-slate-700" aria-hidden="true" />
            ) : (
              <Menu className="h-6 w-6 text-slate-700" aria-hidden="true" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-slate-200 bg-white">
            <nav className="space-y-1" aria-label="Navigare mobil">
              <Link
                href="/"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center px-3 py-2 rounded-lg font-medium ${
                  pathname === '/' ? 'bg-blue-50 text-blue-800 font-bold' : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Home className="h-5 w-5 mr-3 text-slate-600" aria-hidden="true" />
                Acasă
              </Link>
              
              <div className="pt-4 pb-2 px-3 text-xs font-black text-slate-500 uppercase tracking-widest">
                Calculatoare
              </div>
              
              {calculators.map((calc) => {
                const Icon = calc.icon;
                return (
                  <Link
                    key={calc.href}
                    href={calc.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center px-3 py-2 rounded-lg font-medium ${
                      isActive(calc.href) ? 'bg-blue-50 text-blue-800 font-bold' : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <Icon className={`h-5 w-5 mr-3 ${calc.color}`} aria-hidden="true" />
                    {calc.name}
                  </Link>
                );
              })}
              <Link
                href="/vreme"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center px-3 py-2 rounded-lg mb-2 font-medium ${
                  pathname === '/vreme' ? 'bg-blue-50 text-blue-800 font-bold' : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <CloudSun className="h-5 w-5 mr-3 text-blue-600" aria-hidden="true" />
                Vremea
              </Link>
              <div className="pt-4 px-2">
                <Link href="/admin-pro" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full border-slate-300 text-slate-700 font-bold">
                    Admin Dashboard
                  </Button>
                </Link>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
