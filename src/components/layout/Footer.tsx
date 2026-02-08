import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Music, Heart, Instagram, Twitter, Github, Mail, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Footer: React.FC = () => {
  const { t } = useTranslation();

  return (
    <footer className="bg-[#020202] border-t border-white/5 pt-20 pb-10 overflow-hidden relative">
      {/* Visual Accent */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-20" />

      <div className="container px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-20">
          {/* Brand & Mission */}
          <div className="space-y-8">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-600/30 group-hover:rotate-12 transition-transform">
                <Music className="h-7 w-7" />
              </div>
              <span className="text-2xl font-black tracking-tighter text-white">MASTER<span className="text-blue-600">CONNECT</span></span>
            </Link>
            <p className="text-gray-500 text-lg leading-relaxed font-light">
              The premier ecosystem for the world's most talented musicians to collaborate, innovate, and redefine the sonic landscape of tomorrow.
            </p>
            <div className="flex gap-4">
              {[Instagram, Twitter, Github, Globe].map((Icon, idx) => (
                <Button key={idx} size="icon" variant="outline" className="rounded-xl bg-white/5 border-white/10 hover:bg-blue-600 hover:border-blue-500 transition-all">
                  <Icon className="h-5 w-5" />
                </Button>
              ))}
            </div>
          </div>

          {/* Navigation Spectrum */}
          <div>
            <h4 className="text-sm font-black uppercase tracking-[0.3em] text-white/40 mb-8">Navigation</h4>
            <ul className="space-y-4">
              {['Home', 'Browse', 'Create', 'Profile'].map((item) => (
                <li key={item}>
                  <Link to={item === 'Home' ? '/' : `/${item.toLowerCase()}`} className="text-gray-400 hover:text-blue-400 transition-colors text-lg font-medium">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Ecosystem Links */}
          <div>
            <h4 className="text-sm font-black uppercase tracking-[0.3em] text-white/40 mb-8">Ecosystem</h4>
            <ul className="space-y-4">
              {['Vanguard Studio', 'Sound Labs', 'Creative Hub', 'Live Pulse'].map((item) => (
                <li key={item}>
                  <a href="#" className="text-gray-400 hover:text-purple-400 transition-colors text-lg font-medium">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Intelligence Network */}
          <div>
            <h4 className="text-sm font-black uppercase tracking-[0.3em] text-white/40 mb-8">Connect</h4>
            <div className="p-6 bg-white/5 rounded-3xl border border-white/10 backdrop-blur-xl">
              <p className="text-white font-bold mb-4">Join our signal feed</p>
              <div className="relative">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="w-full bg-[#050505] border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                />
                <Button size="sm" className="absolute right-1.5 top-1.5 bg-blue-600 hover:bg-blue-500 rounded-lg">
                  Join
                </Button>
              </div>
              <p className="text-[10px] text-gray-600 mt-4 leading-relaxed">
                By joining, you agree to our Terms of Service and Privacy Policy.
              </p>
            </div>
          </div>
        </div>

        {/* Global Footer Bottom */}
        <div className="pt-10 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-6">
            <span className="text-sm text-gray-600 font-medium">© 2026 MasterConnect Ecosystem</span>
            <div className="h-1 w-1 rounded-full bg-gray-800" />
            <Link to="/" className="text-sm text-gray-600 hover:text-white transition-colors">Privacy Architecture</Link>
            <div className="h-1 w-1 rounded-full bg-gray-800" />
            <Link to="/" className="text-sm text-gray-600 hover:text-white transition-colors">Legal Framework</Link>
          </div>

          <div className="flex items-center gap-3 px-4 py-2 bg-white/5 rounded-full border border-white/10">
            <span className="text-xs font-bold text-gray-500">SYSTEM STATUS:</span>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs font-black text-white tracking-widest uppercase">Operational</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

