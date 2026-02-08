const currentYear = new Date().getFullYear();

export async function generateMetadata({ params }) {
  const { year } = params;

  return {
    title: `Calculator Salarii ${year} - Brut la Net & Deduceri Personale`,
    description: `Calculeaza salariul net in ${year}. Include calcul pentru tichete de masa, deduceri personale si comparatie completa intre Brut si Net.`,
    alternates: { 
      canonical: `/calculator-salarii-pro/${year}` 
    }
  };
}

export default function Layout({ children }) {
  return <>{children}</>;
}
