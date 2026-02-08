import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: '/admin-pro/',
    },
    // Folosim o cale relativa sau domeniul de test pana se propaga celalalt
    sitemap: 'https://calc.visualagency.ro/sitemap.xml',
  }
}
