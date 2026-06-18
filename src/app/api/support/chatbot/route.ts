import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const { message } = await req.json();

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Message required' }, { status: 400 });
    }

    const words = message.toLowerCase().split(/\s+/);

    // Find matching FAQs by keyword
    const faqs = await prisma.chatbotFAQ.findMany({ orderBy: { order: 'asc' } });

    let bestMatch: { question: string; answer: string; score: number } | null = null;

    for (const faq of faqs) {
      let score = 0;
      for (const keyword of faq.keywords) {
        if (words.some((w) => w.includes(keyword.toLowerCase()) || keyword.toLowerCase().includes(w))) {
          score++;
        }
      }
      // Also check if question words match
      const qWords = faq.question.toLowerCase().split(/\s+/);
      for (const qw of qWords) {
        if (words.includes(qw) && qw.length > 3) score += 0.5;
      }

      if (score > 0 && (!bestMatch || score > bestMatch.score)) {
        bestMatch = { question: faq.question, answer: faq.answer, score };
      }
    }

    if (bestMatch && bestMatch.score >= 1) {
      return NextResponse.json({
        type: 'answer',
        question: bestMatch.question,
        answer: bestMatch.answer,
        confidence: Math.min(bestMatch.score / 3, 1),
      });
    }

    return NextResponse.json({
      type: 'handoff',
      message: "I couldn't find an answer to your question. Let me connect you with a human agent.",
      suggestTicket: true,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Chatbot error' }, { status: 500 });
  }
}
