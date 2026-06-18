'use client';

export default function PasswordStrength({ password }: { password: string }) {
  const getStrength = (pw: string) => {
    let score = 0;
    if (pw.length >= 8) score++;
    if (pw.length >= 12) score++;
    if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) score++;
    if (/\d/.test(pw)) score++;
    if (/[^a-zA-Z0-9]/.test(pw)) score++;
    return score;
  };

  if (!password) return null;

  const strength = getStrength(password);
  const labels = ['Very Weak', 'Weak', 'Fair', 'Strong', 'Very Strong'];
  const colors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-400', 'bg-green-600'];
  const label = labels[Math.min(strength, 4)];
  const color = colors[Math.min(strength, 4)];

  return (
    <div className="mt-1">
      <div className="flex gap-1 mb-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className={`h-1.5 flex-1 rounded ${i < strength ? color : 'bg-gray-200'}`} />
        ))}
      </div>
      <p className="text-xs text-gray-500">{label}</p>
    </div>
  );
}
