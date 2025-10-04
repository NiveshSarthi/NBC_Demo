import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

// Configure email transporter (use a service like SendGrid, Mailgun, etc.)
const transporter = nodemailer.createTransporter({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { to, subject, html, type } = body;

    // Send email
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || 'noreply@nextboomcity.com',
      to,
      subject,
      html,
    });

    return NextResponse.json({
      success: true,
      messageId: info.messageId,
    });
  } catch (error) {
    console.error('Email send error:', error);
    return NextResponse.json(
      { error: 'Failed to send notification' },
      { status: 500 }
    );
  }
}