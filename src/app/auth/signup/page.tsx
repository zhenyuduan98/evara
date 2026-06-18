import Link from 'next/link';
import RegisterForm from '@/components/auth/RegisterForm';

export default function SignUpPage() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6">
        <h1 className="text-2xl font-bold text-center">Create Account</h1>
        <RegisterForm />
        <p className="text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link href="/auth/signin" className="text-[#FF9900] hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
