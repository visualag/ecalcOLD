'use client';

import { useState } from 'react';
import { FileText, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export default function EFacturaPage() {
  const [valoareFactura, setValoareFactura] = useState('');
  const [zileIntarziere, setZileIntarziere] = useState('');
  const [result, setResult] = useState(null);
  const [affiliateLink, setAffiliateLink] = useState('#');
  const [affiliateText, setAffiliateText] = useState('Software e-Factura');

  useState(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        setAffiliateLink(data.affiliate_efactura_link || '#');
        setAffiliateText(data.affiliate_efactura_text || 'Software e-Factura');
      });
  }, []);

  const calculate = () => {
    const valoare = parseFloat(valoareFactura);
    const zile = parseInt(zileIntarziere);

    if (isNaN(valoare) || isNaN(zile) || valoare <= 0 || zile < 0) {
      toast.error('Introduceți valori valide');
      return;
    }

    // Termene raportare: 5 zile pentru emitere, 5 zile pentru înregistrare
    const termenRaportare = 5;
    let amenda = 0;
    let status = 'La timp';

    if (zile > termenRaportare) {
      // Amenă: 500-1000 RON pentru persoane fizice, 1000-5000 pentru persoane juridice
      amenda = 1000 + (zile - termenRaportare) * 50;
      status = 'Întârziere';
    }

    setResult({
      valoare: valoare.toFixed(2),
      termenRaportare,
      zileIntarziere: zile,
      amenda: amenda.toFixed(2),
      status,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <Link href="/" className="flex items-center space-x-2">
            <ArrowLeft className="h-6 w-6 text-slate-600" />
            <FileText className="h-8 w-8 text-purple-600" />
            <h1 className="text-2xl font-bold text-slate-900">eCalc RO</h1>
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">e-Factura - Termene & Amenzi 2026</h1>
          <p className="text-lg text-slate-600 mb-8">Verifică termenele de raportare și calculează amenzile pentru întârziere</p>

          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Introduceți datele</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="value">Valoare Factură (RON)</Label>
                  <Input
                    id="value"
                    type="number"
                    placeholder="ex: 10000"
                    value={valoareFactura}
                    onChange={(e) => setValoareFactura(e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="days">Zile de la emitere</Label>
                  <Input
                    id="days"
                    type="number"
                    placeholder="ex: 7"
                    value={zileIntarziere}
                    onChange={(e) => setZileIntarziere(e.target.value)}
                  />
                </div>

                <Button onClick={calculate} className="w-full">
                  Verifică Statut
                </Button>
              </CardContent>
            </Card>

            {result && (
              <Card className={result.amenda > 0 ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}>
                <CardHeader>
                  <CardTitle>Rezultate</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Status:</span>
                    <span className={`text-xl font-bold ${result.amenda > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {result.status}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Termen raportare:</span>
                    <span>{result.termenRaportare} zile</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Zile de la emitere:</span>
                    <span>{result.zileIntarziere} zile</span>
                  </div>
                  {result.amenda > 0 && (
                    <div className="flex justify-between items-center border-t pt-3">
                      <span className="font-semibold">Amendă estimată:</span>
                      <span className="text-2xl font-bold text-red-600">{result.amenda} RON</span>
                    </div>
                  )}

                  <div className="pt-4 border-t">
                    <a href={affiliateLink} target="_blank" rel="noopener noreferrer">
                      <Button className="w-full bg-purple-600 hover:bg-purple-700" size="lg">
                        {affiliateText}
                      </Button>
                    </a>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
