const currentYear = new Date().getFullYear();

export async function generateMetadata({ params }) {
  const year = params.year || currentYear;

  return {
    title: `Calculator Concediu Medical ${year} - Calcul Indemnizație Netă`,
    description: `Calculează valoarea indemnizației pentru concediu medical în ${year}. Află câți bani primești în funcție de codul de indemnizație și stagiul de cotizare.`,
    alternates: { 
      canonical: '/concediu-medical' 
    }
  };
}

export default function Layout({ children }) {
  return <>{children}</>;
}
