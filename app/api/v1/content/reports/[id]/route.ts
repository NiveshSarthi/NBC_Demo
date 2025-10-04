import { NextRequest, NextResponse } from 'next/server';
import { MarketReportModel, UpdateMarketReportData } from '@/lib/models/market-report';

// GET /api/v1/content/reports/[id] - Get individual market report
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;

    const report = await MarketReportModel.findById(id);

    if (!report) {
      return NextResponse.json(
        { error: 'Report not found' },
        { status: 404 }
      );
    }

    // Increment view count
    await MarketReportModel.incrementViewCount(id);

    return NextResponse.json(report);
  } catch (error) {
    console.error('Error fetching market report:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/v1/content/reports/[id] - Update market report
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = request.headers.get('x-user-id');
    const userRole = request.headers.get('x-user-role');

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const id = params.id;
    const report = await MarketReportModel.findById(id);

    if (!report) {
      return NextResponse.json(
        { error: 'Report not found' },
        { status: 404 }
      );
    }

    // Check if user can update this report (owner or admin)
    if (report.authorId !== parseInt(userId) && userRole !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    const body: UpdateMarketReportData = await request.json();
    const updatedReport = await MarketReportModel.update(id, body);

    if (!updatedReport) {
      return NextResponse.json(
        { error: 'Failed to update report' },
        { status: 500 }
      );
    }

    return NextResponse.json(updatedReport);
  } catch (error) {
    console.error('Error updating market report:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/v1/content/reports/[id] - Delete market report
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = request.headers.get('x-user-id');
    const userRole = request.headers.get('x-user-role');

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const id = params.id;
    const report = await MarketReportModel.findById(id);

    if (!report) {
      return NextResponse.json(
        { error: 'Report not found' },
        { status: 404 }
      );
    }

    // Check if user can delete this report (owner or admin)
    if (report.authorId !== parseInt(userId) && userRole !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    const deleted = await MarketReportModel.delete(id);

    if (!deleted) {
      return NextResponse.json(
        { error: 'Failed to delete report' },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: 'Report deleted successfully' });
  } catch (error) {
    console.error('Error deleting market report:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}