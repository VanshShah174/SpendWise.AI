import { NextRequest, NextResponse } from 'next/server';
import { getSmartFAQAnswer } from '@/app/actions/manageFAQ';

export async function POST(request: NextRequest) {
  try {
    const { question } = await request.json();
    
    if (!question || typeof question !== 'string') {
      return NextResponse.json(
        { error: 'Question is required and must be a string' },
        { status: 400 }
      );
    }

    if (question.length > 500) {
      return NextResponse.json(
        { error: 'Question is too long (max 500 characters)' },
        { status: 400 }
      );
    }

    const answer = await getSmartFAQAnswer(question.trim());
    
    return NextResponse.json({
      question: question.trim(),
      answer,
      cached: true,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('FAQ API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'FAQ API is running',
    endpoints: {
      POST: '/api/faq - Submit a question to get a cached or generated answer'
    },
    status: 'healthy'
  });
}