import { Metadata } from 'next';
import { BlogPostDetail } from '@/components/blog/BlogPostDetail';
import { notFound } from 'next/navigation';

interface PageProps {
  params: {
    slug: string;
  };
}

// Generate metadata for SEO
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/v1/content/posts/${params.slug}`,
      { cache: 'no-store' }
    );

    if (!response.ok) {
      return {
        title: 'Post Not Found - NextBoomCity',
        description: 'The blog post you are looking for could not be found.',
      };
    }

    const post = await response.json();

    const title = post.seo?.title || `${post.title} - NextBoomCity Blog`;
    const description = post.seo?.description || post.excerpt;
    const keywords = post.seo?.keywords?.join(', ') || post.tags?.join(', ');
    const imageUrl = post.featuredImage || 'https://nextboomcity.com/default-blog.jpg';

    return {
      title,
      description,
      keywords,
      authors: [{ name: "NextBoomCity" }],
      openGraph: {
        title,
        description,
        url: `https://nextboomcity.com/blog/${params.slug}`,
        siteName: "NextBoomCity",
        images: [
          {
            url: imageUrl,
            width: 1200,
            height: 630,
            alt: post.title,
          },
        ],
        locale: "en_IN",
        type: "article",
        publishedTime: post.publishedAt,
        authors: ["NextBoomCity"],
        tags: post.tags,
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: [imageUrl],
        creator: "@nextboomcity",
      },
      alternates: {
        canonical: `https://nextboomcity.com/blog/${params.slug}`,
      },
    };
  } catch (error) {
    console.error("Error generating blog post metadata:", error);
    return {
      title: 'Blog - NextBoomCity',
      description: 'Read the latest articles and insights on real estate investment.',
    };
  }
}

export default function BlogPostPage({ params }: PageProps) {
  return (
    <div>
      {/* Article Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            "headline": "Blog Post",
            "url": `https://nextboomcity.com/blog/${params.slug}`,
            "publisher": {
              "@type": "Organization",
              "name": "NextBoomCity",
              "logo": {
                "@type": "ImageObject",
                "url": "https://nextboomcity.com/logo.png"
              }
            },
            "author": {
              "@type": "Organization",
              "name": "NextBoomCity"
            }
          }),
        }}
      />

      {/* BlogPostDetail component will be rendered here */}
      {/* BlogPostDetail component not found, placeholder */}
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-4">Blog Post: {params.slug}</h1>
          <p className="text-gray-600">Blog post content will be displayed here.</p>
        </div>
      </div>
    </div>
  );
}