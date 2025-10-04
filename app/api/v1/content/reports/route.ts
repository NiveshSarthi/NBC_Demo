import { NextRequest, NextResponse } from 'next/server';
import { MarketReportModel, CreateMarketReportData } from '@/lib/models/market-report';

// GET /api/v1/content/reports - Get paginated market reports
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const type = searchParams.get('type') as any || undefined;
    const category = searchParams.get('category') || undefined;
    const search = searchParams.get('search') || undefined;

    let reports;
    let total;

    if (search) {
      // Search reports
      const result = await MarketReportModel.search(search, page, limit);
      reports = result.reports;
      total = result.total;
    } else {
      // Get paginated reports
      const result = await MarketReportModel.getPublishedReports(page, limit, type, category);
      reports = result.reports;
      total = result.total;
    }

    return NextResponse.json({
      reports,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching market reports:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/v1/content/reports - Create a new market report
export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    const userRole = request.headers.get('x-user-role');

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body: CreateMarketReportData = await request.json();

    // Validate required fields
    if (!body.title || !body.description || !body.type || !body.format || !body.fileUrl || !body.fileSize || !body.authorId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Verify the author is the current user or admin
    if (body.authorId !== parseInt(userId) && userRole !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    // Create the market report
    const report = await MarketReportModel.create(body);

    return NextResponse.json(report, { status: 201 });
  } catch (error) {
    console.error('Error creating market report:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}