import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, useScroll, useTransform } from 'framer-motion';
import {
  Search,
  Music2,
  Guitar,
  Mic2,
  Piano,
  Drum,
  Users,
  FileText,
  ArrowRight,
  Sparkles,
  UserPlus,
  MessageSquare,
  Play,
  Heart,
  Zap,
  Star,
  Globe
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import Layout from '@/components/layout/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { ParticleBackground } from '@/components/effects/ParticleBackground';
import { ScrollProgress, FloatingActionButton } from '@/components/effects/ScrollEffects';

const instrumentCards = [
  { key: 'drums', icon: Drum, color: 'from-orange-500 to-red-500', desc: 'The heartbeat of every rhythm.' },
  { key: 'guitar', icon: Guitar, color: 'from-blue-500 to-purple-500', desc: 'Melodic soul and electric fire.' },
  { key: 'bass', icon: Guitar, color: 'from-green-500 to-teal-500', desc: 'The depth that moves the earth.' },
  { key: 'keyboard', icon: Piano, color: 'from-pink-500 to-rose-500', desc: 'Infinite textures and harmonies.' },
  { key: 'vocals', icon: Mic2, color: 'from-yellow-500 to-orange-500', desc: 'The human touch in every song.' },
  { key: 'other', icon: Music2, color: 'from-indigo-500 to-blue-500', desc: 'Diverse sounds, unique vibes.' },
];

const Index: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.2], [1, 0.95]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/browse?q=${encodeURIComponent(searchQuery)}`);
  };

  return (
    <Layout>
      <ScrollProgress />
      <ParticleBackground />
      <FloatingActionButton />
      <div className="bg-[#020202] dark:bg-[#020202] light:bg-white text-white dark:text-white light:text-gray-900 overflow-hidden transition-colors duration-300">
        {/* Dynamic Cinematic Hero */}
        <section className="relative min-h-screen flex items-center justify-center pt-20">
          <motion.div
            style={{ opacity, scale }}
            className="absolute inset-0 z-0"
          >
            <div className="absolute inset-0 bg-gradient-to-b from-blue-600/20 via-transparent to-[#020202] z-10" />
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1493225255756-d9584f8606e9?q=80&w=2670')] bg-cover bg-center grayscale opacity-20" />
            <div className="absolute inset-0 backdrop-blur-[3px]" />
          </motion.div>

          <div className="container relative z-20 px-4 pt-12">
            <div className="flex flex-col items-center text-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8 }}
                className="mb-8"
              >
                <div className="px-4 py-1.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-xl flex items-center gap-2 text-sm font-medium text-blue-400">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                  </span>
                  Master Connect v2.0 Live
                </div>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.2 }}
                className="text-6xl md:text-8xl font-black tracking-tighter mb-8 leading-[0.9]"
              >
                WHERE <span className="text-blue-500">RHYTHM</span> <br />
                MEETS <span className="italic font-serif text-white/40">DESTINY.</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="text-xl md:text-2xl text-gray-400 max-w-2xl mb-12 font-light leading-relaxed"
              >
                The elite ecosystem for professional musicians to collaborate, innovate, and broadcast their creative signals to the world.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                className="w-full max-w-2xl"
              >
                <form onSubmit={handleSearch} className="group relative flex items-center p-2 bg-white/5 backdrop-blur-3xl rounded-[2rem] border border-white/10 focus-within:border-blue-500/50 transition-all shadow-2xl shadow-black/50">
                  <Search className="ml-4 w-6 h-6 text-gray-500 group-focus-within:text-blue-400 transition-colors" />
                  <Input
                    placeholder="Recruit a stage-ready drummer or producer..."
                    className="bg-transparent border-0 text-lg h-14 focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-gray-600"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <Button type="submit" size="lg" className="rounded-[1.5rem] px-10 h-14 bg-blue-600 hover:bg-blue-500 text-white font-bold text-lg shadow-lg shadow-blue-600/20">
                    Search
                  </Button>
                </form>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1, duration: 1 }}
                className="mt-16 flex flex-wrap justify-center gap-12 text-gray-500"
              >
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-500" />
                  <span className="text-sm font-semibold uppercase tracking-widest">12K+ Artists</span>
                </div>
                <div className="flex items-center gap-2">
                  <Globe className="w-5 h-5 text-purple-500" />
                  <span className="text-sm font-semibold uppercase tracking-widest">Global Network</span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-yellow-500" />
                  <span className="text-sm font-semibold uppercase tracking-widest">Instant Collabs</span>
                </div>
              </motion.div>
            </div>
          </div>

          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce opacity-20">
            <div className="w-6 h-10 rounded-full border-2 border-white flex justify-center pt-2">
              <div className="w-1.5 h-1.5 bg-white rounded-full" />
            </div>
          </div>
        </section>

        {/* Instrument Universe Section */}
        <section className="py-32 relative bg-[#050505]">
          <div className="container px-4">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="mb-20"
            >
              <div className="flex items-center gap-4 mb-4 text-blue-500">
                <div className="h-px w-12 bg-blue-500/50" />
                <span className="text-sm font-black uppercase tracking-[0.3em]">The Discipines</span>
              </div>
              <h2 className="text-5xl md:text-7xl font-bold tracking-tight">Recruit Your <br /> <span className="font-serif italic text-white/40">Vanguard.</span></h2>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {instrumentCards.map((card, idx) => (
                <motion.div
                  key={card.key}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Link to={`/browse?instrument=${card.key}`}>
                    <div className="group relative p-10 bg-white/[0.03] border border-white/5 rounded-[3rem] overflow-hidden hover:bg-white/[0.06] transition-all duration-500 h-full">
                      {/* Visual Accent */}
                      <div className={`absolute -right-4 -top-4 w-32 h-32 bg-gradient-to-br ${card.color} opacity-20 blur-3xl group-hover:opacity-40 transition-opacity`} />

                      <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${card.color} flex items-center justify-center text-white shadow-xl shadow-black/40 mb-8 rotate-3 group-hover:rotate-0 transition-transform duration-500`}>
                        <card.icon className="w-8 h-8" />
                      </div>

                      <h3 className="text-3xl font-bold mb-4 group-hover:text-blue-400 transition-colors">
                        {t(`landing.instruments.${card.key}`)}
                      </h3>
                      <p className="text-gray-500 leading-relaxed text-lg">
                        {card.desc}
                      </p>

                      <div className="mt-10 flex items-center gap-2 text-white font-bold opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0 transition-all">
                        <span>Browse Talent</span>
                        <ArrowRight className="w-5 h-5" />
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Master Showcase CTA */}
        <section className="py-40 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900/40 to-purple-900/40 opacity-30 blur-[120px] pointer-events-none" />
          <div className="container px-4 text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="max-w-4xl mx-auto p-16 rounded-[4rem] bg-white/[0.03] border border-white/10 backdrop-blur-3xl relative overflow-hidden shadow-2xl"
            >
              <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />

              <Star className="w-12 h-12 text-yellow-500 mx-auto mb-8 animate-pulse" />
              <h2 className="text-5xl md:text-6xl font-black mb-8 leading-tight">
                READY TO LEAD THE <br /> <span className="text-blue-500">NEXT WAVE?</span>
              </h2>
              <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto font-light leading-relaxed">
                Join the most innovative platform for professional musicians. Create your profile in seconds and start collaborating with the best in the industry.
              </p>

              <div className="flex flex-col sm:flex-row gap-6 justify-center">
                <Link to="/auth?mode=register">
                  <Button size="lg" className="h-16 px-12 rounded-2xl bg-white text-black hover:bg-gray-200 text-lg font-black shadow-xl">
                    GET STARTED NOW
                  </Button>
                </Link>
                <Link to="/browse">
                  <Button size="lg" variant="outline" className="h-16 px-12 rounded-2xl border-white/10 bg-white/5 hover:bg-white/10 text-white text-lg font-black">
                    EXPLORE TALENT
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Cinematic Footer Section */}
        <footer className="py-20 border-t border-white/5 bg-[#010101]">
          <div className="container px-4">
            <div className="flex flex-col md:flex-row justify-between items-center gap-12">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center">
                  <Music2 className="w-7 h-7 text-white" />
                </div>
                <span className="text-2xl font-black tracking-tighter">MASTER<span className="text-blue-500">CONNECT</span></span>
              </div>

              <div className="flex gap-8 text-sm font-bold text-gray-600">
                <Link to="/browse" className="hover:text-blue-400 transition-colors uppercase tracking-widest">Discover</Link>
                <Link to="/create" className="hover:text-blue-400 transition-colors uppercase tracking-widest">Broadcast</Link>
                <Link to="/profile" className="hover:text-blue-400 transition-colors uppercase tracking-widest">Identity</Link>
              </div>

              <div className="text-gray-700 text-sm font-medium">
                © 2026 MasterConnect Ecosystem. All Rights Reserved.
              </div>
            </div>
          </div>
        </footer>
      </div>
    </Layout>
  );
};

export default Index;

