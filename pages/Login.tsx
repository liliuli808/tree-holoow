import React, { useState } from 'react';
import { User } from '../types';
import { PenTool } from 'lucide-react';

export const Login: React.FC<{ onLogin: (u: User) => void }> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      onLogin({
        id: `user_${Math.floor(Math.random() * 10000)}`,
        nickname: `匿名用户_${Math.random().toString(36).substring(7).toUpperCase()}`,
        avatarUrl: `https://picsum.photos/seed/${Date.now()}/100`,
        isAnonymous: true
      });
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-white p-6 flex flex-col justify-center max-w-md mx-auto pt-safe pb-safe">
      <div className="mb-10 text-center">
        <div className="w-20 h-20 bg-brand-500 rounded-3xl mx-auto mb-6 flex items-center justify-center shadow-lg shadow-brand-200">
          <PenTool className="text-white w-10 h-10" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">欢迎来到树洞</h1>
        <p className="text-gray-500">卸下面具，做真实的自己</p>
      </div>

      <form onSubmit={handleLogin} className="space-y-6">
        {step === 1 ? (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">邮箱地址</label>
              <input 
                type="email" 
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 outline-none transition-all"
                placeholder="enter@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>
            <button 
              type="button"
              onClick={() => setStep(2)}
              className="w-full bg-brand-500 text-white py-3 rounded-xl font-bold hover:bg-brand-600 transition-colors shadow-lg shadow-brand-200/50"
            >
              下一步
            </button>
          </>
        ) : (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">验证码</label>
              <input 
                type="text" 
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 outline-none text-center tracking-widest text-xl"
                placeholder="1 2 3 4"
                defaultValue="1234"
              />
              <p className="text-xs text-gray-400 mt-2 text-center">验证码已发送至 {email}</p>
            </div>
            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-brand-500 text-white py-3 rounded-xl font-bold hover:bg-brand-600 transition-colors shadow-lg shadow-brand-200/50 flex justify-center"
            >
              {loading ? '登录中...' : '开始探索'}
            </button>
          </>
        )}
      </form>
      
      <p className="mt-8 text-center text-xs text-gray-300">
        登录即代表同意《用户协议》与《隐私政策》<br/>
        您的身份信息将被严格加密保护
      </p>
    </div>
  );
};