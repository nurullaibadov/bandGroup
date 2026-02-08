import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Filter,
  MapPin,
  Music2,
  Clock,
  Mail,
  Phone,
  Drum,
  Guitar,
  Piano,
  Mic2,
  Plus,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import Layout from '@/components/layout/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { db } from '@/lib/db';
import { format } from 'date-fns';

const instrumentIcons: Record<string, React.ElementType> = {
  drums: Drum,
  guitar: Guitar,
  bass: Guitar,
  keyboard: Piano,
  vocals: Mic2,
  other: Music2,
};

const instrumentColors: Record<string, string> = {
  drums: 'from-orange-500 to-red-500',
  guitar: 'from-blue-500 to-purple-500',
  bass: 'from-green-500 to-teal-500',
  keyboard: 'from-pink-500 to-rose-500',
  vocals: 'from-yellow-500 to-orange-500',
  violin: 'from-indigo-500 to-blue-500',
  saxophone: 'from-amber-500 to-yellow-500',
  trumpet: 'from-cyan-500 to-blue-500',
  flute: 'from-emerald-500 to-green-500',
  other: 'from-gray-500 to-slate-500',
};

interface Announcement {
  id: string;
  title: string;
  description: string;
  instrument_needed: string;
  location: string | null;
  genre: string | null;
  experience_required: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  status: string;
  created_at: string;
  source?: 'cloud' | 'local';
  profiles: {
    username: string | null;
    full_name: string | null;
    avatar_url: string | null;
  } | null;
}

