'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import PasswordStrength from '@/components/ui/PasswordStrength';

export default function SecurityPage() {
  const { data: session } = useSession();
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [accounts, setAccounts] = useState<{ provider: string; providerAccountId: string }[]>([]);

  useEffect(() => {
    fetch('/api/account/connected-accounts')
      .then((r) => r.json())
      .then((d) => setAccounts(d.accounts || []))
      .catch(() => {});
  }, []);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setError('');
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/account/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ oldPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to change password');
      } else {
        setMessage('Password changed successfully');
        setShowPasswordForm(false);
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch {
      setError('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const providerIcon: Record<string, string> = {
    google: '🔵',
    github: '⚫',
    credentials: '🔑',
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Login &amp; Security</h2>

      {message && <div className="bg-green-50 border border-green-200 text-green-700 p-3 rounded mb-4">{message}</div>}
      {error && <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded mb-4">{error}</div>}

      <div className="space-y-4 max-w-lg">
        {/* Password Section */}
        <div className="border rounded-lg p-4">
          <div className="flex justify-between items-center">
            <div>
              <p className="font-medium">Password</p>
              <p className="text-sm text-gray-500">Manage your password</p>
            </div>
            <button
              onClick={() => setShowPasswordForm(!showPasswordForm)}
              className="text-sm text-blue-600 hover:underline"
            >
              {showPasswordForm ? 'Cancel' : 'Change'}
            </button>
          </div>

          {showPasswordForm && (
            <form onSubmit={handleChangePassword} className="mt-4 space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">Current Password</label>
                <input
                  type="password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  required
                  className="w-full border rounded px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  className="w-full border rounded px-3 py-2 text-sm"
                />
                <PasswordStrength password={newPassword} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Confirm New Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full border rounded px-3 py-2 text-sm"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="bg-yellow-400 hover:bg-yellow-500 text-black font-semibold px-6 py-2 rounded text-sm disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Save Password'}
              </button>
            </form>
          )}
        </div>

        {/* Two-Factor */}
        <div className="border rounded-lg p-4 flex justify-between items-center">
          <div>
            <p className="font-medium">Two-Factor Authentication</p>
            <p className="text-sm text-gray-500">Not enabled</p>
          </div>
          <button className="text-sm text-blue-600 hover:underline">Enable</button>
        </div>

        {/* Connected Accounts */}
        <div className="border rounded-lg p-4">
          <p className="font-medium mb-3">Connected Accounts</p>
          {accounts.length === 0 ? (
            <p className="text-sm text-gray-500">No connected OAuth accounts</p>
          ) : (
            <div className="space-y-2">
              {accounts.map((acc) => (
                <div key={acc.provider + acc.providerAccountId} className="flex items-center gap-2 text-sm">
                  <span>{providerIcon[acc.provider] || '🔗'}</span>
                  <span className="capitalize font-medium">{acc.provider}</span>
                  <span className="text-gray-400">Connected</span>
                </div>
              ))}
            </div>
          )}
          <div className="mt-3 text-sm text-gray-500">
            Sign in with Google or GitHub to link your account.
          </div>
        </div>
      </div>
    </div>
  );
}
