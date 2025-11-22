import React, { useState } from 'react';
import { Lock, User, ArrowRight, AlertCircle } from 'lucide-react';
import { Button } from './Button';
import { User as UserType } from '../types';
import { Logo } from './Logo';

interface LoginProps {
  onLogin: (user: UserType) => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Simulate network delay
    setTimeout(() => {
      if (username === 'admin' && password === '123456') {
        onLogin({
          id: 'admin-1',
          username: 'admin',
          name: 'Administrator',
          avatar: 'https://ui-avatars.com/api/?name=Administrator&background=0D8ABC&color=fff'
        });
      } else {
        setError('用户名或密码错误 (默认: admin / 123456)');
        setIsLoading(false);
      }
    }, 800);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-primary-600 shadow-md ring-1 ring-slate-100 p-3">
            <Logo className="h-full w-full" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-slate-900 font-sans">
          Tracer
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600">
          构建全链路追溯，赋能智能研发
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-sm sm:rounded-xl sm:px-10 border border-slate-200">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-slate-700">
                用户名
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <User className="h-5 w-5 text-slate-400" aria-hidden="true" />
                </div>
                <input
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="block w-full rounded-md border-0 py-2 pl-10 text-slate-900 ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6"
                  placeholder="admin"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700">
                密码
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Lock className="h-5 w-5 text-slate-400" aria-hidden="true" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full rounded-md border-0 py-2 pl-10 text-slate-900 ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6"
                  placeholder="123456"
                />
              </div>
            </div>

            {error && (
              <div className="rounded-md bg-red-50 p-3 flex items-center">
                <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
                <div className="text-sm text-red-700">{error}</div>
              </div>
            )}

            <div>
              <Button
                type="submit"
                className="w-full flex justify-center"
                isLoading={isLoading}
                icon={!isLoading ? <ArrowRight className="w-4 h-4" /> : undefined}
              >
                {isLoading ? '登录中...' : '立即登录'}
              </Button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white px-2 text-slate-500">体验账号</span>
              </div>
            </div>
            <div className="mt-2 text-center text-xs text-slate-400">
              用户名: <span className="font-mono bg-slate-100 px-1 rounded">admin</span> &nbsp;
              密码: <span className="font-mono bg-slate-100 px-1 rounded">123456</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};