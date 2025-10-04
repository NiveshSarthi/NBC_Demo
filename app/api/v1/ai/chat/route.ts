import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { ChatMessage } from '@/lib/models/chat-message';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Simple in-memory storage for conversations (in production, use database)
const conversations = new Map<string, ChatMessage[]>();

export async function POST(request: NextRequest) {
  try {
    const { message, conversationId } = await request.json();

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Generate or use existing conversation ID
    const currentConversationId = conversationId || `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Get conversation history
    const conversationHistory = conversations.get(currentConversationId) || [];

    // Add user message
    const userMessage: ChatMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      role: 'user',
      content: message,
      timestamp: new Date(),
      conversationId: currentConversationId,
    };

    conversationHistory.push(userMessage);

    let responseContent: string;

    // If OpenAI API key is not available, use fallback response
    if (!process.env.OPENAI_API_KEY) {
      console.warn('OpenAI API key not configured, using fallback response');
      responseContent = generateFallbackResponse(message);
    } else {
      // Build conversation context
      const systemPrompt = `You are a real estate AI assistant for NextBoomCity.com.
Help users with property inquiries, investment advice, and booking assistance.
Focus on Indian real estate markets, especially emerging cities and religious tourism hubs.
Be helpful, accurate, and provide specific information when possible.
Keep responses concise but informative.
Provide budget optimization suggestions, legal assistance, and document verification help.`;

      // Prepare messages for OpenAI (convert our format to OpenAI format)
      const openaiMessages = [
        { role: 'system' as const, content: systemPrompt },
        ...conversationHistory.slice(-10).map(msg => ({
          role: msg.role as 'user' | 'assistant',
          content: msg.content
        }))
      ];

      const completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: openaiMessages,
        max_tokens: 500,
        temperature: 0.7,
      });

      responseContent = completion.choices[0]?.message?.content || 'I apologize, but I could not generate a response at this time.';
    }

    // Create assistant message
    const assistantMessage: ChatMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      role: 'assistant',
      content: responseContent,
      timestamp: new Date(),
      conversationId: currentConversationId,
    };

    // Store conversation
    conversationHistory.push(assistantMessage);
    conversations.set(currentConversationId, conversationHistory);

    return NextResponse.json({
      message: assistantMessage,
      conversationId: currentConversationId,
    });

  } catch (error) {
    console.error('Chat API error:', error);

    // Return fallback response on error
    const { message = '', conversationId } = await request.json().catch(() => ({}));
    const currentConversationId = conversationId || `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const fallbackContent = generateFallbackResponse(message);

    const assistantMessage: ChatMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      role: 'assistant',
      content: fallbackContent,
      timestamp: new Date(),
      conversationId: currentConversationId,
    };

    return NextResponse.json({
      message: assistantMessage,
      conversationId: currentConversationId,
      error: 'AI service temporarily unavailable'
    });
  }
}

