'use client';

import Link from 'next/link';
import { FileText, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Link href="/">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Înapoi la Acasă
            </Button>
          </Link>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <FileText className="h-8 w-8 text-blue-600" />
                <CardTitle className="text-3xl">Termeni și Condiții</CardTitle>
              </div>
              <p className="text-slate-600 mt-2">Ultima actualizare: Februarie 2026</p>
            </CardHeader>
            <CardContent className="prose prose-slate max-w-none">
              <h2>1. Acceptarea Termenilor</h2>
              <p>
                Prin accesarea și utilizarea site-ului eCalc.ro ("Site-ul", "Serviciul"), acceptați să fiți legat
                de acești Termeni și Condiții. Dacă nu sunteți de acord, vă rugăm să nu utilizați Site-ul.
              </p>

              <h2>2. Descrierea Serviciului</h2>
              <p>
                eCalc.ro oferă <strong>calculatoare fiscale orientative</strong> pentru România, incluzând:
              </p>
              <ul>
                <li>Calculator Salarii (brut/net, facilități IT, construcții)</li>
                <li>Calculator PFA (sistem real vs normă de venit)</li>
                <li>Decision Maker (comparație forme juridice)</li>
                <li>Calculator Concediu Medical</li>
                <li>Calculator Impozit Auto</li>
                <li>Calculator Rentabilitate Imobiliară</li>
                <li>Calculator e-Factura (termene)</li>
                <li>Calculator Compensații Zboruri (EU 261/2004)</li>
              </ul>

              <h2>3. Limitarea Responsabilității</h2>
              <div className="p-4 bg-red-50 border-l-4 border-red-500 my-4">
                <p className="font-bold text-red-900">⚠️ DISCLAIMER IMPORTANT:</p>
                <p className="text-red-800">
                  Calculatoarele furnizează <strong>ESTIMĂRI ORIENTATIVE</strong> și NU constituie:
                </p>
                <ul className="text-red-800">
                  <li>Consiliere fiscală profesională</li>
                  <li>Consiliere juridică</li>
                  <li>Recomandări de investiții</li>
                  <li>Consultanță contabilă certificată</li>
                </ul>
              </div>

              <h3>3.1 Acuratețea Informațiilor</h3>
              <p>
                Depunem toate eforturile pentru menținerea informațiilor actualizate, dar:
              </p>
              <ul>
                <li>Legislația fiscală se modifică frecvent</li>
                <li>Pot exista erori sau omisiuni neintenționate</li>
                <li>Unele date (prețuri imobiliare, norme PFA) sunt <strong>estimate</strong></li>
                <li>Situații individuale pot necesita calcule specifice</li>
              </ul>
              <p>
                <strong>NU garantăm acuratețea absolută</strong> a rezultatelor.
                Verificați întotdeauna cu surse oficiale (ANAF, consultant fiscal).
              </p>

              <h3>3.2 Lipsa Garanțiilor</h3>
              <p>Serviciul este furnizat "CA ATARE" și "DUPĂ CUM ESTE DISPONIBIL", fără garanții de niciun fel:</p>
              <ul>
                <li>NU garantăm că serviciul va fi neîntrerupt sau fără erori</li>
                <li>NU garantăm acuratețea calculelor pentru situații complexe</li>
                <li>NU garantăm că rezultatele vor corespunde exact situației fiscale reale</li>
              </ul>

              <h3>3.3 Limitarea Daunelor</h3>
              <p>
                În niciun caz eCalc.ro, operatorii sau partenerii săi <strong>NU vor fi răspunzători</strong> pentru:
              </p>
              <ul>
                <li>Pierderi financiare rezultate din utilizarea calculatoarelor</li>
                <li>Decizii fiscale luate pe baza rezultatelor</li>
                <li>Amenzi sau penalități ANAF rezultate din calcule incorecte</li>
                <li>Daune indirecte, incidentale sau consecutive</li>
              </ul>

              <h2>4. Utilizare Acceptabilă</h2>
              <h3>4.1 Utilizare Permisă</h3>
              <p>Puteți utiliza Site-ul pentru:</p>
              <ul>
                <li>Calcule fiscale personale sau pentru clienți</li>
                <li>Verificări orientative</li>
                <li>Comparații între opțiuni fiscale</li>
                <li>Educație fiscală</li>
              </ul>

              <h3>4.2 Utilizare Interzisă</h3>
              <p>NU aveți voie să:</p>
              <ul>
                <li>Copiați sau reproduceți codul sursă al calculatoarelor</li>
                <li>Creați produse derivate sau competitive</li>
                <li>Folosiți roboți, scrapere sau sisteme automate pentru extragere date</li>
                <li>Supraîncărcați serverele cu cereri excesive</li>
                <li>Încercați să accesați neautorizat sistemele noastre</li>
                <li>Folosiți Site-ul pentru activități ilegale</li>
              </ul>

              <h2>5. Proprietate Intelectuală</h2>
              <p>
                Tot conținutul Site-ului (calcule, design, logo, text, cod) este proprietatea eCalc.ro
                și este protejat de legile dreptului de autor.
              </p>
              <p>
                Este interzisă reproducerea, distribuirea sau modificarea fără permisiune scrisă.
              </p>

              <h2>6. Link-uri către Terți</h2>
              <p>
                Site-ul poate conține link-uri către site-uri terțe (ANAF, imobiliare.ro, etc.).
                Nu suntem responsabili pentru conținutul sau practicile de confidențialitate ale acestora.
              </p>

              <h2>7. Colectarea Lead-urilor</h2>
              <p>
                Dacă alegeți să vă înscrieți pentru consultanță (formular lead), acceptați că:
              </p>
              <ul>
                <li>Datele vor fi folosite conform <Link href="/politica-confidentialitate" className="text-blue-600 hover:underline">Politicii de Confidențialitate</Link></li>
                <li>Putem să vă contactăm prin email/telefon</li>
                <li>Puteți solicita ștergerea datelor oricând</li>
              </ul>

              <h2>8. Modificări ale Serviciului</h2>
              <p>Ne rezervăm dreptul de a:</p>
              <ul>
                <li>Modifica sau întrerupe serviciul oricând</li>
                <li>Actualiza calculatoarele și formulele</li>
                <li>Schimba acești Termeni și Condiții</li>
              </ul>
              <p>Modificările vor fi publicate pe această pagină.</p>

              <h2>9. Suspendarea Contului Admin</h2>
              <p>
                Pentru administratori, ne rezervăm dreptul de a suspenda accesul în caz de:
              </p>
              <ul>
                <li>Încălcare a termenilor</li>
                <li>Activitate suspectă</li>
                <li>Neachitare servicii (dacă aplicabil)</li>
              </ul>

              <h2>10. Legea Aplicabilă</h2>
              <p>
                Acești termeni sunt guvernați de <strong>legea română</strong>.
                Orice dispută va fi soluționată de instanțele competente din România.
              </p>

              <h2>11. Forță Majoră</h2>
              <p>
                Nu vom fi răspunzători pentru întârzieri sau eșecuri cauzate de evenimente în afara controlului nostru
                (dezastre naturale, atacuri cibernetice, modificări legislative bruște, etc.).
              </p>

              <h2>12. Separabilitate</h2>
              <p>
                Dacă o prevedere a acestor termeni este declarată invalidă, celelalte prevederi rămân în vigoare.
              </p>

              <h2>13. Contact</h2>
              <p>Pentru întrebări despre acești termeni:</p>
              <ul>
                <li><strong>Email:</strong> contact@ecalc.ro</li>
                <li><strong>Website:</strong> www.ecalc.ro</li>
              </ul>

              <div className="mt-8 p-4 bg-amber-50 border-l-4 border-amber-500">
                <p className="font-semibold text-amber-900">Recomandare Importantă:</p>
                <p className="text-amber-800 text-sm mt-1">
                  Pentru decizii fiscale importante, sume mari sau situații complexe (multiple venituri, investiții internaționale, etc.),
                  consultați întotdeauna un <strong>consultant fiscal autorizat</strong> sau un <strong>contabil certificat</strong>.
                  Calculatoarele noastre sunt instrumente de estimare, nu înlocuiesc expertiza profesională.
                </p>
              </div>

              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded">
                <p className="font-semibold text-blue-900">Acceptare:</p>
                <p className="text-blue-800 text-sm mt-1">
                  Prin utilizarea Site-ului, confirmați că ați citit, înțeles și acceptat acești Termeni și Condiții.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
