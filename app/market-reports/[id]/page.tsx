import { Metadata } from 'next';
import { MarketReportDetail } from '@/components/market-reports/MarketReportDetail';
import { notFound } from 'next/navigation';

interface PageProps {
  params: {
    id: string;
  };
}

// Generate metadata for SEO
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/v1/content/reports/${params.id}`,
      { cache: 'no-store' }
    );

    if (!response.ok) {
      return {
        title: 'Report Not Found - NextBoomCity',
      };
    }

    const report = await response.json();

    return {
      title: report.seo?.title || `${report.title} - NextBoomCity Market Reports`,
      description: report.seo?.description || report.description,
      keywords: report.seo?.keywords?.join(', ') || report.tags?.join(', '),
    };
  } catch (error) {
    return {
      title: 'Market Reports - NextBoomCity',
    };
  }
}

export default function MarketReportPage({ params }: PageProps) {
  return <MarketReportDetail reportId={params.id} />;
}