import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { message, context = [] } = await request.json();

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // If OpenAI API key is not available, return fallback response
    if (!process.env.OPENAI_API_KEY) {
      console.warn('OpenAI API key not configured, using fallback response');
      return NextResponse.json({
        response: generateFallbackResponse(message),
        source: 'fallback'
      });
    }

    // Build conversation context
    const systemPrompt = `You are a real estate AI assistant for NextBoomCity.com.
Help users with property inquiries, investment advice, and booking assistance.
Focus on Indian real estate markets, especially emerging cities and religious tourism hubs.
Be helpful, accurate, and provide specific information when possible.
Keep responses concise but informative.`;

    // Prepare messages for OpenAI
    const messages = [
      { role: 'system' as const, content: systemPrompt },
      ...context.slice(-10), // Keep last 10 messages for context
      { role: 'user' as const, content: message }
    ];

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo', // Using GPT-3.5 for cost effectiveness
      messages: messages,
      max_tokens: 500,
      temperature: 0.7,
    });

    const response = completion.choices[0]?.message?.content || 'I apologize, but I could not generate a response at this time.';

    return NextResponse.json({
      response: response,
      source: 'openai'
    });

  } catch (error) {
    console.error('Chat API error:', error);

    // Return fallback response on error
    const { message = '' } = await request.json().catch(() => ({}));

    return NextResponse.json({
      response: generateFallbackResponse(message),
      source: 'fallback',
      error: 'AI service temporarily unavailable'
    });
  }
}

// Fallback response generator for when OpenAI is not available
function generateFallbackResponse(message: string): string {
  const lowerMessage = message.toLowerCase();

  // Simple rule-based responses
  if (lowerMessage.includes('price') || lowerMessage.includes('cost') || lowerMessage.includes('budget')) {
    return "I can help you understand property prices in various Indian cities. Property prices vary significantly based on location, size, and amenities. For example, properties in Delhi NCR typically range from ₹50 lakhs to ₹5 crores depending on the area and property type. Would you like me to check specific price ranges for a particular city or property type?";
  }

  if (lowerMessage.includes('location') || lowerMessage.includes('area') || lowerMessage.includes('city')) {
    return "NextBoomCity.com covers major emerging cities across India including Noida, Gurgaon, Faridabad, Ghaziabad, and religious tourism hubs. Each location has unique growth potential and infrastructure developments. Which city are you interested in, and what type of property are you looking for?";
  }

  if (lowerMessage.includes('investment') || lowerMessage.includes('roi') || lowerMessage.includes('return')) {
    return "For investment analysis, consider factors like location growth, rental yield, and infrastructure impact. Our AI investment scorer can help evaluate properties based on multiple parameters. Religious tourism properties often show strong ROI due to consistent pilgrim footfall. Would you like me to analyze a specific property for investment potential?";
  }

  if (lowerMessage.includes('religious') || lowerMessage.includes('temple') || lowerMessage.includes('pilgrim')) {
    return "Religious tourism properties can be excellent investments due to consistent demand from pilgrims. Locations near major temples, mosques, gurudwaras, or churches often show stable occupancy rates throughout the year. Factors like distance to religious sites, festival calendars, and infrastructure development significantly impact ROI. I can help you evaluate religious tourism investment opportunities.";
  }

  if (lowerMessage.includes('book') || lowerMessage.includes('inquiry') || lowerMessage.includes('contact')) {
    return "I'd be happy to help you get in touch with property owners or schedule a site visit. You can submit an inquiry through our platform, and our team will connect you with the right people. For immediate assistance, please provide the property ID or location you're interested in.";
  }

  if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('help')) {
    return "Hello! I'm the NextBoomCity AI assistant. I can help you with property searches, price estimates, investment analysis, and booking assistance. I specialize in Indian real estate markets, particularly emerging cities and religious tourism destinations. What are you looking for today?";
  }

  // Default response
  return "Thank you for your question about real estate in India. I can assist you with property recommendations, price predictions, investment analysis, and booking support. Could you please provide more details about what you're looking for? For example, are you interested in buying, investing, or just gathering information about a specific location?";
}