import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { generateSmartResponse } from '@/lib/vector/rag-service';
import { createExpenseEmbedding } from '@/lib/vector/embeddings';
import { getConversation, cacheConversation } from '@/lib/cache/redis';
import { detectUserIntent } from '@/lib/chatbot/intent-detector';
import { handleExpenseConversation } from '@/lib/chatbot/expense-conversation';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export async function POST(request: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { message, conversationId } = await request.json();

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // Get conversation history
    const cacheKey = `conversation:${user.id}:${conversationId || 'default'}`;
    const conversationHistory: ChatMessage[] =
      ((await getConversation(cacheKey)) as unknown as ChatMessage[]) || [];

    // Add user message
    const userMessage: ChatMessage = {
      role: 'user',
      content: message,
      timestamp: new Date(),
    };
    conversationHistory.push(userMessage);

    // Detect intent
    const intent = detectUserIntent(message);
    let response: string;
    let expenseAdded: Record<string, unknown> | null = null;

    if (intent.type === 'add_expense' || intent.startConversation) {
      // Handle expense addition flow
      const result = await handleExpenseConversation(
        user.id,
        conversationId || 'default',
        message,
      );

      response = result.response;
      expenseAdded = result.expenseAdded ?? null;

      // Create embedding for new expense
      if (result.expenseAdded) {
        try {
          await createExpenseEmbedding(result.expenseAdded.id as string, result.expenseAdded.text as string, {
            amount: result.expenseAdded.amount,
            category: result.expenseAdded.category,
            userId: user.id,
            date: result.expenseAdded.date,
          });
        } catch (error) {
          console.error('Failed to create embedding:', error);
        }
      }
    } else {
      // Use RAG for intelligent responses
      try {
        const contextPrompt = await generateSmartResponse(message, user.id);

        const completion = await openai.chat.completions.create({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content:
                "You are a smart expense tracking assistant. Use the provided context about the user's expenses to give helpful, personalized responses. Be concise and friendly.",
            },
            {
              role: 'user',
              content: contextPrompt,
            },
          ],
          max_tokens: 300,
          temperature: 0.3,
        });

        response =
          completion.choices[0]?.message?.content ||
          "I'm having trouble understanding. Could you rephrase that?";
      } catch (error) {
        console.error('RAG error:', error);
        response = "I'm having some technical difficulties. Please try again.";
      }
    }

    // Add assistant response
    const assistantMessage: ChatMessage = {
      role: 'assistant',
      content: response,
      timestamp: new Date(),
    };
    conversationHistory.push(assistantMessage);

    // Cache updated conversation
    await cacheConversation(cacheKey, conversationHistory as unknown as Record<string, unknown>[]);

    return NextResponse.json({
      response,
      conversationId: conversationId || 'default',
      timestamp: assistantMessage.timestamp,
      expenseAdded: expenseAdded || null,
    });
  } catch (error) {
    console.error('Enhanced chatbot error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
