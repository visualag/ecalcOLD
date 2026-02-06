'use client';

import { AlertTriangle, ExternalLink } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export default function DisclaimerCard({ lastUpdate = 'Februarie 2026', sources = [], estimateNote = null }) {
  return (
    <Card className="border-2 border-amber-200 bg-amber-50">
      <CardContent className="pt-6">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-6 w-6 text-amber-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-amber-900">
            <p className="font-bold mb-2">⚠️ IMPORTANT - Disclaimer Legal:</p>
            <div className="space-y-2">
              <p>
                Acest calculator oferă <strong>estimări orientative</strong> bazate pe legislația în vigoare.
                Calculele au caracter <strong>informativ</strong> și NU constituie consiliere fiscală sau juridică.
              </p>
              <p>
                Pentru situații complexe, sume mari sau aspecte specifice ale situației dumneavoastră,
                consultați un <strong>consultant fiscal autorizat</strong> sau un <strong>avocat specializat</strong>.
              </p>
              {estimateNote && (
                <p className="mt-3 p-2 bg-amber-100 rounded border border-amber-300">
                  <strong>📊 Date estimate:</strong> {estimateNote}
                </p>
              )}
              <div className="mt-3 pt-3 border-t border-amber-300">
                <p className="font-semibold mb-1">Surse oficiale pentru verificare:</p>
                <ul className="space-y-1">
                  {sources.map((source, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <ExternalLink className="h-3 w-3" />
                      <a 
                        href={source.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-amber-800 hover:text-amber-600 underline"
                      >
                        {source.name}
                      </a>
                    </li>
                  ))}
                </ul>
                <p className="text-xs mt-2 text-amber-700">
                  Ultima actualizare date: <strong>{lastUpdate}</strong>
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
