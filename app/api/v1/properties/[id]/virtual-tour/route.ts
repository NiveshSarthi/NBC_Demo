import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const propertyId = parseInt(id);

    const property = await prisma.property.findUnique({
      where: { id: propertyId },
      select: {
        id: true,
        title: true,
        virtual_tour_url: true,
        video_tour_url: true,
      },
    });

    if (!property) {
      return NextResponse.json(
        { error: 'Property not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      propertyId: property.id,
      title: property.title,
      virtualTourUrl: property.virtual_tour_url,
      videoTourUrl: property.video_tour_url,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const propertyId = parseInt(id);
    const body = await req.json();

    const { virtualTourUrl, videoTourUrl } = body;

    // Update property with virtual tour URLs
    const updatedProperty = await prisma.property.update({
      where: { id: propertyId },
      data: {
        virtual_tour_url: virtualTourUrl,
        video_tour_url: videoTourUrl,
      },
      select: {
        id: true,
        title: true,
        virtual_tour_url: true,
        video_tour_url: true,
      },
    });

    return NextResponse.json({
      propertyId: updatedProperty.id,
      virtualTourUrl: updatedProperty.virtual_tour_url,
      videoTourUrl: updatedProperty.video_tour_url,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}