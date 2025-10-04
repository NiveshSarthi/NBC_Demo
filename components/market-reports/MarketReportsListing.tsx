'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Download, FileText, Eye, Calendar } from 'lucide-react';

interface MarketReport {
  _id: string;
  title: string;
  slug: string;
  description: string;
  type: string;
  format: string;
  fileUrl: string;
  thumbnailUrl?: string;
  categories: string[];
  tags: string[];
  publishedAt?: string;
  downloadCount: number;
  viewCount: number;
}

interface ReportsResponse {
  reports: MarketReport[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

const reportTypes = [
  { value: 'quarterly', label: 'Quarterly Reports' },
  { value: 'monthly', label: 'Monthly Reports' },
  { value: 'city_analysis', label: 'City Analysis' },
  { value: 'sector_analysis', label: 'Sector Analysis' },
  { value: 'investment_guide', label: 'Investment Guides' },
];

export function MarketReportsListing() {
  const [reports, setReports] = useState<MarketReport[]>([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 12, total: 0, pages: 0 });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  const fetchReports = async (page = 1, search = '', type = '', category = '') => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '12',
        ...(search && { search }),
        ...(type && { type }),
        ...(category && { category }),
      });

      const response = await fetch(`/api/v1/content/reports?${params}`);
      const data: ReportsResponse = await response.json();

