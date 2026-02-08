import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Menu,
  X,
  Music,
  Sun,
  Moon,
  Globe,
  User,
  LogOut,
  Settings,
  Plus,
  Search,
  Bell,
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';

const Navbar: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { user, isAdmin, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
    localStorage.setItem('language', lang);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const navLinks = [
    { to: '/', label: 'Circuit' },
    { to: '/browse', label: 'Signal Feed' },
    ...(user ? [{ to: '/create', label: 'Broadcast' }] : []),
    ...(isAdmin ? [{ to: '/admin', label: 'Nodes' }] : []),
  ];

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] px-4 py-4 pointer-events-none">
      <nav className={`
        mx-auto max-w-7xl w-full pointer-events-auto transition-all duration-500 rounded-[2rem]
        ${scrolled ? 'bg-black/40 backdrop-blur-2xl border border-white/10 shadow-2xl py-2' : 'bg-transparent py-4'}
      `}>
        <div className="container flex items-center justify-between px-6">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <motion.div
              whileHover={{ rotate: 90, scale: 1.1 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-600/30"
            >
              <Music className="h-6 w-6" />
            </motion.div>
            <div className="flex flex-col">
              <span className="text-xl font-black tracking-tighter text-white group-hover:text-blue-400 transition-colors">MASTER<span className="text-blue-600">CONNECT</span></span>
              <span className="text-[10px] uppercase tracking-[0.3em] text-gray-500 font-bold -mt-1 group-hover:text-gray-400">Vanguard Studio</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-2 bg-white/5 backdrop-blur-md border border-white/5 rounded-2xl p-1">
            {navLinks.map((link) => (
              <Link key={link.to} to={link.to}>
                <Button
                  variant="ghost"
                  className={`
                    rounded-xl px-6 font-bold text-sm tracking-wide transition-all
                    ${location.pathname === link.to ? 'bg-white/10 text-white shadow-inner' : 'text-gray-400 hover:text-white hover:bg-white/5'}
                  `}
                >
                  {link.label}
                </Button>
              </Link>
            ))}
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1">
              <Button variant="ghost" size="icon" className="rounded-xl text-gray-400 hover:text-white" onClick={() => navigate('/browse')}>
                <Search className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="rounded-xl text-gray-400 hover:text-white">
                <Bell className="h-5 w-5" />
              </Button>
            </div>

            <div className="h-6 w-px bg-white/10 mx-2 hidden sm:block" />

            {/* Language Switcher */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-xl text-gray-400 hover:text-white">
                  <Globe className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="rounded-2xl bg-[#0a0a0a]/95 backdrop-blur-xl border-white/10 text-white p-2">
                <DropdownMenuItem onClick={() => changeLanguage('en')} className="rounded-xl focus:bg-white/10 focus:text-white cursor-pointer py-3 px-4">
                  <span className="mr-3">🇺🇸</span> English (Global)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => changeLanguage('tr')} className="rounded-xl focus:bg-white/10 focus:text-white cursor-pointer py-3 px-4">
                  <span className="mr-3">🇹🇷</span> Türkçe (TR)
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Theme Toggle */}
            <Button variant="ghost" size="icon" onClick={toggleTheme} className="rounded-xl text-gray-400 hover:text-white">
              <AnimatePresence mode="wait" initial={false}>
                {theme === 'dark' ? (
                  <motion.div key="sun" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
                    <Sun className="h-5 w-5" />
                  </motion.div>
                ) : (
                  <motion.div key="moon" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}>
                    <Moon className="h-5 w-5" />
                  </motion.div>
                )}
              </AnimatePresence>
            </Button>

            {/* User Access */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="group relative w-10 h-10 rounded-xl overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600 p-[1px]">
                    <div className="w-full h-full rounded-[11px] bg-[#020202] flex items-center justify-center">
                      <User className="h-5 w-5 text-white/50" />
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64 rounded-[2rem] bg-[#0a0a0a]/95 backdrop-blur-2xl border-white/10 text-white p-4 shadow-2xl">
                  <div className="px-4 py-4 mb-2 flex items-center gap-3 bg-white/5 rounded-2xl">
                    <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center font-bold">
                      {user.email?.[0].toUpperCase()}
                    </div>
                    <div className="flex flex-col overflow-hidden">
                      <span className="text-sm font-bold truncate">{user.email}</span>
                      <span className="text-[10px] text-blue-400 uppercase tracking-widest font-black">Authorized Member</span>
                    </div>
                  </div>
                  <DropdownMenuItem onClick={() => navigate('/profile')} className="rounded-xl focus:bg-white/10 focus:text-white cursor-pointer py-3 px-4">
                    <User className="mr-3 h-4 w-4 text-blue-400" /> Identity Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/create')} className="rounded-xl focus:bg-white/10 focus:text-white cursor-pointer py-3 px-4">
                    <Plus className="mr-3 h-4 w-4 text-purple-400" /> New Broadcast
                  </DropdownMenuItem>
                  {isAdmin && (
                    <DropdownMenuItem onClick={() => navigate('/admin')} className="rounded-xl focus:bg-white/10 focus:text-white cursor-pointer py-3 px-4 font-bold text-blue-400">
                      <Settings className="mr-3 h-4 w-4" /> System Nodes
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator className="bg-white/5 my-2" />
                  <DropdownMenuItem onClick={handleSignOut} className="rounded-xl focus:bg-red-500/20 text-red-400 cursor-pointer py-3 px-4">
                    <LogOut className="mr-3 h-4 w-4" /> Terminate Session
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Link to="/auth">
                  <Button variant="ghost" className="rounded-xl text-gray-400 hover:text-white font-bold">Access</Button>
                </Link>
                <Link to="/auth?mode=register">
                  <Button className="rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold px-6 shadow-lg shadow-blue-600/20">Initialize</Button>
                </Link>
              </div>
            )}

            {/* Mobile Menu Trigger */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden rounded-xl text-gray-400 hover:text-white"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu Content */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="lg:hidden absolute top-full left-0 right-0 mt-4 mx-4 bg-[#0a0a0a]/95 backdrop-blur-3xl border border-white/10 rounded-[2rem] overflow-hidden p-6 shadow-2xl"
            >
              <div className="flex flex-col gap-3">
                {navLinks.map((link) => (
                  <Link key={link.to} to={link.to} onClick={() => setIsMobileMenuOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start rounded-xl h-14 text-lg font-bold text-gray-400 hover:text-white hover:bg-white/5">
                      {link.label}
                    </Button>
                  </Link>
                ))}
                {!user && (
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <Link to="/auth" onClick={() => setIsMobileMenuOpen(false)}>
                      <Button variant="outline" className="w-full h-14 rounded-xl border-white/10 text-white font-bold text-lg">Login</Button>
                    </Link>
                    <Link to="/auth?mode=register" onClick={() => setIsMobileMenuOpen(false)}>
                      <Button className="w-full h-14 rounded-xl bg-blue-600 text-white font-bold text-lg">Join</Button>
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </div>
  );
};

export default Navbar;

