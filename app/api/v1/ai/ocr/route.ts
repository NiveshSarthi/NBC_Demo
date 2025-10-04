import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('document') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'Document file is required' },
        { status: 400 }
      );
    }

    // For now, return mock OCR result since Tesseract.js needs client-side implementation
    // In production, this would process the file server-side or use Google Cloud Vision
    const mockResult = {
      text: "Mock OCR Result: This is a sample document text extracted from the uploaded file. In a real implementation, Tesseract.js would process the image and extract actual text.",
      document_type: "aadhaar_card",
      confidence: 0.85,
      extracted_data: {
        name: "John Doe",
        document_number: "XXXX-XXXX-XXXX",
        date_of_birth: "1990-01-01"
      }
    };

    return NextResponse.json({
      ...mockResult,
      source: 'mock-ocr'
    });

  } catch (error) {
    console.error('OCR API error:', error);
    return NextResponse.json(
      { error: 'Failed to process document' },
      { status: 500 }
    );
  }
}