      setReports(data.reports);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Error fetching reports:', error);
      // Fallback to sample data when database is not available
      const sampleReports: MarketReport[] = [
        {
          _id: 'sample-1',
          title: 'Q4 2024 Mumbai Real Estate Market Report',
          slug: 'q4-2024-mumbai-real-estate-market-report',
          description: 'Comprehensive analysis of Mumbai real estate market performance in Q4 2024, including price trends, new launches, and investment opportunities.',
          type: 'quarterly',
          format: 'pdf',
          fileUrl: '#',
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
          description: 'Detailed price trend analysis for residential properties across Delhi-NCR region with forecasts for 2024-2025.',
          type: 'monthly',
          format: 'excel',
          fileUrl: '#',
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
          description: 'Complete investment guide for Hyderabad covering pharma, IT, infrastructure developments and market opportunities.',
          type: 'investment_guide',
          format: 'pdf',
          fileUrl: '#',
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
           description: 'Analysis of tourism-driven real estate market in Goa with rental yield projections and development updates.',
           type: 'sector_analysis',
           format: 'pdf',
           fileUrl: '#',
           thumbnailUrl: '',
           categories: ['goa', 'tourism', 'rental'],
           tags: ['goa', 'tourism', 'rental', 'beach', 'yield'],
           publishedAt: new Date('2024-11-15T10:00:00Z').toISOString(),
           downloadCount: 78,
           viewCount: 245
         },
         {
           _id: 'sample-5',
           title: 'Faridabad NCR Development Master Plan 2024-2030',
           slug: 'faridabad-ncr-development-master-plan-2024-2030',
           description: 'Comprehensive master plan analysis for Faridabad NCR development including infrastructure projects, population growth forecasts, and investment opportunities.',
           type: 'city_analysis',
           format: 'pdf',
           fileUrl: '#',
           thumbnailUrl: '',
           categories: ['faridabad', 'infrastructure', 'master-plan'],
           tags: ['faridabad', 'ncr', 'infrastructure', 'development', '2030'],
           publishedAt: new Date('2024-11-08T10:00:00Z').toISOString(),
           downloadCount: 203,
           viewCount: 567
         },
         {
           _id: 'sample-6',
           title: 'Dholera Smart City Investment Opportunities',
           slug: 'dholera-smart-city-investment-opportunities',
           description: 'Detailed investment analysis for Dholera Smart City covering land acquisition costs, development timelines, and projected returns for institutional investors.',
           type: 'investment_guide',
           format: 'pdf',
           fileUrl: '#',
           thumbnailUrl: '',
           categories: ['dholera', 'investment-guide', 'smart-city'],
           tags: ['dholera', 'smart-city', 'investment', 'land', 'development'],
           publishedAt: new Date('2024-11-01T10:00:00Z').toISOString(),
           downloadCount: 167,
           viewCount: 423
         },
         {
           _id: 'sample-7',
           title: 'Religious Tourism Circuit Analysis: Mathura-Vrindavan-Ayodhya',
           slug: 'religious-tourism-circuit-analysis-mathura-vrindavan-ayodhya',
           description: 'Market analysis of the religious tourism circuit connecting Mathura, Vrindavan, and Ayodhya with accommodation, transportation, and economic impact assessment.',
           type: 'sector_analysis',
           format: 'excel',
           fileUrl: '#',
           thumbnailUrl: '',
           categories: ['vrindavan', 'ayodhya', 'religious-tourism'],
           tags: ['religious-tourism', 'mathura', 'vrindavan', 'ayodhya', 'pilgrimage'],
           publishedAt: new Date('2024-10-25T10:00:00Z').toISOString(),
           downloadCount: 134,
           viewCount: 389
         },
         {
           _id: 'sample-8',
           title: 'Commercial Real Estate Trends Q4 2024',
           slug: 'commercial-real-estate-trends-q4-2024',
           description: 'Quarterly analysis of commercial real estate trends across major Indian cities including office space absorption, rental rates, and development pipeline.',
           type: 'quarterly',
           format: 'pdf',
           fileUrl: '#',
           thumbnailUrl: '',
           categories: ['commercial', 'office-space', '2024'],
           tags: ['commercial', 'office', 'rental', 'absorption', 'q4-2024'],
           publishedAt: new Date('2024-10-16T10:00:00Z').toISOString(),
           downloadCount: 289,
           viewCount: 654
         },
         {
           _id: 'sample-9',
           title: 'Pharma & IT Corridor Investment Guide',
           slug: 'pharma-it-corridor-investment-guide',
           description: 'Comprehensive guide to investment opportunities in Hyderabad and Pune pharma and IT corridors with company profiles, land rates, and ROI projections.',
           type: 'investment_guide',
           format: 'pdf',
           fileUrl: '#',
           thumbnailUrl: '',
           categories: ['hyderabad', 'pune', 'pharma-it'],
           tags: ['hyderabad', 'pune', 'pharma', 'it', 'corridor', 'investment'],
           publishedAt: new Date('2024-10-01T10:00:00Z').toISOString(),
           downloadCount: 198,
           viewCount: 521
         },
         {
           _id: 'sample-10',
           title: 'Beachfront Property Market Analysis',
           slug: 'beachfront-property-market-analysis',
           description: 'Analysis of beachfront property markets in Goa, Maharashtra, and Kerala with price trends, regulatory frameworks, and environmental considerations.',
           type: 'sector_analysis',
           format: 'pdf',
           fileUrl: '#',
           thumbnailUrl: '',
           categories: ['goa', 'beachfront', 'coastal'],
           tags: ['beachfront', 'coastal', 'goa', 'maharashtra', 'kerala', 'regulatory'],
           publishedAt: new Date('2024-09-16T10:00:00Z').toISOString(),
           downloadCount: 156,
           viewCount: 378
         },
         {
           _id: 'sample-11',
           title: 'Monthly Residential Price Index - November 2024',
           slug: 'monthly-residential-price-index-november-2024',
           description: 'Monthly residential price index data for 50+ Indian cities with price changes, inventory levels, and market momentum indicators.',
           type: 'monthly',
           format: 'excel',
           fileUrl: '#',
           thumbnailUrl: '',
           categories: ['residential', 'price-index', '2024'],
           tags: ['residential', 'price-index', 'monthly', 'november-2024', 'inventory'],
           publishedAt: new Date('2024-09-01T10:00:00Z').toISOString(),
           downloadCount: 342,
           viewCount: 789
         },
         {
           _id: 'sample-12',
           title: 'Industrial Parks & SEZ Investment Report',
           slug: 'industrial-parks-sez-investment-report',
           description: 'Comprehensive analysis of industrial parks and Special Economic Zones across India with occupancy rates, rental yields, and sector-specific opportunities.',
           type: 'sector_analysis',
           format: 'pdf',
           fileUrl: '#',
           thumbnailUrl: '',
           categories: ['industrial', 'sez', 'manufacturing'],
           tags: ['industrial-parks', 'sez', 'manufacturing', 'logistics', 'occupancy'],
           publishedAt: new Date('2024-08-16T10:00:00Z').toISOString(),
           downloadCount: 223,
           viewCount: 445
         }
      ];

