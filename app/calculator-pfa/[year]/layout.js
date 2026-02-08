const currentYear = new Date().getFullYear();

export const metadata = {
  title: `Calculator PFA ${currentYear}`,
  description: `Calculează taxele pentru PFA în ${currentYear}: CAS, CASS și Impozit pe venit. Compară sistemul real cu norma de venit și vezi simularea PFA vs SRL.`,
  alternates: { canonical: `/calculator-pfa/${currentYear}` }
};

export default function Layout({ children }) {
  return <>{children}</>;
}
