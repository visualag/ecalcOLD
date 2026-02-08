'use client';

import Link from 'next/link';
import { Calculator } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calculator, CloudSun } from 'lucide-react';

export default function Header() {
  return (
    <header className="bg-slate-900/95 backdrop-blur border-b border-slate-700 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-3 hover:opacity-80 transition">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <Calculator className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">eCalc.ro</h1>
              <p className="text-xs text-slate-400">Calculatoare Fiscale România</p>
            </div>
          </Link>
          <div className="flex gap-2">
            <Link href="/">
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                <Link href="/vreme">
  <Button size="sm" variant="outline" className="border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white">
    <CloudSun className="h-4 w-4 mr-2 text-blue-400" />
    Vremea
  </Button>
</Link>
                Calculatoare
              </Button>
            </Link>
            <Link href="/admin-pro">
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                Admin Pro
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
