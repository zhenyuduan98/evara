'use client';

import { useState } from 'react';

export default function ReferralsPage() {
  const [referralCode, setReferralCode] = useState('');
  const [stats, setStats] = useState({ usedCount: 0, totalRewards: 0 });
  const userId = 'demo-user';

  const generateCode = async () => {
    const res = await fetch('/api/referrals/invite', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    });
    const data = await res.json();
    setReferralCode(data.code);
  };

  const loadStats = async () => {
    const res = await fetch(`/api/referrals/stats?userId=${userId}`);
    const data = await res.json();
    setStats(data);
    if (data.code) setReferralCode(data.code);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Referral Program</h1>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Your Referral Link</h2>
        {referralCode ? (
          <div className="bg-gray-50 p-4 rounded flex items-center gap-4">
            <code className="text-lg font-mono font-bold text-blue-600">{referralCode}</code>
            <button
              onClick={() => navigator.clipboard.writeText(`${window.location.origin}/signup?ref=${referralCode}`)}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 text-sm"
            >
              Copy Link
            </button>
          </div>
        ) : (
          <button
            onClick={generateCode}
            className="bg-yellow-500 text-white px-6 py-2 rounded hover:bg-yellow-600"
          >
            Generate Referral Code
          </button>
        )}
      </div>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Your Stats</h2>
        <button onClick={loadStats} className="text-blue-500 underline text-sm mb-4">Refresh</button>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-green-50 p-4 rounded text-center">
            <p className="text-3xl font-bold text-green-600">{stats.usedCount}</p>
            <p className="text-sm text-gray-600">Successful Referrals</p>
          </div>
          <div className="bg-yellow-50 p-4 rounded text-center">
            <p className="text-3xl font-bold text-yellow-600">${stats.totalRewards.toFixed(2)}</p>
            <p className="text-sm text-gray-600">Total Rewards Earned</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">How It Works</h2>
        <ol className="list-decimal list-inside space-y-2 text-gray-700">
          <li>Share your unique referral code with friends</li>
          <li>They sign up using your code</li>
          <li>You both earn $10.00 in rewards!</li>
        </ol>
      </div>
    </div>
  );
}
