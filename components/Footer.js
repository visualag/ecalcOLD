'use client';

import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="py-8 px-4 border-t border-slate-200 bg-white mt-auto">
      <div className="container mx-auto">
        <div className="grid md:grid-cols-4 gap-6 text-sm mb-6">
          <div>
            <h3 className="font-semibold text-slate-900 mb-3">eCalc.ro</h3>
            <p className="text-slate-500 text-xs">
              Calculatoare fiscale profesionale pentru România. 
              Informațiile sunt orientative și nu înlocuiesc consultanța fiscală.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 mb-3">Calculatoare</h3>
            <div className="space-y-1.5">
              <Link href={`/calculator-salarii-pro/${currentYear}`} className="block text-slate-500 hover:text-blue-600 text-xs">
                Calculator Salarii
              </Link>
              <Link href={`/calculator-pfa/${currentYear}`} className="block text-slate-500 hover:text-blue-600 text-xs">
                Calculator PFA
              </Link>
              <Link href={`/decision-maker/${currentYear}`} className="block text-slate-500 hover:text-blue-600 text-xs">
                Decision Maker
              </Link>
            </div>
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 mb-3">Legal</h3>
            <div className="space-y-1.5">
              <Link href="/termeni-conditii" className="block text-slate-500 hover:text-blue-600 text-xs">
                Termeni și Condiții
              </Link>
              <Link href="/politica-confidentialitate" className="block text-slate-500 hover:text-blue-600 text-xs">
                Politica de Confidențialitate
              </Link>
            </div>
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 mb-3">Surse Oficiale</h3>
            <div className="space-y-1.5">
              <a href="https://www.anaf.ro" target="_blank" rel="noopener noreferrer" className="block text-slate-500 hover:text-blue-600 text-xs">
                ANAF
              </a>
              <a href="https://e-factura.anaf.ro" target="_blank" rel="noopener noreferrer" className="block text-slate-500 hover:text-blue-600 text-xs">
                Portal e-Factura
              </a>
            </div>
          </div>
        </div>
        <div className="text-center pt-4 border-t border-slate-100">
          <p className="text-slate-400 text-xs">© {currentYear} eCalc.ro - Toate drepturile rezervate</p>
        </div>
      </div>
    </footer>
  );
}
