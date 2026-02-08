'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Calculator, Menu, X, Home, Briefcase, HeartPulse, Car, Building2, FileText, Plane,
  TrendingUp, ChevronDown, CloudSun
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const currentYear = 2026;

const calculators = [
  { name: 'Salarii PRO', href: `/calculator-salarii-pro/${currentYear}`, icon: Calculator, color: 'text-blue-500' },
  { name: 'PFA', href: `/calculator-pfa/${currentYear}`, icon: Briefcase, color: 'text-emerald-500' },
  { name: 'Decision Maker', href: `/decision-maker/${currentYear}`, icon: TrendingUp, color: 'text-purple-500' },
  { name: 'Concediu Medical', href: `/calculator-concediu-medical/${currentYear}`, icon: HeartPulse, color: 'text-rose-500' },
  { name: 'Impozit Auto', href: `/calculator-impozit-auto/${currentYear}`, icon: Car, color: 'text-amber-500' },
  { name: 'Imobiliare', href: `/calculator-imobiliare-pro/${currentYear}`, icon: Building2, color: 'text-indigo-500' },
  { name: 'e-Factura', href: `/calculator-efactura/${currentYear}`, icon: FileText, color: 'text-violet-500' },
  { name: 'Compensații Zboruri', href: `/calculator-compensatii-zboruri/${currentYear}`, icon: Plane, color: 'text-sky-500' },
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
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <Calculator className="h-5 w-5 text-white" />
            </div>
            <div>
              <span className="text-lg font-bold text-slate-900">eCalc.ro</span>
              <span className="hidden sm:inline text-xs text-slate-500 ml-2">Calculatoare Fiscale</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1">
            <Link href="/">
              <Button variant="ghost" size="sm" className={pathname === '/' ? 'bg-slate-100' : ''}>
                <Home className="h-4 w-4 mr-1" />
                Acasă
              </Button>
            </Link>

            {/* Calculators Dropdown */}
            <div className="relative">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center"
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
                  <div className="absolute top-full left-0 mt-1 w-64 bg-white rounded-lg shadow-lg border border-slate-200 py-2 z-20">
                    {calculators.map((calc) => {
                      const Icon = calc.icon;
                      return (
                        <Link
                          key={calc.href}
                          href={calc.href}
                          onClick={() => setDropdownOpen(false)}
                          className={`flex items-center px-4 py-2 hover:bg-slate-50 transition-colors ${
                            isActive(calc.href) ? 'bg-blue-50 text-blue-700' : 'text-slate-700'
                          }`}
                        >
                          <Icon className={`h-4 w-4 mr-3 ${calc.color}`} />
                          {calc.name}
                        </Link>
                      );
                    })}
                  </div>
                </>
              )}
            </div>

            {/* Quick Links */}
            <Link href={`/calculator-salarii-pro/${currentYear}`}>
              <Button 
                variant="ghost" 
                size="sm"
                className={isActive(`/calculator-salarii-pro`) ? 'bg-blue-50 text-blue-700' : ''}
              >
                Salarii
              </Button>
            </Link>
            <Link href={`/calculator-pfa/${currentYear}`}>
              <Button 
                variant="ghost" 
                size="sm"
                className={isActive(`/calculator-pfa`) ? 'bg-emerald-50 text-emerald-700' : ''}
              >
                PFA
              </Button>
            </Link>
            <Link href={`/decision-maker/${currentYear}`}>
              <Button 
                variant="ghost" 
                size="sm"
                className={isActive(`/decision-maker`) ? 'bg-purple-50 text-purple-700' : ''}
              >
                Decision Maker
              </Button>
            </Link>
<Link href="/vreme">
  <Button 
    variant="ghost" 
    size="sm"
    className={pathname === '/vreme' ? 'bg-blue-50 text-blue-700' : 'text-slate-600'}
  >
    <CloudSun className="h-4 w-4 mr-1 text-blue-500" />
    Vremea
  </Button>
</Link>
            <Link href="/admin-pro">
              <Button variant="outline" size="sm">
                Admin
              </Button>
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden p-2 rounded-lg hover:bg-slate-100"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6 text-slate-600" />
            ) : (
              <Menu className="h-6 w-6 text-slate-600" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-slate-200">
            <div className="space-y-1">
              <Link
                href="/"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center px-3 py-2 rounded-lg ${
                  pathname === '/' ? 'bg-blue-50 text-blue-700' : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Home className="h-5 w-5 mr-3" />
                Acasă
              </Link>
              
              <div className="pt-2 pb-1 px-3 text-xs font-semibold text-slate-500 uppercase">
                Calculatoare
              </div>
              
              {calculators.map((calc) => {
                const Icon = calc.icon;
                return (
                  <Link
                    key={calc.href}
                    href={calc.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center px-3 py-2 rounded-lg ${
                      isActive(calc.href) ? 'bg-blue-50 text-blue-700' : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <Icon className={`h-5 w-5 mr-3 ${calc.color}`} />
                    {calc.name}
                  </Link>
                );
              })}
<Link
  href="/vreme"
  onClick={() => setMobileMenuOpen(false)}
  className={`flex items-center px-3 py-2 rounded-lg mb-2 ${
    pathname === '/vreme' ? 'bg-blue-50 text-blue-700' : 'text-slate-700 hover:bg-slate-50'
  }`}
>
  <CloudSun className="h-5 w-5 mr-3 text-blue-500" />
  Vremea
</Link>
              <div className="pt-4">
                <Link href="/admin-pro" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full">
                    Admin Dashboard
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
