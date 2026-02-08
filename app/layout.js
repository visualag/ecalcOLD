import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/sonner';

const inter = Inter({ subsets: ['latin'], display: 'swap' });

export const metadata = {
  metadataBase: new URL('https://ecalc.ro'),
  alternates: {
    canonical: '/',
  },
  title: 'Calculator Salarii 2026 PRO - Brut la Net & PFA vs SRL | eCalc.ro',
  description: 'Sistem profesional de calcul fiscal 2026. Calculator Salarii Brut/Net, PFA, e-Factura, Impozit Auto și Rentabilitate Imobiliară. Actualizat la zi conform legislației din România.',
  keywords: 'calculator salariu 2026, brut net 2026, calculator pfa 2026, pfa vs srl, impozit auto 2026, e-factura romania',
};

export default function RootLayout({ children }) {
  return (
    <html lang="ro">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'SoftwareApplication',
              name: 'eCalc RO',
              applicationCategory: 'FinanceApplication',
              offers: {
                '@type': 'Offer',
                price: '0',
                priceCurrency: 'RON',
              },
              aggregateRating: {
                '@type': 'AggregateRating',
                ratingValue: '4.8',
                ratingCount: '1250',
              },
            }),
          }}
        />
      </head>
      <body className={inter.className}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
