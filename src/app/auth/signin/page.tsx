'use client';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import LoginForm from '@/components/auth/LoginForm';
import Button from '@/components/ui/Button';

export default function SignInPage() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6">
        <h1 className="text-2xl font-bold text-center">Sign In</h1>
        <LoginForm />
        <div className="relative">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-300" /></div>
          <div className="relative flex justify-center text-sm"><span className="bg-white px-2 text-gray-500">Or</span></div>
        </div>
        <Button variant="outline" className="w-full" onClick={() => signIn('google', { callbackUrl: '/' })}>
          Continue with Google
        </Button>
        <p className="text-center text-sm text-gray-600">
          New customer?{' '}
          <Link href="/auth/signup" className="text-[#FF9900] hover:underline">Create your account</Link>
        </p>
      </div>
    </div>
  );
}
