'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { ArrowLeft, Download, FileText, Eye, Calendar, TrendingUp } from 'lucide-react';

interface MarketReport {
  _id: string;
  title: string;
  slug: string;
  description: string;
  type: string;
  format: string;
  fileUrl: string;
  fileSize: number;
  thumbnailUrl?: string;
  categories: string[];
  tags: string[];
  publishedAt?: string;
  downloadCount: number;
  viewCount: number;
  seo?: {
    title?: string;
    description?: string;
    keywords?: string[];
  };
}

interface MarketReportDetailProps {
  reportId: string;
}

const reportTypes = {
  quarterly: 'Quarterly Report',
  monthly: 'Monthly Report',
  city_analysis: 'City Analysis',
  sector_analysis: 'Sector Analysis',
  investment_guide: 'Investment Guide',
};

export function MarketReportDetail({ reportId }: MarketReportDetailProps) {
  const [report, setReport] = useState<MarketReport | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchReport();
  }, [reportId]);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/v1/content/reports/${reportId}`);
      if (!response.ok) {
        throw new Error('Report not found');
      }
      const data = await response.json();
      setReport(data);
    } catch (error) {
      console.error('Error fetching report:', error);

      // Fallback to sample data for demo
      const sampleReports = [
        {
          _id: 'sample-1',
          title: 'Q4 2024 Mumbai Real Estate Market Report',
          slug: 'q4-2024-mumbai-real-estate-market-report',
          description: 'Comprehensive analysis of Mumbai real estate market performance in Q4 2024, including price trends, new launches, and investment opportunities. This detailed report covers residential, commercial, and industrial sectors with market forecasts for 2025.',
          type: 'quarterly',
          format: 'pdf',
          fileUrl: '#',
          fileSize: 2500000,
          thumbnailUrl: '',
          categories: ['mumbai', 'residential', '2024'],
          tags: ['mumbai', 'market-report', 'q4-2024', 'residential', 'commercial'],
          publishedAt: new Date().toISOString(),
          downloadCount: 125,
          viewCount: 450
        },
        {
          _id: 'sample-2',
          title: 'Delhi-NCR Residential Price Trends 2024',
          slug: 'delhi-ncr-residential-price-trends-2024',
          description: 'Detailed price trend analysis for residential properties across Delhi-NCR region with forecasts for 2024-2025. Includes data on Gurgaon, Noida, and Delhi suburbs with investment recommendations.',
          type: 'monthly',
          format: 'excel',
          fileUrl: '#',
          fileSize: 1800000,
          thumbnailUrl: '',
          categories: ['delhi', 'residential', 'price-trends'],
          tags: ['delhi', 'price-trends', 'residential', 'forecast', '2024'],
          publishedAt: new Date().toISOString(),
          downloadCount: 89,
          viewCount: 320
        },
        {
          _id: 'sample-3',
          title: 'Hyderabad Investment Guide 2024',
          slug: 'hyderabad-investment-guide-2024',
          description: 'Complete investment guide for Hyderabad covering pharma, IT, infrastructure developments and market opportunities. Analysis of HITEC City, Gachibowli, and upcoming projects.',
          type: 'investment_guide',
          format: 'pdf',
          fileUrl: '#',
          fileSize: 3200000,
          thumbnailUrl: '',
          categories: ['hyderabad', 'investment-guide', '2024'],
          tags: ['hyderabad', 'investment', 'guide', 'pharma', 'it'],
          publishedAt: new Date().toISOString(),
          downloadCount: 156,
          viewCount: 580
        },
        {
          _id: 'sample-4',
          title: 'Goa Tourism Real Estate Report',
          slug: 'goa-tourism-real-estate-report',
          description: 'Analysis of tourism-driven real estate market in Goa with rental yield projections and development updates. Covers North Goa, South Goa, and emerging beachfront opportunities.',
          type: 'sector_analysis',
          format: 'pdf',
          fileUrl: '#',
          fileSize: 2100000,
          thumbnailUrl: '',
          categories: ['goa', 'tourism', 'rental'],
          tags: ['goa', 'tourism', 'rental', 'beach', 'yield'],
          publishedAt: new Date().toISOString(),
          downloadCount: 78,
          viewCount: 245
        }
      ];

      const sampleReport = sampleReports.find(r => r._id === reportId);
      if (sampleReport) {
        setReport(sampleReport);
      } else {
        router.push('/market-reports');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!report) return;

    try {
      // Increment download count
      await fetch(`/api/v1/content/reports/${report._id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ downloadCount: report.downloadCount + 1 }),
      });

      // Trigger download
      window.open(report.fileUrl, '_blank');
    } catch (error) {
      console.error('Error downloading report:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center min-h-[400px]">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Report not found</h1>
          <Link href="/market-reports">
            <Button>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Reports
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back button */}
      <div className="mb-6">
        <Link href="/market-reports">
          <Button variant="ghost">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Market Reports
          </Button>
        </Link>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main content */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <FileText className="h-6 w-6 text-blue-600" />
                <Badge variant="secondary">
                  {reportTypes[report.type as keyof typeof reportTypes] || report.type}
                </Badge>
                <Badge variant="outline">
                  {report.format.toUpperCase()}
                </Badge>
              </div>
              <CardTitle className="text-3xl">{report.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 text-lg mb-6">{report.description}</p>

              {/* Report stats */}
              <div className="grid grid-cols-3 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-gray-600 mb-1">
                    <Eye className="h-4 w-4" />
                    <span className="text-sm">Views</span>
                  </div>
                  <div className="text-2xl font-bold">{report.viewCount}</div>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-gray-600 mb-1">
                    <Download className="h-4 w-4" />
                    <span className="text-sm">Downloads</span>
                  </div>
                  <div className="text-2xl font-bold">{report.downloadCount}</div>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-gray-600 mb-1">
                    <FileText className="h-4 w-4" />
                    <span className="text-sm">Size</span>
                  </div>
                  <div className="text-lg font-semibold">{formatFileSize(report.fileSize)}</div>
                </div>
              </div>

              {/* Categories and tags */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Categories</h3>
                  <div className="flex flex-wrap gap-2">
                    {report.categories.map((category) => (
                      <Badge key={category} variant="secondary">
                        {category}
                      </Badge>
                    ))}
                  </div>
                </div>

                {report.tags.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Tags</h3>
                    <div className="flex flex-wrap gap-2">
                      {report.tags.map((tag) => (
                        <Badge key={tag} variant="outline">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Download card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Download Report
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Published:</span>
                  <span>{report.publishedAt ? formatDate(report.publishedAt) : 'Not published'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Format:</span>
                  <span>{report.format.toUpperCase()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Size:</span>
                  <span>{formatFileSize(report.fileSize)}</span>
                </div>
              </div>

              <Button
                onClick={handleDownload}
                className="w-full"
                size="lg"
              >
                <Download className="mr-2 h-5 w-5" />
                Download Now
              </Button>

              <p className="text-xs text-gray-500 text-center">
                Free download • No registration required
              </p>
            </CardContent>
          </Card>

          {/* Related reports placeholder */}
          <Card>
            <CardHeader>
              <CardTitle>Related Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500 text-sm">
                More reports in {report.type} category will be shown here.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}