const currentYear = new Date().getFullYear();

export async function generateMetadata({ params }) {
  // Luam orasul/statiunea din URL si il facem cu prima litera mare
  const city = params.city.charAt(0).toUpperCase() + params.city.slice(1);

  return {
    title: `Vremea în ${city} ${currentYear} - Prognoză Meteo și Temperatură`,
    description: `Află starea vremii în ${city} pentru ${currentYear}. Prognoza detaliată pe ore și zile, temperatura acum și avertizări meteo pentru ${city}.`,
    keywords: `vremea ${city}, prognoza meteo ${city}, starea vremii ${city} ${currentYear}, temperatura ${city}`,
    alternates: { 
      canonical: `/vreme/${params.city}` 
    }
  };
}

export default function Layout({ children }) {
  return <>{children}</>;
}
