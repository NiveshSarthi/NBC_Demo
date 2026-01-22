import { Metadata } from 'next';
import BlogClient from './BlogClient';

// Force dynamic rendering to avoid prerender issues with client components
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Blog - NextBoomCity',
  description: 'Stay updated with the latest real estate insights, market trends, and investment opportunities in India\'s emerging cities.',
  keywords: 'real estate blog, property investment, market trends, real estate news, India property',
};

export default function BlogPage() {
  return <BlogClient />;
}