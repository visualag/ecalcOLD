export async function generateMetadata({ params }) {
    const year = params.year || new Date().getFullYear();

    return {
        title: `Decision Maker ${year} - PFA vs SRL vs Salariu`,
        description: `Compară PFA, SRL și Salariu pentru ${year}. Află ce formă de organizare este cea mai avantajoasă.`,
        keywords: `decision maker ${year}, pfa vs srl ${year}, calculator fiscal ${year}`,
        alternates: {
            canonical: `/decision-maker/${year}`
        }
    };
}

export default function Layout({ children }) {
    return <>{children}</>;
}
