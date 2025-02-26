import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '@/context/auth';
import toast from 'react-hot-toast';

export function LoginForm() {

  const [showPassword, setShowPassword] = React.useState(false);

  const onSubmit = (data: any) => {
    // Handle sign-in logic
    console.log(data);
  };

  const { login, user } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter()

  const submitLogin = async (e: React.FormEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if(email == '' || password == ''){
      toast.error('Email and password are required');
      return;
    }

    // email = admin@gmail.com, password = admin
    if(email === 'admin@gmail.com' && password === 'admin'){
      login({_id: '1', fullName: 'Admin', email: 'admin@gmail.com'});
      return;
    }else{
      toast.error('Invalid email or password');
    }
  };

  useEffect(() => {
    if(user){
      router.push('/overview');
    }
  }, [user]);

  return (
    <div className="space-y-10">
      {/* Header Section */}
      <div className="space-y-2">
        <h4 className="text-2xl font-semibold">Sign in</h4>
        <p className="text-sm text-gray-600">
          Don&apos;t have an account?{' '}
          <Link
            href="/auth/sign-up"
            className="text-blue-500 hover:underline"
          >
            Sign up
          </Link>
        </p>
      </div>

      {/* Form Section */}
      <div className="space-y-4">

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Email address
          </label>
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={`mt-1 block w-full rounded-md border p-2 text-sm `}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`mt-1 block w-full rounded-md border p-2 text-sm `}
            />
            <div
              className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer"
              onClick={() => setShowPassword((prev) => !prev)}
            >
              {showPassword ? (
                <span className="text-gray-500">👁</span> // Replace with an EyeIcon
              ) : (
                <span className="text-gray-500">🙈</span> // Replace with an EyeSlashIcon
              )}
            </div>
          </div>
        </div>
        {/* Forgot Password Link */}
        <div>
          <Link
            href="#"
            className="text-sm text-blue-500 hover:underline"
          >
            Forgot password?
          </Link>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className={`w-full rounded-md bg-blue-500 px-4 py-2 text-white`}
          onClick={submitLogin}
        >
          Sign in
        </button>
    </div>
  </div>
  );
}
