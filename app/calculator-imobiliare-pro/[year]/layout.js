const currentYear = new Date().getFullYear();

export const metadata = {
  title: `Calculator Yield si Rentabilitate Imobiliara ${currentYear}`,
  description: `Calculeaza randamentul investitiei tale imobiliare in ${currentYear}. Afla indicatorii de yield, ROI si perioada de recuperare a investitiei.`,
  alternates: { 
    canonical: '/yield-imobiliare' 
  }
};

export default function Layout({ children }) {
  return <>{children}</>;
}