// Fallback response generator for when OpenAI is not available
function generateFallbackResponse(message: string): string {
  const lowerMessage = message.toLowerCase();

  // Calculator related queries
  if (lowerMessage.includes('emi') || lowerMessage.includes('calculator') || lowerMessage.includes('calculate') || lowerMessage.includes('stamp duty') || lowerMessage.includes('tax') || lowerMessage.includes('eligibility') || lowerMessage.includes('roi') || lowerMessage.includes('return on investment')) {
    return "Our suite of calculators includes EMI calculator, home loan eligibility checker, NRI tax calculator, stamp duty calculator, and ROI calculator. These tools help you understand affordability, tax implications, and potential returns. Which calculator would you like guidance on? I can explain the inputs and help you interpret the results.";
  }

  // Map and location analysis
  if (lowerMessage.includes('map') || lowerMessage.includes('infrastructure') || lowerMessage.includes('price trend') || lowerMessage.includes('growth') || lowerMessage.includes('heatmap') || lowerMessage.includes('connectivity')) {
    return "Our interactive maps provide detailed insights into infrastructure developments, price trends, growth patterns, and connectivity scores. You can explore religious tourism hubs, upcoming metro projects, and market analysis. Which type of map analysis interests you? I can help you navigate our mapping features.";
  }

  // AI features and predictions
  if (lowerMessage.includes('ocr') || lowerMessage.includes('predict') || lowerMessage.includes('recommend') || lowerMessage.includes('score') || lowerMessage.includes('ai ') || lowerMessage.includes('artificial intelligence')) {
    return "Our AI-powered features include OCR for document scanning, price prediction models, personalized property recommendations, investment scoring, infrastructure impact analysis, and religious tourism ROI calculations. Which AI tool would you like to use? I can guide you through the process and explain the results.";
  }

  // User account and saved items
  if (lowerMessage.includes('profile') || lowerMessage.includes('saved') || lowerMessage.includes('viewing') || lowerMessage.includes('dashboard') || lowerMessage.includes('account') || lowerMessage.includes('my ')) {
    return "You can manage your profile settings, view saved properties, schedule property viewings, track your activity, and access dashboard statistics. Is there something specific you'd like to do with your account or saved items? I can help you navigate these features.";
  }

  // Content and forum
  if (lowerMessage.includes('post') || lowerMessage.includes('forum') || lowerMessage.includes('comment') || lowerMessage.includes('blog') || lowerMessage.includes('report') || lowerMessage.includes('market report')) {
    return "Our platform features a community forum for discussions, market reports for insights, and blog posts about real estate trends. You can read expert analysis, share experiences, and get community advice. What type of content are you looking for?";
  }

  // Payment and transactions
  if (lowerMessage.includes('payment') || lowerMessage.includes('pay') || lowerMessage.includes('transaction') || lowerMessage.includes('offer') || lowerMessage.includes('buy')) {
    return "For payments and transactions, we support secure payment processing for property purchases, offer management, and booking confirmations. Our system handles EMI calculations, down payments, and stamp duty payments. Do you need help with a specific transaction or payment process?";
  }

  // Virtual tours and AR
  if (lowerMessage.includes('virtual') || lowerMessage.includes('tour') || lowerMessage.includes('ar') || lowerMessage.includes('augmented reality') || lowerMessage.includes('3d')) {
    return "Many of our properties offer virtual tours and AR viewing experiences. You can explore properties remotely using 3D models, drone footage, and timelapse videos. Which property are you interested in viewing virtually? I can help you find available options.";
  }

  // Budget optimization suggestions
  if (lowerMessage.includes('budget') || lowerMessage.includes('afford') || lowerMessage.includes('finance') || lowerMessage.includes('loan')) {
    return "For budget optimization, consider your down payment (typically 15-20% of property value), EMI calculations, and additional costs like stamp duty (4-6%), registration fees (1%), and maintenance charges. I recommend using our EMI calculator and aiming for properties within 4-5x your annual income. Would you like me to help calculate your affordability or suggest financing options?";
  }

  // Legal assistance
  if (lowerMessage.includes('legal') || lowerMessage.includes('law') || lowerMessage.includes('agreement') || lowerMessage.includes('contract')) {
    return "For legal assistance, it's crucial to verify property ownership through proper title deeds, check for encumbrances, and ensure RERA compliance. Always use registered sale agreements and consult local property lawyers. I can help you understand basic legal requirements and suggest when to seek professional legal counsel.";
  }

  // Document verification help
  if (lowerMessage.includes('document') || lowerMessage.includes('verification') || lowerMessage.includes('papers') || lowerMessage.includes('certificate')) {
    return "Document verification is essential for property transactions. Key documents include: sale deed, title certificate, encumbrance certificate (last 30 years), RERA approval, building plan approval, occupancy certificate, and tax receipts. I can guide you through the verification process and help identify red flags in property documents.";
  }

  // Price and cost related
  if (lowerMessage.includes('price') || lowerMessage.includes('cost')) {
    return "Property prices vary by location, size, and amenities. Current ranges in Delhi NCR: 1BHK (₹25-40 lakhs), 2BHK (₹40-80 lakhs), 3BHK (₹70 lakhs-2 crores). Use our AI price predictor for accurate estimates. Consider future appreciation and rental yields for investment decisions.";
  }

  // Location and area queries
  if (lowerMessage.includes('location') || lowerMessage.includes('area') || lowerMessage.includes('city')) {
    return "NextBoomCity.com covers emerging Indian cities including Noida, Gurgaon, Faridabad, Ghaziabad, and religious tourism hubs. Each location offers unique growth potential with upcoming metro lines, expressways, and commercial developments. Which city interests you most?";
  }

  // Investment and ROI
  if (lowerMessage.includes('investment') || lowerMessage.includes('roi') || lowerMessage.includes('return')) {
    return "For investment analysis, evaluate location growth, rental yield (typically 2-4% in Delhi NCR), and infrastructure impact. Our AI investment scorer considers multiple parameters. Religious tourism properties often show stable returns due to consistent pilgrim demand. Consider long-term appreciation potential.";
  }

  // Religious tourism properties
  if (lowerMessage.includes('religious') || lowerMessage.includes('temple') || lowerMessage.includes('pilgrim')) {
    return "Religious tourism properties offer stable investments due to consistent demand from pilgrims. Locations near major religious sites often show 70-90% occupancy rates. Key factors: distance to religious sites, festival calendars, transportation access, and amenities for pilgrims. Our AI can help evaluate religious tourism investment opportunities.";
  }

  // Booking and inquiry
  if (lowerMessage.includes('book') || lowerMessage.includes('inquiry') || lowerMessage.includes('contact') || lowerMessage.includes('visit')) {
    return "I'd be happy to help schedule a property visit or connect you with owners. You can submit an inquiry through our platform, and our team will arrange site visits. For immediate assistance, provide the property ID or location. Virtual tours are also available for many properties.";
  }

  // Property queries
  if (lowerMessage.includes('property') || lowerMessage.includes('apartment') || lowerMessage.includes('flat') || lowerMessage.includes('home')) {
    return "I can help you find the perfect property! Whether you're looking to buy, invest, or rent, I can provide recommendations based on your budget, location preferences, and requirements. I specialize in Delhi NCR properties and can help with everything from initial search to final paperwork. What type of property are you interested in?";
  }

  // Greetings and general help
  if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('help')) {
    return "Hello! I'm your AI Property Assistant at NextBoomCity. I specialize in Indian real estate with expertise in budget optimization, legal guidance, document verification, investment analysis, and property recommendations. I can help with emerging cities and religious tourism properties. What specific assistance do you need today?";
  }

  // Default response - more contextual
  return "I understand you're asking about real estate. While our full AI capabilities are currently limited, I can still help with property searches, calculator tools, map analysis, legal guidance, and general advice. Could you please provide more details about your specific question or what you're looking for in Indian real estate?";
}