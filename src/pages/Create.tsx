import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Music2, ArrowLeft, Send, Sparkles, MapPin, Globe, Clock, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import Layout from '@/components/layout/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { db } from '@/lib/db';

const createSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(100),
  description: z.string().min(20, 'Description must be at least 20 characters').max(1000),
  instrument_needed: z.enum(['drums', 'guitar', 'bass', 'keyboard', 'vocals', 'violin', 'saxophone', 'trumpet', 'flute', 'other']),
  location: z.string().min(2, 'Please enter a location').max(100),
  genre: z.string().max(50).optional(),
  experience_required: z.string().max(100).optional(),
  contact_email: z.string().email('Please enter a valid email'),
  contact_phone: z.string().max(20).optional(),
});

type CreateFormData = z.infer<typeof createSchema>;

const Create: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const form = useForm<CreateFormData>({
    resolver: zodResolver(createSchema),
    defaultValues: {
      title: '',
      description: '',
      instrument_needed: 'drums',
      location: '',
      genre: '',
      experience_required: '',
      contact_email: user?.email || '',
      contact_phone: '',
    },
  });

  const instruments = [
    'drums', 'guitar', 'bass', 'keyboard', 'vocals',
    'violin', 'saxophone', 'trumpet', 'flute', 'other'
  ] as const;

  const onSubmit = async (data: CreateFormData) => {
    if (!user) {
      toast.error('Please login to create an announcement');
      navigate('/auth');
      return;
    }

    setLoading(true);
    try {
      // 1. Save to Local DB (Always for persistence in this specific user requirement)
      db.addAnnouncement({
        user_id: user.id,
        title: data.title,
        description: data.description,
        instrument_needed: data.instrument_needed,
        location: data.location,
        genre: data.genre || null,
        experience_required: data.experience_required || null,
        contact_email: data.contact_email,
        contact_phone: data.contact_phone || null,
        status: 'active'
      });

      // 2. Save to Supabase (Only if it's a real cloud user)
      if (user.id && !user.id.includes('admin')) {
        const { error } = await supabase.from('announcements').insert({
          user_id: user.id,
          title: data.title,
          description: data.description,
          instrument_needed: data.instrument_needed,
          location: data.location,
          genre: data.genre || null,
          experience_required: data.experience_required || null,
          contact_email: data.contact_email,
          contact_phone: data.contact_phone || null,
          status: 'active',
        });
        if (error) throw error;
      }

      toast.success('Your announcement is now live in the Master Feed!');
      navigate('/browse');
    } catch (error: any) {
      console.error('Error creating announcement:', error);
      toast.error(error.message || 'Transmission failed. Ensure your signal is strong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-[#020202] text-white py-20 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/5 blur-[150px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-600/5 blur-[150px] pointer-events-none" />

        <div className="container max-w-4xl px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-12"
          >
            <Button
              variant="ghost"
              onClick={() => navigate(-1)}
              className="text-gray-400 hover:text-white hover:bg-white/5 rounded-xl mb-8"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Feed
            </Button>

            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-blue-600/20 rounded-2xl border border-blue-500/30">
                <Plus className="w-8 h-8 text-blue-400" />
              </div>
              <div>
                <h1 className="text-4xl font-bold tracking-tight text-white">Broadcast Your Need</h1>
                <p className="text-gray-400">Assemble your dream ensemble. Recruit the masters.</p>
              </div>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Card className="bg-white/5 border-white/10 backdrop-blur-xl rounded-[2.5rem] overflow-hidden">
                  <CardHeader className="p-8 pb-4">
                    <CardTitle className="text-xl text-white">Announcement Details</CardTitle>
                    <CardDescription className="text-gray-500">Provide deep context for potential collaborators.</CardDescription>
                  </CardHeader>

                  <CardContent className="p-8 pt-4">
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                        <FormField
                          control={form.control}
                          name="title"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-gray-300">Epic Title</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="e.g. Master Drummer needed for Cinematic Jazz Fusion"
                                  className="bg-white/5 border-white/10 text-white rounded-xl h-12 focus:ring-blue-500/50"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="description"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-gray-300">The Vision</FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder="Describe the soul of the project, the vibe, and what you expect from a partner..."
                                  className="min-h-40 bg-white/5 border-white/10 text-white rounded-2xl resize-none focus:ring-blue-500/50"
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
                            name="instrument_needed"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-gray-300">Core Vacancy</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger className="bg-white/5 border-white/10 text-white rounded-xl h-12">
                                      <SelectValue />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent className="bg-[#0f0f0f] border-white/10 text-white">
                                    {instruments.map((inst) => (
                                      <SelectItem key={inst} value={inst}>
                                        {inst.charAt(0).toUpperCase() + inst.slice(1)}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="location"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-gray-300">Base of Operations</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="City, Studio, or Virtual"
                                    className="bg-white/5 border-white/10 text-white rounded-xl h-12"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <FormField
                            control={form.control}
                            name="genre"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-gray-300">Genre/Style</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="e.g. Progressive Metal, Lo-fi"
                                    className="bg-white/5 border-white/10 text-white rounded-xl h-12"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="experience_required"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-gray-300">Standing Required</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="e.g. 5+ years, Expert"
                                    className="bg-white/5 border-white/10 text-white rounded-xl h-12"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className="pt-8 border-t border-white/5">
                          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-widest mb-6 px-1">Communication Channels</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField
                              control={form.control}
                              name="contact_email"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-gray-300">Encrypted Email</FormLabel>
                                  <FormControl>
                                    <Input type="email" className="bg-white/5 border-white/10 text-white rounded-xl h-12" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="contact_phone"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-gray-300">Direct Comms (Optional)</FormLabel>
                                  <FormControl>
                                    <Input type="tel" className="bg-white/5 border-white/10 text-white rounded-xl h-12" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>

                        <Button type="submit" className="w-full h-14 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl text-lg font-bold shadow-xl shadow-blue-600/20" disabled={loading}>
                          {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Send className="mr-2 h-5 w-5" />}
                          Broadcast Signal
                        </Button>
                      </form>
                    </Form>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card className="bg-gradient-to-br from-blue-600 to-purple-700 border-0 rounded-[2.5rem] p-8 text-white">
                  <Sparkles className="w-10 h-10 mb-4 opacity-50" />
                  <h3 className="text-2xl font-bold mb-2">Master Tip</h3>
                  <p className="text-white/80 text-sm leading-relaxed">
                    Detailed descriptions attract higher caliber talent. Be specific about your gear requirements and session frequency.
                  </p>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="space-y-4"
              >
                <div className="bg-white/5 border border-white/10 p-6 rounded-[2rem] flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                    <Globe className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-white text-sm font-bold">Global Reach</p>
                    <p className="text-gray-500 text-[10px] uppercase">Distributed ecosystem</p>
                  </div>
                </div>
                <div className="bg-white/5 border border-white/10 p-6 rounded-[2rem] flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
                    <Clock className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <p className="text-white text-sm font-bold">Instant Signal</p>
                    <p className="text-gray-500 text-[10px] uppercase">Real-time broadcasting</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Create;

