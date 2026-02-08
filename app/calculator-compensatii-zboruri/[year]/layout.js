const currentYear = new Date().getFullYear();

export const metadata = {
  title: `Calculator Despăgubiri Zbor ${currentYear} - Drepturi Pasageri EU261`,
  description: `Află dacă ai dreptul la despăgubiri de până la 600€ pentru zboruri întârziate sau anulate în ${currentYear} conform regulamentului EU261.`,
  alternates: { 
    canonical: '/despagubiri-zbor' 
  }
};

export default function Layout({ children }) {
  return <>{children}</>;
}
