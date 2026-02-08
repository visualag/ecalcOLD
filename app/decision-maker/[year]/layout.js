const currentYear = new Date().getFullYear();

export async function generateMetadata({ params }) {
  const year = params.year || currentYear;

  return {
    title: `PFA vs SRL ${year} - Calculator Optimizare Fiscală`,
    description: `Cea mai completă simulare PFA vs SRL în ${year}. Află care formă de organizare îți lasă mai mulți bani în buzunar după plata tuturor taxelor.`,
    alternates: { 
      canonical: `/decision-maker/${year}` 
    }
  };
}

export default function Layout({ children }) {
  return <>{children}</>;
}
