import { Metadata } from 'next';
import { BlogListing } from '@/components/blog/BlogListing';

export const metadata: Metadata = {
  title: 'Blog - NextBoomCity',
  description: 'Stay updated with the latest real estate insights, market trends, and investment opportunities in India\'s emerging cities.',
  keywords: 'real estate blog, property investment, market trends, real estate news, India property',
};

export default function BlogPage() {
  return <BlogListing />;
}