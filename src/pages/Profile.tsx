import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  User,
  MapPin,
  Music2,
  Clock,
  Loader2,
  Edit,
  Trash2,
  Mail,
  Camera,
  Share2,
  Globe,
  Instagram,
  Twitter,
  Settings,
  Shield,
  Briefcase
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
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
import { db } from '@/lib/db';

const profileSchema = z.object({
  username: z.string().min(3).max(50).optional(),
  full_name: z.string().min(2).max(100).optional(),
  bio: z.string().max(500).optional(),
  location: z.string().max(100).optional(),
  experience_years: z.number().min(0).max(100).optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

const Profile: React.FC = () => {
  const { t } = useTranslation();
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      username: '',
      full_name: '',
      bio: '',
      location: '',
      experience_years: 0,
    },
  });

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    fetchData();
  }, [user]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch profile from Supabase
      const { data: profileData, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user?.id)
        .maybeSingle();

      // Fallback to local DB if it's our hardcoded admin or if Supabase profile doesn't exist
      const localUser = db.getUsers().find(u => u.id === user?.id || u.email === (user as any).email);

      const combinedProfile = profileData || localUser;
      setProfile(combinedProfile);

      if (combinedProfile) {
        form.reset({
          username: combinedProfile.username || '',
          full_name: combinedProfile.full_name || '',
          bio: combinedProfile.bio || '',
          location: combinedProfile.location || '',
          experience_years: combinedProfile.experience_years || 0,
        });
      }

      // Fetch announcements
      const { data: adsData } = await supabase
        .from('announcements')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      const localAds = db.getAnnouncements().filter(a => a.user_id === user?.id);
      setAnnouncements([...(adsData || []), ...localAds]);

    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: ProfileFormData) => {
    setSaving(true);
    try {
      // Update in Supabase
      if (user?.id && !user.id.includes('admin')) {
        const { error } = await supabase
          .from('profiles')
          .update(data)
          .eq('user_id', user.id);
        if (error) throw error;
      } else {
        // Update in local DB
        db.updateUser(user?.id || 'admin-id', data as any);
      }

      toast.success('Profile updated successfully');
      setIsEditing(false);
      fetchData();
    } catch (err: any) {
      toast.error(err.message || 'Error updating profile');
    } finally {
      setSaving(false);
    }
  };

  if (!user) return null;

  return (
    <Layout>
      <div className="min-h-screen bg-[#020202] text-white">
        {/* Cinematic Header Background */}
        <div className="relative h-[300px] w-full overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-blue-600/20 via-transparent to-[#020202]" />
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1514525253361-bee243870eb2?q=80&w=2000')] bg-cover bg-center grayscale opacity-30" />
          <div className="absolute inset-0 backdrop-blur-[2px]" />
        </div>

        <div className="container max-w-6xl px-4 -mt-32 relative z-10 pb-20">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar / Profile Info */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:w-1/3"
            >
              <Card className="bg-white/5 border-white/10 backdrop-blur-2xl sticky top-24 overflow-hidden">
                <div className="h-2 w-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />
                <CardContent className="pt-8 flex flex-col items-center text-center">
                  <div className="relative group">
                    <div className="w-32 h-32 rounded-3xl bg-gradient-to-br from-blue-500 to-purple-600 p-1 rotate-3 group-hover:rotate-0 transition-transform duration-500">
                      <div className="w-full h-full rounded-2xl bg-[#020202] flex items-center justify-center overflow-hidden">
                        {profile?.avatar_url ? (
                          <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                          <User className="w-16 h-16 text-white/20" />
                        )}
                      </div>
                    </div>
                    <Button size="icon" variant="ghost" className="absolute -bottom-2 -right-2 bg-white/10 backdrop-blur-md rounded-xl border border-white/10 text-white hover:bg-white/20">
                      <Camera className="w-4 h-4" />
                    </Button>
                  </div>

                  <h2 className="mt-6 text-2xl font-bold text-white tracking-tight">
                    {profile?.full_name || 'Musician'}
                  </h2>
                  <p className="text-blue-400 font-medium text-sm">@{profile?.username || 'unknown'}</p>

                  <div className="flex gap-2 mt-4">
                    {isAdmin && (
                      <Badge className="bg-blue-500/10 text-blue-400 border border-blue-500/20">
                        <Shield className="w-3 h-3 mr-1" /> Master Admin
                      </Badge>
                    )}
                    <Badge className="bg-white/5 text-white/60 border border-white/10">
                      <Music2 className="w-3 h-3 mr-1" /> Artist
                    </Badge>
                  </div>

                  <p className="mt-6 text-gray-400 text-sm leading-relaxed max-w-[250px]">
                    {profile?.bio || 'No bio provided yet. Share your musical journey with the community.'}
                  </p>

                  <div className="grid grid-cols-2 w-full gap-4 mt-8">
                    <div className="p-3 bg-white/5 rounded-2xl border border-white/10">
                      <p className="text-xs text-gray-500 uppercase tracking-wider">Posts</p>
                      <p className="text-xl font-bold text-white">{announcements.length}</p>
                    </div>
                    <div className="p-3 bg-white/5 rounded-2xl border border-white/10">
                      <p className="text-xs text-gray-500 uppercase tracking-wider">EXP</p>
                      <p className="text-xl font-bold text-white">{profile?.experience_years || 0}y</p>
                    </div>
                  </div>

                  <div className="w-full mt-8 pt-8 border-t border-white/10 space-y-3">
                    <div className="flex items-center gap-3 text-gray-400 text-sm">
                      <Mail className="w-4 h-4 text-blue-400" />
                      <span>{user?.email}</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-400 text-sm">
                      <MapPin className="w-4 h-4 text-blue-400" />
                      <span>{profile?.location || 'Universal Studio'}</span>
                    </div>
                  </div>

                  <div className="flex justify-center gap-3 mt-8">
                    <Button size="icon" variant="outline" className="rounded-full bg-white/5 border-white/10 hover:bg-blue-500/20 hover:border-blue-500/40">
                      <Globe className="w-4 h-4" />
                    </Button>
                    <Button size="icon" variant="outline" className="rounded-full bg-white/5 border-white/10 hover:bg-pink-500/20 hover:border-pink-500/40">
                      <Instagram className="w-4 h-4" />
                    </Button>
                    <Button size="icon" variant="outline" className="rounded-full bg-white/5 border-white/10 hover:bg-blue-400/20 hover:border-blue-400/40">
                      <Twitter className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Main Content Areas */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="lg:w-2/3"
            >
              <Tabs defaultValue="overview" className="space-y-6">
                <div className="flex items-center justify-between bg-white/5 backdrop-blur-xl p-2 rounded-2xl border border-white/10">
                  <TabsList className="bg-transparent border-0 gap-2">
                    <TabsTrigger value="overview" className="data-[state=active]:bg-white/10 rounded-xl px-6 py-2 transition-all">Overview</TabsTrigger>
                    <TabsTrigger value="settings" className="data-[state=active]:bg-white/10 rounded-xl px-6 py-2 transition-all">Settings</TabsTrigger>
                    <TabsTrigger value="content" className="data-[state=active]:bg-white/10 rounded-xl px-6 py-2 transition-all">My Content</TabsTrigger>
                  </TabsList>
                  <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                    <Share2 className="w-4 h-4 mr-2" /> Share
                  </Button>
                </div>

                <TabsContent value="overview" className="mt-0 outline-none">
                  <div className="space-y-6">
                    {/* Professional Bio Section */}
                    <Card className="bg-white/5 border-white/10 backdrop-blur-xl overflow-hidden">
                      <CardHeader>
                        <div className="flex items-center gap-2">
                          <Briefcase className="w-5 h-5 text-blue-400" />
                          <CardTitle className="text-white">Professional Background</CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-300 italic leading-relaxed">
                          {profile?.bio || "You haven't added a professional biography yet. Start by editing your profile to tell others about your musical style, equipment, and goals."}
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                          <div className="space-y-4">
                            <h4 className="text-sm font-semibold text-white uppercase tracking-wider">Expertise</h4>
                            <div className="flex flex-wrap gap-2">
                              {['Rhythm', 'Composition', 'Theory', 'Live Performance'].map(tag => (
                                <Badge key={tag} className="bg-blue-500/10 text-blue-400 border-blue-500/20">{tag}</Badge>
                              ))}
                            </div>
                          </div>
                          <div className="space-y-4">
                            <h4 className="text-sm font-semibold text-white uppercase tracking-wider">Instruments</h4>
                            <div className="flex flex-wrap gap-2">
                              {profile?.instruments?.map((ins: string) => (
                                <Badge key={ins} variant="outline" className="border-purple-500/30 text-purple-400">{ins}</Badge>
                              )) || <span className="text-gray-500 text-xs italic">No instruments listed</span>}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Stats or Featured Items */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Card className="bg-white/5 border-white/10 backdrop-blur-xl group hover:border-blue-500/30 transition-all">
                        <CardContent className="p-6">
                          <div className="flex justify-between items-start">
                            <div className="p-3 bg-blue-500/10 rounded-xl">
                              <Music2 className="w-6 h-6 text-blue-400" />
                            </div>
                            <span className="text-[10px] text-blue-400 font-bold bg-blue-400/10 px-2 py-0.5 rounded-full uppercase">Active</span>
                          </div>
                          <h3 className="mt-4 text-xl font-bold text-white">Music Projects</h3>
                          <p className="text-gray-400 text-sm mt-1">Ongoing collaborations and band activities.</p>
                          <div className="mt-6 flex -space-x-3">
                            {[1, 2, 3].map(i => (
                              <div key={i} className="w-8 h-8 rounded-full border-2 border-[#020202] bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-[10px] font-bold">P{i}</div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                      <Card className="bg-white/5 border-white/10 backdrop-blur-xl group hover:border-purple-500/30 transition-all">
                        <CardContent className="p-6">
                          <div className="flex justify-between items-start">
                            <div className="p-3 bg-purple-500/10 rounded-xl">
                              <Clock className="w-6 h-6 text-purple-400" />
                            </div>
                            <span className="text-[10px] text-purple-400 font-bold bg-purple-400/10 px-2 py-0.5 rounded-full uppercase">Verified</span>
                          </div>
                          <h3 className="mt-4 text-xl font-bold text-white">Experience Level</h3>
                          <p className="text-gray-400 text-sm mt-1">Professional standing in the industry.</p>
                          <p className="mt-4 text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
                            {profile?.experience_years > 5 ? 'MASTER' : 'PRO'} ARTIST
                          </p>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="settings" className="mt-0 outline-none">
                  <Card className="bg-white/5 border-white/10 backdrop-blur-xl">
                    <CardHeader className="flex flex-row items-center justify-between">
                      <div>
                        <CardTitle className="text-white text-xl">Identity Settings</CardTitle>
                        <CardDescription className="text-gray-400">Refine how you appear to other master musicians</CardDescription>
                      </div>
                      {!isEditing && (
                        <Button variant="ghost" onClick={() => setIsEditing(true)} className="bg-white/10 hover:bg-white/20 text-white rounded-xl">
                          <Edit className="h-4 w-4 mr-2" />
                          Modify
                        </Button>
                      )}
                    </CardHeader>
                    <CardContent>
                      {isEditing ? (
                        <Form {...form}>
                          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <FormField
                                control={form.control}
                                name="full_name"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="text-gray-300">Stage Name / Full Name</FormLabel>
                                    <FormControl>
                                      <Input className="bg-white/5 border-white/10 text-white" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={form.control}
                                name="username"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="text-gray-300">Unique Handle</FormLabel>
                                    <FormControl>
                                      <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">@</span>
                                        <Input className="bg-white/5 border-white/10 text-white pl-8" {...field} />
                                      </div>
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>

                            <FormField
                              control={form.control}
                              name="bio"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-gray-300">Professional Bio</FormLabel>
                                  <FormControl>
                                    <Textarea
                                      placeholder="Describe your artistic vision..."
                                      className="min-h-32 bg-white/5 border-white/10 text-white resize-none"
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <FormField
                                control={form.control}
                                name="location"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="text-gray-300">Home Base</FormLabel>
                                    <FormControl>
                                      <Input className="bg-white/5 border-white/10 text-white" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={form.control}
                                name="experience_years"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="text-gray-300">Years Active</FormLabel>
                                    <FormControl>
                                      <Input
                                        type="number"
                                        className="bg-white/5 border-white/10 text-white"
                                        {...field}
                                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>

                            <div className="flex gap-4 p-4 bg-white/5 rounded-2xl border border-white/10">
                              <Button type="submit" disabled={saving} className="bg-blue-600 hover:bg-blue-500 text-white">
                                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Commit Changes
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                className="text-gray-400 hover:text-white"
                                onClick={() => {
                                  setIsEditing(false);
                                  fetchData();
                                }}
                              >
                                Abort
                              </Button>
                            </div>
                          </form>
                        </Form>
                      ) : (
                        <div className="text-center py-12">
                          <Settings className="w-12 h-12 text-white/5 mx-auto mb-4" />
                          <p className="text-gray-500">Security and advanced settings are managed separately.</p>
                          <Button variant="link" className="text-blue-400 mt-2" onClick={() => setIsEditing(true)}>Edit basic identity details</Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="content" className="mt-0 outline-none">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key="content-list"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="grid grid-cols-1 gap-6"
                    >
                      {announcements.length === 0 ? (
                        <div className="text-center py-24 bg-white/5 rounded-3xl border border-dashed border-white/10">
                          <Music2 className="mx-auto h-16 w-16 text-white/10 mb-6" />
                          <h3 className="text-xl font-bold text-white">The Stage is Quiet</h3>
                          <p className="text-gray-500 max-w-xs mx-auto mt-2">
                            You haven't posted any announcements or advertisements yet.
                          </p>
                          <Button className="mt-8 bg-white text-black hover:bg-white/90" onClick={() => navigate('/create')}>
                            Create First Post
                          </Button>
                        </div>
                      ) : (
                        announcements.map((ad, idx) => (
                          <motion.div
                            key={ad.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                          >
                            <Card className="bg-white/5 border-white/10 backdrop-blur-xl group hover:border-white/20 transition-all">
                              <CardContent className="p-6">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-3 mb-2">
                                      <Badge className={ad.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'}>
                                        {ad.status.toUpperCase()}
                                      </Badge>
                                      <span className="text-gray-500 text-xs">{format(new Date(ad.created_at), 'MMMM dd, yyyy')}</span>
                                    </div>
                                    <h4 className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors truncate">{ad.title}</h4>
                                    <div className="flex items-center gap-2 mt-2 text-gray-400 text-sm">
                                      <Music2 className="w-3 h-3" />
                                      <span>Seeking: {ad.instrument_needed}</span>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white hover:bg-white/10">
                                      <Edit className="w-4 h-4" />
                                    </Button>
                                    <AlertDialog>
                                      <AlertDialogTrigger asChild>
                                        <Button variant="ghost" size="icon" className="text-rose-400 hover:text-rose-500 hover:bg-rose-500/10">
                                          <Trash2 className="w-4 h-4" />
                                        </Button>
                                      </AlertDialogTrigger>
                                      <AlertDialogContent className="bg-[#121212] border-white/10 text-white">
                                        <AlertDialogHeader>
                                          <AlertDialogTitle>Permanent Deletion?</AlertDialogTitle>
                                          <AlertDialogDescription className="text-gray-400">
                                            This will remove your announcement from the Master Feed forever.
                                          </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                          <AlertDialogCancel className="bg-white/5 border-white/10 hover:bg-white/10 text-white">Cancel</AlertDialogCancel>
                                          <AlertDialogAction className="bg-rose-600 hover:bg-rose-500 text-white">Confirm</AlertDialogAction>
                                        </AlertDialogFooter>
                                      </AlertDialogContent>
                                    </AlertDialog>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          </motion.div>
                        ))
                      )}
                    </motion.div>
                  </AnimatePresence>
                </TabsContent>
              </Tabs>
            </motion.div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Profile;

