import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://ecalc.ro'
  const currentYear = 2026

  // Paginile statice
  const routes = ['', '/termeni-conditii', '/politica-confidentialitate'].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
  }))

  // Paginile de calculatoare
  const calculatorRoutes = [
    `/calculator-salarii-pro/${currentYear}`,
    `/calculator-pfa/${currentYear}`,
    `/decision-maker/${currentYear}`,
    `/calculator-concediu-medical/${currentYear}`,
    `/calculator-impozit-auto/${currentYear}`,
    `/calculator-imobiliare-pro/${currentYear}`,
    `/calculator-efactura/${currentYear}`,
    `/calculator-compensatii-zboruri/${currentYear}`,
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
  }))

  return [...routes, ...calculatorRoutes]
}
