import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/dashboard/', '/admin/', '/api/', '/login'],
      },
    ],
    sitemap: 'https://lumestudio.my.id/sitemap.xml',
    host: 'https://lumestudio.my.id',
  }
}
