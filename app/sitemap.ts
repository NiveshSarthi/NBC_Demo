import { MetadataRoute } from 'next'
import { PropertyModel } from '@/lib/models/property'
import { BlogPostModel } from '@/lib/models/blog-post'
import { LocationModel } from '@/lib/models/location'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://nextboomcity.com'

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/properties`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/locations`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/calculators`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/maps/growth-heatmap`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/maps/master-plans`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/maps/price-trends`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/maps/religious-tourism`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/market-reports`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/search`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/ai-tools`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
  ]

  // Helper function to safely fetch data with fallback
  const safeQuery = async <T>(
    queryFn: () => Promise<T>,
    fallback: T
  ): Promise<T> => {
    try {
      return await queryFn()
    } catch {
      // Return fallback if database is not available or tables don't exist
      return fallback
    }
  }

  // Fetch all active properties (with fallback to empty array)
  const propertiesResult = await safeQuery(
    () => PropertyModel.findMany({}, { limit: 10000 }),
    { properties: [] as Awaited<ReturnType<typeof PropertyModel.findMany>>['properties'], pagination: { page: 1, limit: 10000, total: 0, totalPages: 0 } }
  )
  const propertyPages: MetadataRoute.Sitemap = propertiesResult.properties.map((property) => ({
    url: `${baseUrl}/properties/${property.id}`,
    lastModified: property.updated_at,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  // Fetch all published blog posts (with fallback to empty array)
  const blogResult = await safeQuery(
    () => BlogPostModel.getPublishedPosts(1, 10000),
    { posts: [] as Awaited<ReturnType<typeof BlogPostModel.getPublishedPosts>>['posts'], total: 0 }
  )
  const blogPages: MetadataRoute.Sitemap = blogResult.posts.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: post.updatedAt,
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }))

  // Fetch all locations (with fallback to empty array)
  const locationsResult = await safeQuery(
    () => LocationModel.findMany({}, { limit: 10000 }),
    { locations: [] as Awaited<ReturnType<typeof LocationModel.findMany>>['locations'], pagination: { page: 1, limit: 10000, total: 0, totalPages: 0 } }
  )
  const locationPages: MetadataRoute.Sitemap = locationsResult.locations.map((location) => ({
    url: `${baseUrl}/locations/${location.name.toLowerCase().replace(/\s+/g, '-')}`,
    lastModified: new Date(), // Assuming locations don't have updated_at
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))

  // Fetch market reports if available
  const marketReportsPages: MetadataRoute.Sitemap = [] // TODO: Add market reports when API is available

  return [
    ...staticPages,
    ...propertyPages,
    ...blogPages,
    ...locationPages,
    ...marketReportsPages,
  ]
}