const Browse: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [instrumentFilter, setInstrumentFilter] = useState(searchParams.get('instrument') || 'all');
  const [genreFilter, setGenreFilter] = useState('all');
  const [expFilter, setExpFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  const instruments = [
    'drums', 'guitar', 'bass', 'keyboard', 'vocals',
    'violin', 'saxophone', 'trumpet', 'flute', 'other'
  ];
  const genres = ['Rock', 'Jazz', 'Pop', 'Metal', 'Blues', 'Classical', 'Electronic', 'Hip-Hop', 'Country', 'Punk'];
  const experienceLevels = ['Beginner', 'Intermediate', 'Advanced', 'Professional', 'Master'];

  useEffect(() => {
    fetchAnnouncements();
  }, [instrumentFilter, sortBy]);

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      // 1. Fetch from Supabase
      let query = supabase
        .from('announcements')
        .select('*')
        .eq('status', 'active');

      if (instrumentFilter && instrumentFilter !== 'all') {
        query = query.eq('instrument_needed', instrumentFilter as any);
      }

      const { data: cloudData, error } = await query;
      if (error) throw error;

      // 2. Fetch profiles for cloud data
      let cloudAds: Announcement[] = [];
      if (cloudData) {
        const userIds = [...new Set(cloudData.map(d => d.user_id))];
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('user_id, username, full_name, avatar_url')
          .in('user_id', userIds);

        const profilesMap = new Map(profilesData?.map(p => [p.user_id, p]) || []);
        cloudAds = cloudData.map(ad => ({
          ...ad,
          source: 'cloud',
          profiles: profilesMap.get(ad.user_id) || null,
        })) as Announcement[];
      }

      // 3. Get from Local DB
      const localUsers = db.getUsers();
      const localAdsRaw = db.getAnnouncements().filter(a => a.status === 'active');

      let localAds: Announcement[] = localAdsRaw.map(ad => ({
        ...ad,
        source: 'local',
        profiles: {
          username: localUsers.find(u => u.id === ad.user_id)?.username || 'Admin',
          full_name: localUsers.find(u => u.id === ad.user_id)?.full_name || 'Administrator',
          avatar_url: null
        }
      })) as unknown as Announcement[];

      // Apply instrument filter to local ads manually
      if (instrumentFilter && instrumentFilter !== 'all') {
        localAds = localAds.filter(ad => ad.instrument_needed === instrumentFilter);
      }

      // Combine and Sort
      const combined = [...cloudAds, ...localAds];
      combined.sort((a, b) => {
        const dateA = new Date(a.created_at).getTime();
        const dateB = new Date(b.created_at).getTime();
        return sortBy === 'newest' ? dateB - dateA : dateA - dateB;
      });

      setAnnouncements(combined);
    } catch (error) {
      console.error('Error fetching announcements:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredAnnouncements = announcements.filter(ad => {
    const matchesSearch = !searchQuery || [
      ad.title,
      ad.description,
      ad.location,
      ad.genre,
      ad.instrument_needed,
      ad.experience_required
    ].some(field => field?.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesGenre = genreFilter === 'all' || ad.genre === genreFilter;
    const matchesExp = expFilter === 'all' || ad.experience_required === expFilter;

    return matchesSearch && matchesGenre && matchesExp;
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchParams(prev => {
      if (searchQuery) prev.set('q', searchQuery);
      else prev.delete('q');
      return prev;
    });
  };

  const handleInstrumentChange = (value: string) => {
    setInstrumentFilter(value);
    setSearchParams(prev => {
      if (value && value !== 'all') prev.set('instrument', value);
      else prev.delete('instrument');
      return prev;
    });
  };

  return (
    <Layout>
      <div className="min-h-screen bg-[#020202] text-white">
        {/* Animated Hero Header */}
        <section className="relative py-24 overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-blue-600/10 via-transparent to-transparent pointer-events-none" />
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute top-1/2 -left-24 w-72 h-72 bg-purple-500/10 rounded-full blur-[100px] pointer-events-none" />

          <div className="container relative z-10 px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-3xl"
            >
              <Badge className="mb-4 bg-blue-500/10 text-blue-400 border-blue-500/20 px-3 py-1 flex w-fit items-center gap-1.5 backdrop-blur-md">
                <Sparkles className="w-3.5 h-3.5" /> Discovery Feed
              </Badge>
              <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-6 bg-gradient-to-r from-white via-white to-white/40 bg-clip-text text-transparent">
                Find Your Perfect <br /> <span className="text-blue-500 italic font-serif">Musical Sync.</span>
              </h1>
              <p className="text-gray-400 text-lg md:text-xl max-w-xl leading-relaxed">
                Browse through master-level musicians and emerging talents. The ecosystem where rhythm meets soul.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Cinematic Filter Bar */}
        <div className="sticky top-0 z-50 py-6 backdrop-blur-2xl border-y border-white/10 bg-black/60 shadow-2xl">
          <div className="container px-4">
            <div className="flex flex-col gap-6">
              <form onSubmit={handleSearch} className="relative w-full flex gap-3">
                <div className="relative flex-1 group">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-blue-400 transition-colors" />
                  <Input
                    placeholder="Search by artist, location, or keywords..."
                    className="pl-12 bg-white/5 border-white/10 text-white h-14 rounded-2xl focus:ring-blue-500/50 hover:bg-white/10 transition-all text-lg"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Button type="submit" size="lg" className="h-14 px-10 bg-blue-600 hover:bg-blue-500 text-white border-0 rounded-2xl shadow-xl shadow-blue-600/20 font-bold">
                  Analyze Signal
                </Button>
              </form>

              <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
                <Select value={instrumentFilter} onValueChange={handleInstrumentChange}>
                  <SelectTrigger className="bg-white/5 border-white/10 rounded-xl h-11 text-sm">
                    <SelectValue placeholder="Discipline" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0f0f0f] border-white/10 text-white rounded-xl">
                    <SelectItem value="all">All Disciplines</SelectItem>
                    {instruments.map((inst) => (
                      <SelectItem key={inst} value={inst}>{inst.charAt(0).toUpperCase() + inst.slice(1)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={genreFilter} onValueChange={setGenreFilter}>
                  <SelectTrigger className="bg-white/5 border-white/10 rounded-xl h-11 text-sm">
                    <SelectValue placeholder="Genre" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0f0f0f] border-white/10 text-white rounded-xl">
                    <SelectItem value="all">All Genres</SelectItem>
                    {genres.map((g) => (
                      <SelectItem key={g} value={g}>{g}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={expFilter} onValueChange={setExpFilter}>
                  <SelectTrigger className="bg-white/5 border-white/10 rounded-xl h-11 text-sm">
                    <SelectValue placeholder="Experience" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0f0f0f] border-white/10 text-white rounded-xl">
                    <SelectItem value="all">Any Level</SelectItem>
                    {experienceLevels.map((e) => (
                      <SelectItem key={e} value={e}>{e}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="bg-white/5 border-white/10 rounded-xl h-11 text-sm">
                    <SelectValue placeholder="Sort" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0f0f0f] border-white/10 text-white rounded-xl">
                    <SelectItem value="newest">Latest Signal</SelectItem>
                    <SelectItem value="oldest">Legacy Nodes</SelectItem>
                  </SelectContent>
                </Select>

                <Button
                  variant="outline"
                  className="h-11 rounded-xl bg-white/5 border-white/10 text-gray-400 hover:text-white"
                  onClick={() => {
                    setSearchQuery('');
                    setInstrumentFilter('all');
                    setGenreFilter('all');
                    setExpFilter('all');
                  }}
                >
                  Reset Filters
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <section className="py-20">
          <div className="container px-4">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="aspect-[4/5] bg-white/5 rounded-[2.5rem] animate-pulse border border-white/5" />
                ))}
              </div>
            ) : filteredAnnouncements.length === 0 ? (
              <div className="text-center py-40 bg-white/[0.02] rounded-[3rem] border border-dashed border-white/10">
                <Music2 className="mx-auto h-20 w-20 text-white/5 mb-6" />
                <h3 className="text-2xl font-bold mb-2">No Resonance Found</h3>
                <p className="text-gray-500 mb-8 max-w-sm mx-auto">Your search criteria didn't match any active announcements. Try broadening your horizon.</p>
                <Button size="lg" variant="outline" onClick={() => { setSearchQuery(''); setInstrumentFilter('all'); }} className="rounded-2xl bg-white/5 border-white/10">
                  Reset Filters
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <AnimatePresence mode="popLayout">
                  {filteredAnnouncements.map((ad, index) => {
                    const Icon = instrumentIcons[ad.instrument_needed] || Music2;
                    const color = instrumentColors[ad.instrument_needed] || instrumentColors.other;

                    return (
                      <motion.div
                        layout
                        key={ad.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.4, delay: index * 0.05 }}
                      >
                        <Card className="group relative overflow-hidden bg-white/5 border-white/10 border-0 rounded-[2.5rem] h-full flex flex-col hover:bg-white/[0.08] transition-all duration-500">
                          {/* Status/Badge */}
                          <div className="absolute top-6 left-6 z-20 flex gap-2">
                            {ad.source === 'local' && (
                              <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 backdrop-blur-md">Local Master</Badge>
                            )}
                            <Badge variant="outline" className="bg-black/40 border-white/10 backdrop-blur-md">{ad.genre || 'Alternative'}</Badge>
                          </div>

                          {/* Visual Accent */}
                          <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${color} opacity-20 blur-3xl group-hover:opacity-40 transition-opacity`} />

                          <CardHeader className="pt-20 pb-6 text-white z-10">
                            <div className="flex items-end justify-between gap-4 mb-4">
                              <div className={`p-4 rounded-3xl bg-gradient-to-br ${color} text-white shadow-xl shadow-black/40 rotate-3 group-hover:rotate-0 transition-transform duration-500`}>
                                <Icon className="w-8 h-8" />
                              </div>
                              {user && ad.contact_email && (
                                <Button size="icon" variant="ghost" className="rounded-2xl bg-white/5 hover:bg-white/20" asChild>
                                  <a href={`mailto:${ad.contact_email}`}><Mail className="w-5 h-5" /></a>
                                </Button>
                              )}
                            </div>
                            <h3 className="text-2xl font-bold leading-tight group-hover:text-blue-400 transition-colors line-clamp-2">
                              {ad.title}
                            </h3>
                          </CardHeader>

                          <CardContent className="flex-1 pb-6 z-10">
                            <p className="text-gray-400 text-sm leading-relaxed mb-6 line-clamp-4">
                              {ad.description}
                            </p>

                            <div className="space-y-3">
                              <div className="flex items-center gap-2.5 text-xs font-medium text-gray-400 uppercase tracking-widest">
                                <MapPin className="w-4 h-4 text-blue-500" />
                                {ad.location || 'Echoes of Earth'}
                              </div>
                              <div className="flex items-center gap-2.5 text-xs font-medium text-gray-400 uppercase tracking-widest">
                                <Clock className="w-4 h-4 text-purple-500" />
                                {format(new Date(ad.created_at), 'MMM dd, yyyy')}
                              </div>
                            </div>
                          </CardContent>

                          <CardFooter className="pt-6 border-t border-white/5 mx-6 pb-6 mt-auto">
                            <div className="flex items-center justify-between w-full">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 p-0.5">
                                  <div className="w-full h-full rounded-full bg-black flex items-center justify-center overflow-hidden">
                                    {ad.profiles?.avatar_url ? (
                                      <img src={ad.profiles.avatar_url} className="w-full h-full object-cover" />
                                    ) : (
                                      <span className="text-[10px] font-bold">{(ad.profiles?.username || 'M')[0].toUpperCase()}</span>
                                    )}
                                  </div>
                                </div>
                                <div className="flex flex-col">
                                  <span className="text-white text-sm font-bold truncate">{ad.profiles?.full_name || ad.profiles?.username || 'Musician'}</span>
                                  <span className="text-[10px] text-gray-500 uppercase tracking-wider">Artist</span>
                                </div>
                              </div>
                              <Button variant="ghost" size="icon" className="group/btn hover:bg-transparent">
                                <ArrowRight className="w-5 h-5 text-gray-600 group-hover/btn:text-white group-hover/btn:translate-x-1 transition-all" />
                              </Button>
                            </div>
                          </CardFooter>
                        </Card>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            )}
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default Browse;