      setReports(sampleReports);
      setPagination({ page: 1, limit: 12, total: sampleReports.length, pages: Math.ceil(sampleReports.length / 12) });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleSearch = () => {
    fetchReports(1, searchQuery, selectedType, selectedCategory);
  };

  const handleTypeChange = (type: string) => {
    setSelectedType(type);
    fetchReports(1, searchQuery, type, selectedCategory);
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    fetchReports(1, searchQuery, selectedType, category);
  };

  const handleDownload = async (report: MarketReport) => {
    try {
      // Increment download count
      await fetch(`/api/v1/content/reports/${report._id}`, {
        method: 'PATCH',
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
      month: 'short',
      day: 'numeric',
    });
  };

  const getTypeLabel = (type: string) => {
    const typeInfo = reportTypes.find(t => t.value === type);
    return typeInfo ? typeInfo.label : type;
  };

  if (loading && reports.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center min-h-[400px]">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">Market Reports</h1>
        <p className="text-lg text-gray-600">
          Access comprehensive market analysis and investment reports for India's emerging cities
        </p>
      </div>

      {/* Filters */}
      <div className="mb-8 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <Input
            placeholder="Search reports..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1"
          />
          <Button onClick={handleSearch}>Search</Button>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <Select value={selectedType} onValueChange={handleTypeChange}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {reportTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedCategory} onValueChange={handleCategoryChange}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="delhi">Delhi</SelectItem>
              <SelectItem value="mumbai">Mumbai</SelectItem>
              <SelectItem value="bangalore">Bangalore</SelectItem>
              <SelectItem value="hyderabad">Hyderabad</SelectItem>
              <SelectItem value="chennai">Chennai</SelectItem>
              <SelectItem value="pune">Pune</SelectItem>
              <SelectItem value="faridabad">Faridabad</SelectItem>
              <SelectItem value="dholera">Dholera</SelectItem>
              <SelectItem value="vrindavan">Vrindavan</SelectItem>
              <SelectItem value="ayodhya">Ayodhya</SelectItem>
              <SelectItem value="goa">Goa</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Reports Grid */}
      {reports.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No reports found matching your criteria.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {reports.map((report) => (
            <Card key={report._id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="h-5 w-5 text-blue-600" />
                  <Badge variant="secondary" className="text-xs">
                    {getTypeLabel(report.type)}
                  </Badge>
                </div>
                <CardTitle className="text-lg overflow-hidden">
                  <Link href={`/market-reports/${report._id}`} className="hover:text-blue-600 block truncate">
                    {report.title}
                  </Link>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-sm mb-4 overflow-hidden" style={{ display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' }}>
                  {report.description}
                </p>

                <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {report.publishedAt ? formatDate(report.publishedAt) : 'Not published'}
                  </div>
                  <div className="flex items-center gap-1">
                    <Eye className="h-4 w-4" />
                    {report.viewCount}
                  </div>
                  <div className="flex items-center gap-1">
                    <Download className="h-4 w-4" />
                    {report.downloadCount}
                  </div>
                </div>

                <div className="flex flex-wrap gap-1 mb-4">
                  {report.categories.slice(0, 3).map((category) => (
                    <Badge key={category} variant="outline" className="text-xs">
                      {category}
                    </Badge>
                  ))}
                </div>

                <Button
                  onClick={() => handleDownload(report)}
                  className="w-full"
                  variant="outline"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download {report.format.toUpperCase()}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="mt-8 flex justify-center">
          <div className="flex gap-2">
            {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((page) => (
              <Button
                key={page}
                variant={page === pagination.page ? 'default' : 'outline'}
                size="sm"
                onClick={() => fetchReports(page, searchQuery, selectedType, selectedCategory)}
              >
                {page}
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}