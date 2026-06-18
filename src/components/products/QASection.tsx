'use client';

import { useState, useEffect, useCallback } from 'react';

interface Answer {
  id: string;
  body: string;
  isSeller: boolean;
  helpfulCount: number;
  createdAt: string;
  user: { name: string | null; image: string | null };
}

interface Question {
  id: string;
  body: string;
  createdAt: string;
  user: { name: string | null; image: string | null };
  answers: Answer[];
}

export default function QASection({ productId }: { productId: string }) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [newQuestion, setNewQuestion] = useState('');
  const [answerInputs, setAnswerInputs] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const fetchQuestions = useCallback(async () => {
    try {
      const res = await fetch(`/api/products/${productId}/questions`);
      const data = await res.json();
      setQuestions(data.questions || []);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => { fetchQuestions(); }, [fetchQuestions]);

  const submitQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestion.trim() || submitting) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/products/${productId}/questions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body: newQuestion }),
      });
      if (res.ok) {
        setNewQuestion('');
        fetchQuestions();
      }
    } finally {
      setSubmitting(false);
    }
  };

  const submitAnswer = async (questionId: string) => {
    const body = answerInputs[questionId]?.trim();
    if (!body) return;
    try {
      const res = await fetch(`/api/products/${productId}/questions/${questionId}/answer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body }),
      });
      if (res.ok) {
        setAnswerInputs(prev => ({ ...prev, [questionId]: '' }));
        fetchQuestions();
      }
    } catch {
      // ignore
    }
  };

  const voteAnswer = async (answerId: string) => {
    try {
      await fetch(`/api/answers/${answerId}/vote`, { method: 'POST' });
      fetchQuestions();
    } catch {
      // ignore
    }
  };

  if (loading) return <div className="animate-pulse h-20 bg-gray-100 rounded" />;

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Customer Questions & Answers</h2>

      {/* Ask a question */}
      <form onSubmit={submitQuestion} className="mb-6">
        <div className="flex gap-2">
          <input
            type="text"
            value={newQuestion}
            onChange={e => setNewQuestion(e.target.value)}
            placeholder="Have a question? Ask here..."
            className="flex-1 border rounded px-3 py-2 text-sm"
          />
          <button
            type="submit"
            disabled={submitting}
            className="bg-amazon-yellow px-4 py-2 rounded text-sm font-medium hover:bg-amazon-orange disabled:opacity-50"
          >
            Ask
          </button>
        </div>
      </form>

      {/* Questions list */}
      <div className="space-y-6">
        {questions.length === 0 && (
          <p className="text-gray-500 text-sm">No questions yet. Be the first to ask!</p>
        )}
        {questions.map(q => (
          <div key={q.id} className="border-b pb-4">
            <div className="flex items-start gap-2 mb-2">
              <span className="font-bold text-amazon-dark text-lg">Q:</span>
              <div>
                <p className="text-gray-900">{q.body}</p>
                <p className="text-xs text-gray-500 mt-1">
                  Asked by {q.user.name || 'Customer'} on {new Date(q.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            {/* Answers */}
            <div className="ml-6 space-y-3">
              {q.answers.map(a => (
                <div key={a.id} className="flex items-start gap-2">
                  <span className="font-bold text-amazon-orange">A:</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium">{a.user.name || 'User'}</span>
                      {a.isSeller && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                          ✓ Seller
                        </span>
                      )}
                    </div>
                    <p className="text-gray-700 text-sm">{a.body}</p>
                    <button
                      onClick={() => voteAnswer(a.id)}
                      className="text-xs text-gray-500 hover:text-amazon-orange mt-1"
                    >
                      Helpful ({a.helpfulCount})
                    </button>
                  </div>
                </div>
              ))}

              {/* Answer input */}
              <div className="flex gap-2 mt-2">
                <input
                  type="text"
                  value={answerInputs[q.id] || ''}
                  onChange={e => setAnswerInputs(prev => ({ ...prev, [q.id]: e.target.value }))}
                  placeholder="Add an answer..."
                  className="flex-1 border rounded px-2 py-1 text-sm"
                />
                <button
                  onClick={() => submitAnswer(q.id)}
                  className="text-sm text-amazon-blue hover:text-amazon-orange"
                >
                  Answer
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
