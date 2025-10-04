import { Metadata } from 'next';
import { MarketReportsListing } from '@/components/market-reports/MarketReportsListing';

export const metadata: Metadata = {
  title: 'Market Reports - NextBoomCity',
  description: 'Download comprehensive market reports and analysis for India\'s emerging real estate markets.',
  keywords: 'market reports, real estate analysis, property reports, investment reports, real estate data',
};

export default function MarketReportsPage() {
  return <MarketReportsListing />;
}