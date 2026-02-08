import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Music, Loader2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const registerSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  username: z.string().min(3, 'Username must be at least 3 characters'),
  fullName: z.string().min(2, 'Please enter your full name'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

const forgotSchema = z.object({
  email: z.string().email('Please enter a valid email'),
});

type AuthMode = 'login' | 'register' | 'forgot';

const Auth: React.FC = () => {
  const { t } = useTranslation();
  const { user, signIn, signUp, resetPassword } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [mode, setMode] = useState<AuthMode>((searchParams.get('mode') as AuthMode) || 'login');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const registerForm = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: { email: '', username: '', fullName: '', password: '', confirmPassword: '' },
  });

  const forgotForm = useForm<z.infer<typeof forgotSchema>>({
    resolver: zodResolver(forgotSchema),
    defaultValues: { email: '' },
  });

  const handleLogin = async (data: z.infer<typeof loginSchema>) => {
    setLoading(true);
    const { error } = await signIn(data.email, data.password);
    setLoading(false);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success(t('auth.loginSuccess'));
      navigate('/');
    }
  };

  const handleRegister = async (data: z.infer<typeof registerSchema>) => {
    setLoading(true);
    const { error } = await signUp(data.email, data.password, {
      username: data.username,
      full_name: data.fullName,
    });
    setLoading(false);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success(t('auth.registerSuccess'));
      setMode('login');
    }
  };

  const handleForgotPassword = async (data: z.infer<typeof forgotSchema>) => {
    setLoading(true);
    const { error } = await resetPassword(data.email);
    setLoading(false);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success(t('auth.resetSent'));
      setMode('login');
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <motion.div
          key={mode}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          transition={{ duration: 0.3 }}
          className="w-full max-w-md"
        >
          <Link to="/" className="inline-flex items-center gap-2 mb-8 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" />
            {t('common.back')}
          </Link>

          <Card className="border-0 shadow-xl">
            <CardHeader className="text-center pb-2">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                <Music className="h-8 w-8" />
              </div>
              <CardTitle className="text-2xl">
                {mode === 'login' && t('auth.loginTitle')}
                {mode === 'register' && t('auth.registerTitle')}
                {mode === 'forgot' && t('auth.forgotTitle')}
              </CardTitle>
              <CardDescription>
                {mode === 'login' && t('auth.loginSubtitle')}
                {mode === 'register' && t('auth.registerSubtitle')}
                {mode === 'forgot' && t('auth.forgotSubtitle')}
              </CardDescription>
            </CardHeader>

            <CardContent className="pt-6">
              {mode === 'login' && (
                <Form {...loginForm}>
                  <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-4">
                    <FormField
                      control={loginForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('auth.email')}</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="you@example.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={loginForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('auth.password')}</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input
                                type={showPassword ? 'text' : 'password'}
                                placeholder="••••••••"
                                {...field}
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="absolute right-0 top-0 h-full px-3"
                                onClick={() => setShowPassword(!showPassword)}
                              >
                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                              </Button>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex items-center justify-end">
                      <button
                        type="button"
                        onClick={() => setMode('forgot')}
                        className="text-sm text-primary hover:underline"
                      >
                        {t('auth.forgotPassword')}
                      </button>
                    </div>

                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      {t('auth.signIn')}
                    </Button>

                    <p className="text-center text-sm text-muted-foreground">
                      {t('auth.noAccount')}{' '}
                      <button
                        type="button"
                        onClick={() => setMode('register')}
                        className="text-primary hover:underline font-medium"
                      >
                        {t('auth.signUp')}
                      </button>
                    </p>
                  </form>
                </Form>
              )}

              {mode === 'register' && (
                <Form {...registerForm}>
                  <form onSubmit={registerForm.handleSubmit(handleRegister)} className="space-y-4">
                    <FormField
                      control={registerForm.control}
                      name="fullName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('auth.fullName')}</FormLabel>
                          <FormControl>
                            <Input placeholder="John Doe" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={registerForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('auth.username')}</FormLabel>
                          <FormControl>
                            <Input placeholder="johndoe" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={registerForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('auth.email')}</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="you@example.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={registerForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('auth.password')}</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input
                                type={showPassword ? 'text' : 'password'}
                                placeholder="••••••••"
                                {...field}
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="absolute right-0 top-0 h-full px-3"
                                onClick={() => setShowPassword(!showPassword)}
                              >
                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                              </Button>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={registerForm.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('auth.confirmPassword')}</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="••••••••" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      {t('auth.signUp')}
                    </Button>

                    <p className="text-center text-sm text-muted-foreground">
                      {t('auth.hasAccount')}{' '}
                      <button
                        type="button"
                        onClick={() => setMode('login')}
                        className="text-primary hover:underline font-medium"
                      >
                        {t('auth.signIn')}
                      </button>
                    </p>
                  </form>
                </Form>
              )}

              {mode === 'forgot' && (
                <Form {...forgotForm}>
                  <form onSubmit={forgotForm.handleSubmit(handleForgotPassword)} className="space-y-4">
                    <FormField
                      control={forgotForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('auth.email')}</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="you@example.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      {t('auth.sendReset')}
                    </Button>

                    <button
                      type="button"
                      onClick={() => setMode('login')}
                      className="w-full text-center text-sm text-primary hover:underline"
                    >
                      {t('auth.backToLogin')}
                    </button>
                  </form>
                </Form>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Right Side - Branding */}
      <div className="hidden lg:flex flex-1 items-center justify-center bg-gradient-to-br from-primary to-primary/80 p-12">
        <div className="max-w-md text-center text-primary-foreground">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-2xl bg-primary-foreground/20 backdrop-blur">
              <Music className="h-12 w-12" />
            </div>
            <h2 className="mb-4 text-3xl font-bold">MyDummer</h2>
            <p className="text-lg opacity-90">
              Join thousands of musicians and find your perfect bandmate. 
              Connect, collaborate, and create music together.
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
