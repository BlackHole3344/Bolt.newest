import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Code2, ArrowRight, Moon, Sun } from 'lucide-react';
import axios from 'axios';

export default function LandingPage() {
  const [prompt, setPrompt] = useState('');
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') === 'dark' ||
        (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });
  const navigate = useNavigate();

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim()) {
      // const response = await axios.post(`${BACKEND_URL}/template` , {
      //   messages : prompt.trim() 
      // })
      navigate('/workspace', { state: { prompt } });
    }
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-indigo-100 via-white to-purple-100 
                    dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-300">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute bg-third-glow bg-gradient-size rounded-full w-[50vw] h-[50vw] 
              -ml-[200px] blur-[90px] animate-gradient-xy opacity-30 dark:opacity-40"
    style={{ top: 'calc(50vh - 25vw)', left: '50vw' }}
        />
        <div className="absolute bg-secondary-glow bg-gradient-size rounded-full w-[500px] h-[700px] 
              blur-[90px] animate-gradient-xy opacity-30 dark:opacity-40"
    style={{ top: 'calc(50vh - 25vw)', left: 'calc(50vw - 25vw)' }}
        />
      </div>

      {/* Theme Toggle */}
      <div className="absolute top-4 right-4 z-50">
        <button
          onClick={() => setIsDark(!isDark)}
          className="p-3 rounded-full bg-white/10 backdrop-blur-lg border border-white/20 
                   shadow-lg hover:bg-white/20 transition-all duration-200"
          aria-label="Toggle dark mode"
        >
          {isDark ? 
            <Sun className="w-5 h-5 text-yellow-400" /> : 
            <Moon className="w-5 h-5 text-gray-600" />
          }
        </button>
      </div>

      {/* Main Content */}
      <div className="container relative z-10 mx-auto px-4 py-16">
        <div className="flex flex-col items-center justify-center space-y-12">
          {/* Logo and Title */}
          <div className="flex items-center space-x-3">
            <Code2 className="w-16 h-16 text-indigo-600 dark:text-indigo-400" />
            <h1 className="text-8xl font-bold text-gray-900 dark:text-white">VOLT AI</h1>
          </div>
          
          {/* Subtitle */}
          <h2 className="text-2xl md:text-4xl text-center text-gray-700 dark:text-gray-200 max-w-4xl">
            Transform your ideas into stunning websites with AI-powered generation
          </h2>

          {/* Form Section */}
          <form onSubmit={handleSubmit} className="w-full max-w-2xl">
            <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 via-purple-500 
     to-pink-500 rounded-2xl blur opacity-75 group-hover:opacity-100 
     transition duration-1000 group-hover:duration-200 bg-gradient-size animate-gradient-xy"/>
              
              <div className="relative">
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Describe your dream website..."
                  className="w-full px-6 py-4 text-lg rounded-2xl bg-white/90 
                           dark:bg-gray-900/90 backdrop-blur-xl border-2 
                           border-transparent focus:border-transparent focus:ring-0 
                           outline-none transition-all duration-200 min-h-[120px] 
                           resize-none text-gray-800 dark:text-gray-200 
                           placeholder-gray-500 dark:placeholder-gray-400
                           shadow-[inset_0_2px_4px_rgba(0,0,0,0.1)]"
                />
                
                <button
                  type="submit"
                  disabled={!prompt.trim()}
                  className="absolute bottom-4 right-4 group/btn disabled:opacity-50 
                           disabled:cursor-not-allowed"
                >
                  <div className="relative px-4 py-2 rounded-xl overflow-hidden 
                                shadow-[0_0_15px_rgba(79,70,229,0.3)] 
                                hover:shadow-[0_0_20px_rgba(79,70,229,0.5)]
                                transition-all duration-200">
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-purple-600 
     to-indigo-600 bg-gradient-size animate-gradient-x opacity-100 group-hover:opacity-90"/>
                    <div className="relative flex items-center space-x-2 text-white">
                      <span className="font-medium">Generate</span>
                      <ArrowRight className="w-4 h-4 transform group-hover/btn:translate-x-0.5 
                                         transition-transform duration-150" />
                    </div>
                  </div>
                </button>
              </div>
            </div>
          </form>

          {/* Feature Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-4xl">
            {[
              {
                title: 'AI-Powered',
                description: 'Advanced AI technology to understand and implement your vision'
              },
              {
                title: 'Real-Time Preview',
                description: 'See your website come to life as it\'s being generated'
              },
              {
                title: 'Production Ready',
                description: 'Get clean, optimized code ready for deployment'
              }
            ].map((feature, index) => (
              <div 
                key={index} 
                className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl p-6 
                         rounded-xl shadow-sm border border-white/20 
                         dark:border-gray-700/30 hover:shadow-lg transition-shadow duration-200"
              >
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}