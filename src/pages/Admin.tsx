import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  FileText,
  Activity,
  TrendingUp,
  Loader2,
  Shield,
  Trash2,
  UserCheck,
  UserX,
  Ban,
  CheckCircle,
  Database,
  LayoutDashboard,
  Bell,
  Settings,
  Plus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { format } from 'date-fns';
import Layout from '@/components/layout/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { db, DBAnnouncement, DBUser } from '@/lib/db';

interface DashboardStats {
  totalUsers: number;
  totalAds: number;
  activeAds: number;
  newToday: number;
}

const Admin: React.FC = () => {
  const { t } = useTranslation();
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalAds: 0,
    activeAds: 0,
    newToday: 0,
  });
  const [users, setUsers] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    if (!isAdmin) {
      navigate('/');
      return;
    }
    fetchDashboardData();
  }, [user, isAdmin, navigate]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // 1. Get data from Supabase
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const [profilesResult, adsResult, activeAdsResult, todayAdsResult] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('announcements').select('id', { count: 'exact', head: true }),
        supabase.from('announcements').select('id', { count: 'exact', head: true }).eq('status', 'active'),
        supabase.from('announcements').select('id', { count: 'exact', head: true }).gte('created_at', today.toISOString()),
      ]);

      // 2. Get data from our local DB
      const localUsers = db.getUsers();
      const localAds = db.getAnnouncements();

      setStats({
        totalUsers: (profilesResult.count || 0) + localUsers.length,
        totalAds: (adsResult.count || 0) + localAds.length,
        activeAds: (activeAdsResult.count || 0) + localAds.filter(a => a.status === 'active').length,
        newToday: (todayAdsResult.count || 0) + localAds.filter(a => new Date(a.created_at) >= today).length,
      });

      // Fetch users
      const { data: supabaseUsers } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      const allUsers = [
        ...(supabaseUsers || []).map(u => ({ ...u, source: 'cloud' })),
        ...localUsers.map(u => ({ ...u, source: 'local' }))
      ];
      setUsers(allUsers);

      // Fetch announcements
      const { data: supabaseAds } = await supabase
        .from('announcements')
        .select('*, profiles(username, full_name)')
        .order('created_at', { ascending: false });

      const allAds = [
        ...(supabaseAds || []).map(a => ({ ...a, source: 'cloud' })),
        ...localAds.map(a => ({
          ...a,
          source: 'local',
          profiles: {
            username: localUsers.find(u => u.id === a.user_id)?.username || 'Admin',
            full_name: localUsers.find(u => u.id === a.user_id)?.full_name || 'Administrator'
          }
        }))
      ];
      setAnnouncements(allAds);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (u: any) => {
    try {
      if (u.source === 'local') {
        db.deleteUser(u.id);
        toast.success('Local user removed');
      } else {
        const { error } = await supabase.from('profiles').delete().eq('id', u.id);
        if (error) throw error;
        toast.success('Cloud profile removed');
      }
      fetchDashboardData();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleUpdateRole = async (u: any, newRole: string) => {
    try {
      if (u.source === 'local') {
        db.updateUser(u.id, { role: newRole as any });
        toast.success('Local role updated');
      } else {
        // In Supabase, roles are often in a separate table
        const { error } = await supabase.from('user_roles').upsert({ user_id: u.id, role: newRole });
        if (error) throw error;
        toast.success('Cloud role updated');
      }
      fetchDashboardData();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleDeleteAd = async (ad: any) => {
    try {
      if (ad.source === 'local') {
        db.deleteAnnouncement(ad.id);
      } else {
        const { error } = await supabase.from('announcements').delete().eq('id', ad.id);
        if (error) throw error;
      }
      toast.success('Announcement deleted');
      fetchDashboardData();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleToggleStatus = async (ad: any) => {
    const newStatus = ad.status === 'active' ? 'closed' : 'active';
    try {
      if (ad.source === 'local') {
        db.updateAnnouncement(ad.id, { status: newStatus as any });
      } else {
        const { error } = await supabase.from('announcements').update({ status: newStatus }).eq('id', ad.id);
        if (error) throw error;
      }
      toast.success(`Status updated to ${newStatus}`);
      fetchDashboardData();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  if (!user || !isAdmin) return null;

  return (
    <Layout>
      <div className="min-h-screen bg-[#050505] text-white">
        {/* Animated Background */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-20">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/30 blur-[120px] rounded-full animate-pulse" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/30 blur-[120px] rounded-full animate-pulse delay-700" />
        </div>

        <section className="relative z-10 py-12">
          <div className="container px-4 md:px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12"
            >
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-blue-600/20 rounded-lg border border-blue-500/30">
                    <LayoutDashboard className="h-6 w-6 text-blue-400" />
                  </div>
                  <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
                    Master Intelligence Node
                  </h1>
                </div>
                <p className="text-gray-400 max-w-lg">
                  Advanced command center for managing the MasterConnect ecosystem. Control users, content, and system health.
                </p>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" className="bg-white/5 border-white/10 hover:bg-white/10">
                  <Bell className="h-4 w-4 mr-2" /> Notifications
                </Button>
                <Button onClick={() => navigate('/create')} className="bg-blue-600 hover:bg-blue-500 text-white border-0 shadow-lg shadow-blue-600/20">
                  <Plus className="h-4 w-4 mr-2" /> New Entry
                </Button>
              </div>
            </motion.div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-40 gap-4">
                <Loader2 className="h-12 w-12 text-blue-500 animate-spin" />
                <p className="text-gray-500 font-medium">Synchronizing with ecosystem...</p>
              </div>
            ) : (
              <div className="space-y-12">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[
                    { label: 'Total Musicians', value: stats.totalUsers, icon: Users, color: 'text-blue-400', bg: 'bg-blue-400/10' },
                    { label: 'Active Signals', value: stats.activeAds, icon: FileText, color: 'text-purple-400', bg: 'bg-purple-400/10' },
                    { label: 'Network Pulse', value: 'High', icon: Activity, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
                    { label: 'Growth Vector', value: `+${stats.newToday}`, icon: TrendingUp, color: 'text-orange-400', bg: 'bg-orange-400/10' },
                  ].map((stat, i) => (
                    <motion.div
                      key={stat.label}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                    >
                      <Card className="bg-white/5 border-white/10 backdrop-blur-xl hover:bg-white/10 transition-colors">
                        <CardContent className="pt-6">
                          <div className="flex items-center justify-between mb-4">
                            <div className={`p-2 rounded-lg ${stat.bg}`}>
                              <stat.icon className={`h-5 w-5 ${stat.color}`} />
                            </div>
                            <Badge variant="outline" className="text-[10px] text-gray-500 border-white/10 font-bold uppercase tracking-widest">Live</Badge>
                          </div>
                          <div className="text-3xl font-black text-white">{stat.value}</div>
                          <div className="text-sm text-gray-400 mt-1">{stat.label}</div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>

                {/* Management Tabs */}
                <Tabs defaultValue="announcements" className="space-y-8">
                  <TabsList className="bg-white/5 border border-white/10 p-1 h-14 rounded-2xl">
                    <TabsTrigger value="announcements" className="px-8 rounded-xl data-[state=active]:bg-blue-600 data-[state=active]:text-white">Signals</TabsTrigger>
                    <TabsTrigger value="users" className="px-8 rounded-xl data-[state=active]:bg-blue-600 data-[state=active]:text-white">Musicians</TabsTrigger>
                    <TabsTrigger value="system" className="px-8 rounded-xl data-[state=active]:bg-blue-600 data-[state=active]:text-white">System Config</TabsTrigger>
                  </TabsList>

                  <TabsContent value="announcements" className="mt-0 ring-0 outline-none">
                    <Card className="bg-white/5 border-white/10 backdrop-blur-xl">
                      <CardHeader>
                        <CardTitle className="text-white text-xl">Active Signal Management</CardTitle>
                        <CardDescription className="text-gray-400">Moderating global and local recruitment posts</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="relative overflow-x-auto">
                          <Table>
                            <TableHeader className="border-white/10">
                              <TableRow className="hover:bg-transparent border-white/10">
                                <TableHead className="text-gray-400">Origin</TableHead>
                                <TableHead className="text-gray-400">Signal Title</TableHead>
                                <TableHead className="text-gray-400">Source Identity</TableHead>
                                <TableHead className="text-gray-400">Status</TableHead>
                                <TableHead className="text-gray-400">Date</TableHead>
                                <TableHead className="text-right text-gray-400">Actions</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {announcements.map((ad, idx) => (
                                <motion.tr
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  transition={{ delay: idx * 0.05 }}
                                  key={ad.id}
                                  className="border-white/5 hover:bg-white/5 transition-colors group"
                                >
                                  <TableCell>
                                    <Badge variant="outline" className={ad.source === 'local' ? 'border-amber-500/30 text-amber-500 bg-amber-500/5' : 'border-blue-500/30 text-blue-500 bg-blue-500/5'}>
                                      {ad.source.toUpperCase()}
                                    </Badge>
                                  </TableCell>
                                  <TableCell className="font-medium max-w-[200px]">
                                    <div className="truncate text-white">{ad.title}</div>
                                    <div className="text-xs text-gray-500 mt-1">{ad.instrument_needed}</div>
                                  </TableCell>
                                  <TableCell className="text-gray-300">
                                    {ad.profiles?.username || 'Anonymous'}
                                  </TableCell>
                                  <TableCell>
                                    <div className="flex items-center gap-2">
                                      <div className={`w - 2 h - 2 rounded - full ${ad.status === 'active' ? 'bg-emerald-500' : 'bg-rose-500'} animate - pulse`} />
                                      <span className="text-sm capitalize text-gray-300">{ad.status}</span>
                                    </div>
                                  </TableCell>
                                  <TableCell className="text-gray-400 text-sm">
                                    {format(new Date(ad.created_at), 'MMM dd, yyyy')}
                                  </TableCell>
                                  <TableCell className="text-right">
                                    <div className="flex justify-end gap-1 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleToggleStatus(ad)}
                                        className="text-gray-400 hover:text-white hover:bg-white/10"
                                      >
                                        {ad.status === 'active' ? <Ban className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                                      </Button>
                                      <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                          <Button variant="ghost" size="icon" className="text-rose-400 hover:text-rose-500 hover:bg-rose-500/10">
                                            <Trash2 className="h-4 w-4" />
                                          </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent className="bg-[#121212] border-white/10 text-white">
                                          <AlertDialogHeader>
                                            <AlertDialogTitle>Delete Signal?</AlertDialogTitle>
                                            <AlertDialogDescription className="text-gray-400">
                                              This action is irreversible. The signal will be permanently removed from {ad.source} storage.
                                            </AlertDialogDescription>
                                          </AlertDialogHeader>
                                          <AlertDialogFooter>
                                            <AlertDialogCancel className="bg-white/5 border-white/10 hover:bg-white/10 text-white">Cancel</AlertDialogCancel>
                                            <AlertDialogAction
                                              onClick={() => handleDeleteAd(ad)}
                                              className="bg-rose-600 hover:bg-rose-500 text-white"
                                            >
                                              Terminate Signal
                                            </AlertDialogAction>
                                          </AlertDialogFooter>
                                        </AlertDialogContent>
                                      </AlertDialog>
                                    </div>
                                  </TableCell>
                                </motion.tr>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="users" className="mt-0 ring-0 outline-none">
                    <Card className="bg-white/5 border-white/10 backdrop-blur-xl">
                      <CardHeader>
                        <CardTitle className="text-white text-xl">Musician Directory</CardTitle>
                        <CardDescription className="text-gray-400">Managing identities across the ecosystem</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="relative overflow-x-auto">
                          <Table>
                            <TableHeader className="border-white/10">
                              <TableRow className="hover:bg-transparent border-white/10">
                                <TableHead className="text-gray-400">Identity</TableHead>
                                <TableHead className="text-gray-400">Origin</TableHead>
                                <TableHead className="text-gray-400">Access Level</TableHead>
                                <TableHead className="text-gray-400">Activation Date</TableHead>
                                <TableHead className="text-right text-gray-400">Operations</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {users.map((u, i) => (
                                <TableRow key={u.id} className="border-white/5 hover:bg-white/5 transition-colors group">
                                  <TableCell className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 p-[1px]">
                                      <div className="w-full h-full rounded-[11px] bg-[#050505] flex items-center justify-center text-white font-black text-xs uppercase">
                                        {u.username?.[0] || u.email?.[0] || '?'}
                                      </div>
                                    </div>
                                    <div>
                                      <div className="text-white font-bold">{u.full_name || 'Incognito Artist'}</div>
                                      <div className="text-[10px] text-gray-500 uppercase tracking-widest">{u.email}</div>
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <Badge variant="outline" className={u.source === 'local' ? 'border-amber-500/30 text-amber-500' : 'border-blue-500/30 text-blue-500'}>
                                      {u.source?.toUpperCase()}
                                    </Badge>
                                  </TableCell>
                                  <TableCell>
                                    <div className="flex gap-2">
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        disabled={u.id === user.id}
                                        onClick={() => handleUpdateRole(u, u.role === 'admin' ? 'user' : 'admin')}
                                        className={`h - 7 px - 3 rounded - lg text - [10px] font - black uppercase tracking - widest ${u.role === 'admin' ? 'bg-purple-500/10 text-purple-400 hover:bg-purple-500/20' : 'bg-white/5 text-gray-400'} `}
                                      >
                                        {u.role || 'user'}
                                      </Button>
                                    </div>
                                  </TableCell>
                                  <TableCell className="text-gray-400 text-sm">
                                    {u.created_at ? format(new Date(u.created_at), 'MMM dd, yyyy') : 'Recent Signal'}
                                  </TableCell>
                                  <TableCell className="text-right">
                                    <div className="flex justify-end gap-2">
                                      <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                          <Button
                                            variant="ghost"
                                            size="icon"
                                            disabled={u.id === user.id}
                                            className="text-rose-400 hover:text-rose-500 hover:bg-rose-500/10 h-8 w-8 rounded-lg"
                                          >
                                            <UserX className="h-4 w-4" />
                                          </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent className="bg-[#121212] border-white/10 text-white">
                                          <AlertDialogHeader>
                                            <AlertDialogTitle>Revoke Access?</AlertDialogTitle>
                                            <AlertDialogDescription className="text-gray-400">
                                              You are about to terminate this identity's access to the ecosystem. All associated signals will remain but the identity profile will be purged.
                                            </AlertDialogDescription>
                                          </AlertDialogHeader>
                                          <AlertDialogFooter>
                                            <AlertDialogCancel className="bg-white/5 border border-white/10 text-white">Abort</AlertDialogCancel>
                                            <AlertDialogAction onClick={() => handleDeleteUser(u)} className="bg-rose-600 hover:bg-rose-500 text-white">Execute Purge</AlertDialogAction>
                                          </AlertDialogFooter>
                                        </AlertDialogContent>
                                      </AlertDialog>
                                    </div>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="system" className="mt-0 ring-0 outline-none">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <Card className="bg-white/5 border-white/10 backdrop-blur-xl">
                        <CardHeader>
                          <CardTitle className="text-white text-xl">Core Protocols</CardTitle>
                          <CardDescription className="text-gray-400">Global ecological constraints</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                          {[
                            { label: 'Dual-Layer DB Sync', desc: 'Maintain real-time persistence between cloud and local buffers', active: true },
                            { label: 'Signal Encryption', desc: 'Quantum-level masking for private recruitment phases', active: true },
                            { label: 'AI Moderation', desc: 'Heuristic analysis of broadcast content for safety', active: false },
                            { label: 'Identity Verification', desc: 'Secure biometric-based identity checks for artists', active: false },
                          ].map((sys, idx) => (
                            <div key={idx} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 group hover:border-blue-500/30 transition-all">
                              <div>
                                <p className="text-white font-bold">{sys.label}</p>
                                <p className="text-xs text-gray-500 mt-1">{sys.desc}</p>
                              </div>
                              <div className={`h - 6 w - 12 rounded - full p - 1 transition - colors ${sys.active ? 'bg-blue-600' : 'bg-white/10'} `}>
                                <div className={`h - 4 w - 4 rounded - full bg - white transition - transform ${sys.active ? 'translate-x-6' : 'translate-x-0'} `} />
                              </div>
                            </div>
                          ))}
                        </CardContent>
                      </Card>

                      <Card className="bg-white/5 border-white/10 backdrop-blur-xl h-fit">
                        <CardHeader>
                          <CardTitle className="text-white text-xl">System Hard Drive</CardTitle>
                          <CardDescription className="text-gray-400">Ecosystem diagnostic view</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-8">
                          <div>
                            <div className="flex justify-between text-xs mb-2">
                              <span className="text-gray-400 font-bold uppercase tracking-wider">Storage Load</span>
                              <span className="text-blue-400">12.4 GB / 50 GB</span>
                            </div>
                            <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                              <div className="h-full bg-blue-600 w-[25%]" />
                            </div>
                          </div>
                          <div>
                            <div className="flex justify-between text-xs mb-2">
                              <span className="text-gray-400 font-bold uppercase tracking-wider">Network Throughput</span>
                              <span className="text-purple-400 font-bold">1.2 TB / Mo</span>
                            </div>
                            <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                              <div className="h-full bg-purple-600 w-[45%]" />
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
                            <div>
                              <p className="text-[10px] text-gray-500 uppercase font-black mb-1">Response Time</p>
                              <p className="text-white font-bold">14ms</p>
                            </div>
                            <div>
                              <p className="text-[10px] text-gray-500 uppercase font-black mb-1">Up-time</p>
                              <p className="text-white font-bold">99.98%</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            )}
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default Admin;
