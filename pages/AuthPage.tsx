import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { useNavigate } from 'react-router-dom';
import { isValidEmail } from '../lib/validation';

const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, signup } = useApp();
  const navigate = useNavigate();

  const validateEmail = (emailValue: string) => {
    if (!emailValue) {
      setEmailError('');
      return false;
    }
    if (!isValidEmail(emailValue)) {
      setEmailError('Please enter a valid email address');
      return false;
    }
    setEmailError('');
    return true;
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const emailValue = e.target.value;
    setEmail(emailValue);
    // Clear errors when user starts typing (but don't validate yet)
    setError('');
    // Only clear email error if it exists - validation will happen on blur
    if (emailError && emailValue) {
      setEmailError('');
    }
  };

  const handleEmailBlur = () => {
    // Only validate when user leaves the field
    if (email) {
      validateEmail(email);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setEmailError('');

    // Client-side validation
    if (!email) {
      setEmailError('Email is required');
      return;
    }

    if (!password) {
      setError('Password is required');
      return;
    }

    if (!validateEmail(email)) {
      return;
    }

    setLoading(true);
    try {
      if (isLogin) {
        await login({ email, password });
      } else {
        await signup({ email, password });
      }
      // Successful login/signup will trigger a session update, and the App/ProtectedRoute logic will handle navigation.
      // We can navigate manually as a fallback.
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'An error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 px-4">
      <div className="max-w-md w-full space-y-8 bg-slate-800 p-8 rounded-lg shadow-lg">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
            {isLogin ? 'Sign in to your account' : 'Create a new account'}
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={ handleSubmit }>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email-address" className="sr-only">Email address</label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className={`appearance-none rounded-none relative block w-full px-3 py-2 border transition-colors duration-200 ${
                  emailError ? 'border-red-500' : 'border-slate-600'
                } bg-slate-700 text-white placeholder-slate-400 focus:outline-none focus:ring-violet-500 focus:border-violet-500 focus:z-10 sm:text-sm rounded-t-md`}
                placeholder="Email address"
                value={email}
                onChange={handleEmailChange}
                onBlur={handleEmailBlur}
              />
              <div
                className={`overflow-hidden transition-all duration-300 ease-in-out ${
                  emailError ? 'max-h-20 opacity-100 mt-1' : 'max-h-0 opacity-0 mt-0'
                }`}
              >
                {emailError && (
                  <p className="text-red-500 text-xs px-3">{emailError}</p>
                )}
              </div>
            </div>
            <div>
              <label htmlFor="password" className="sr-only">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete={isLogin ? "current-password" : "new-password"}
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-slate-600 bg-slate-700 text-white placeholder-slate-400 focus:outline-none focus:ring-violet-500 focus:border-violet-500 focus:z-10 sm:text-sm rounded-b-md"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {error && <p className="text-red-500 text-sm mt-2 text-center">{error}</p>}

          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-violet-600 hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 disabled:bg-violet-800 disabled:cursor-not-allowed"
            >
              {loading ? 'Processing...' : (isLogin ? 'Sign in' : 'Sign up')}
            </button>
          </div>
        </form>
        <div className="text-sm text-center">
          <button 
            type="button"
            onClick={() => { 
              setIsLogin(!isLogin); 
              setError(''); 
              setEmailError('');
            }} 
            className="font-medium text-violet-400 hover:text-violet-300"
          >
            {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;