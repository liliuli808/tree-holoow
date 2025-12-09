import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { PenTool, Mail, Lock, User as UserIcon, ShieldCheck, ChevronRight, Sparkles } from 'lucide-react';
import { login, register, sendVerificationCode } from '../services/authService';

export const Login: React.FC<{ onLogin: (token: string) => void }> = ({ onLogin }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);

  // Form State
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    code: '',
    password: ''
  });

  // Countdown timer effect
  useEffect(() => {
    let timer: any;
    if (countdown > 0) {
      timer = setInterval(() => setCountdown(prev => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [countdown]);

  const handleSendCode = async () => {
    if (!formData.email.includes('@')) {
      alert("请输入有效的邮箱地址");
      return;
    }
    if (countdown > 0) return;

    try {
      await sendVerificationCode(formData.email);
      setCountdown(60);
      alert(`验证码已发送至 ${formData.email}`);
    } catch (error) {
      alert((error as Error).message);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Validation
    if (!formData.email || !formData.password) {
      alert("请填写完整信息");
      setLoading(false);
      return;
    }
    if (isRegister && (!formData.code || !formData.username)) {
      alert("请填写完整注册信息");
      setLoading(false);
      return;
    }

    try {
      if (isRegister) {
        await register(formData.username, formData.email, formData.code, formData.password);
        alert("注册成功，请登录！");
        setIsRegister(false); // Switch to login form
      } else {
        const token = await login(formData.email, formData.password);
        onLogin(token);
      }

    } catch (error) {
      alert((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col justify-center px-6 pt-safe pb-safe relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-brand-100 rounded-full blur-3xl opacity-40"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-64 h-64 bg-green-100 rounded-full blur-3xl opacity-40"></div>

      <div className="max-w-md w-full mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-brand-400 to-brand-600 rounded-2xl shadow-lg shadow-brand-200 mb-6 transform rotate-3">
            <PenTool className="text-white w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2 tracking-tight">
            {isRegister ? '加入树洞' : '欢迎回来'}
          </h1>
          <p className="text-gray-500 text-sm">
            {isRegister ? '注册开启您的匿名社交之旅' : '登录以继续查看树洞内容'}
          </p>
        </div>

        {/* Toggle Switch */}
        <div className="bg-gray-100 p-1 rounded-xl flex mb-8 relative">
          <button 
            type="button"
            className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all duration-300 z-10 ${!isRegister ? 'text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setIsRegister(false)}
          >
            登录
          </button>
          <button 
            type="button"
            className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all duration-300 z-10 ${isRegister ? 'text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setIsRegister(true)}
          >
            注册
          </button>
          {/* Animated Background Slider */}
          <div className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-white rounded-lg transition-transform duration-300 ease-spring ${isRegister ? 'translate-x-[calc(100%+8px)]' : 'translate-x-0'}`}></div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Username (Register Only) */}
          {isRegister && (
            <div className="relative group">
                <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand-500 transition-colors" size={20} />
                <input
                    type="text"
                    placeholder="用户名"
                    className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border-2 border-transparent focus:border-brand-200 focus:bg-white rounded-xl outline-none transition-all font-medium text-gray-700"
                    value={formData.username}
                    onChange={e => setFormData({...formData, username: e.target.value})}
                />
            </div>
          )}

          {/* Email */}
          <div className="relative group">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand-500 transition-colors" size={20} />
            <input 
              type="email" 
              placeholder="邮箱地址"
              className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border-2 border-transparent focus:border-brand-200 focus:bg-white rounded-xl outline-none transition-all font-medium text-gray-700"
              value={formData.email}
              onChange={e => setFormData({...formData, email: e.target.value})}
            />
          </div>

          {/* Verification Code (Register Only) */}
          {isRegister && (
            <div className="flex gap-3 animate-in slide-in-from-top-2 fade-in duration-300">
              <div className="relative group flex-1">
                <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand-500 transition-colors" size={20} />
                <input 
                  type="text" 
                  placeholder="验证码"
                  className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border-2 border-transparent focus:border-brand-200 focus:bg-white rounded-xl outline-none transition-all font-medium text-gray-700"
                  value={formData.code}
                  onChange={e => setFormData({...formData, code: e.target.value})}
                />
              </div>
              <button 
                type="button"
                onClick={handleSendCode}
                disabled={countdown > 0}
                className={`px-4 rounded-xl text-sm font-bold whitespace-nowrap transition-colors border-2 ${
                  countdown > 0 
                    ? 'bg-gray-100 text-gray-400 border-transparent cursor-not-allowed' 
                    : 'bg-white text-brand-600 border-brand-100 hover:bg-brand-50'
                }`}
              >
                {countdown > 0 ? `${countdown}s后重发` : '发送验证码'}
              </button>
            </div>
          )}

          {/* Password */}
          <div className="relative group">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand-500 transition-colors" size={20} />
            <input 
              type="password" 
              placeholder={isRegister ? "设置密码 (6位以上)" : "输入密码"}
              className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border-2 border-transparent focus:border-brand-200 focus:bg-white rounded-xl outline-none transition-all font-medium text-gray-700"
              value={formData.password}
              onChange={e => setFormData({...formData, password: e.target.value})}
            />
          </div>

          {/* Forgot Password (Login Only) */}
          {!isRegister && (
            <div className="flex justify-end">
              <button type="button" className="text-xs text-gray-500 hover:text-brand-600 font-medium">
                忘记密码?
              </button>
            </div>
          )}

          {/* Submit Button */}
          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-brand-500 to-brand-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-brand-200 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-4"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                 <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                 处理中...
              </span>
            ) : (
              <>
                {isRegister ? '立即注册' : '登录'}
                <ChevronRight size={20} className="opacity-80" />
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-xs text-gray-400 leading-relaxed">
            {isRegister ? '注册' : '登录'}即代表您已阅读并同意<br/>
            <a href="#" className="text-gray-600 hover:text-brand-500 underline decoration-gray-300">《用户协议》</a> 与 <a href="#" className="text-gray-600 hover:text-brand-500 underline decoration-gray-300">《隐私政策》</a>
          </p>
          <div className="mt-6 flex items-center justify-center gap-2 text-xs text-brand-500/80 bg-brand-50 py-2 px-4 rounded-full w-fit mx-auto">
             <Sparkles size={12} />
             <span>您的身份信息将全程加密保护</span>
          </div>
        </div>
      </div>
    </div>
  );
};