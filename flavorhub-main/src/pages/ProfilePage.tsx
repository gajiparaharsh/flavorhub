import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { useAuth } from '@/context/AuthContext';
import { useUserProfile, UserOrder } from '@/hooks/useUserProfile';
import { api } from '@/integrations/mongodb';
import { useToast } from '@/hooks/use-toast';
import {
  User, Phone, MapPin, Package, Loader2, Edit2, ChevronRight,
  Shield, Lock, KeyRound, Eye, EyeOff, AlertTriangle, Trash2,
  CheckCircle2, Mail, Calendar, Clock, ShieldCheck, ShieldAlert,
  Fingerprint, Globe, Monitor, Smartphone, Tablet, RefreshCw,
  XCircle, History
} from 'lucide-react';
import { z } from 'zod';

const profileSchema = z.object({
  full_name: z.string().trim().min(2, 'Name must be at least 2 characters').max(100),
  phone: z.string().trim().min(10, 'Please enter a valid phone number').max(15),
  address: z.string().trim().max(500).optional(),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters'),
  confirmPassword: z.string().min(1, 'Please confirm your new password'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
}).refine((data) => data.currentPassword !== data.newPassword, {
  message: 'New password must be different from current password',
  path: ['newPassword'],
});

const getStatusColor = (status: string) => {
  switch (status) {
    case 'pending': return 'bg-amber-100 text-amber-800';
    case 'confirmed': return 'bg-blue-100 text-blue-800';
    case 'preparing': return 'bg-purple-100 text-purple-800';
    case 'ready': return 'bg-cyan-100 text-cyan-800';
    case 'delivered': return 'bg-green-100 text-green-800';
    case 'cancelled': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

// Helper to get device icon
const getDeviceIcon = (device: string) => {
  switch (device?.toLowerCase()) {
    case 'mobile': return <Smartphone className="h-4 w-4" />;
    case 'tablet': return <Tablet className="h-4 w-4" />;
    default: return <Monitor className="h-4 w-4" />;
  }
};

// Helper to format relative time
const formatRelativeTime = (dateStr: string) => {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMinutes < 1) return 'Just now';
  if (diffMinutes < 60) return `${diffMinutes} min ago`;
  if (diffHours < 24) return `${diffHours} hr ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
};

const ProfilePage = () => {
  const { user, loading: authLoading, signOut } = useAuth();
  const { profile, orders, loading, updateProfile } = useUserProfile();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<UserOrder | null>(null);
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    address: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Security tab state
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>({});
  const [passwordStrength, setPasswordStrength] = useState(0);

  // Security info state
  const [securityInfo, setSecurityInfo] = useState<any>(null);
  const [loginHistory, setLoginHistory] = useState<any[]>([]);
  const [securityLoading, setSecurityLoading] = useState(false);

  // Delete account state
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        phone: profile.phone || '',
        address: profile.address || '',
      });
    }
  }, [profile]);

  // Password strength calculation
  useEffect(() => {
    const password = passwordData.newPassword;
    let strength = 0;
    if (password.length >= 6) strength += 1;
    if (password.length >= 10) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;
    setPasswordStrength(strength);
  }, [passwordData.newPassword]);

  // Fetch security info and login history
  const fetchSecurityData = async () => {
    setSecurityLoading(true);
    try {
      const [secInfo, historyData] = await Promise.all([
        api.getSecurityInfo(),
        api.getLoginHistory(),
      ]);
      setSecurityInfo(secInfo.security);
      setLoginHistory(historyData.loginHistory || []);
    } catch (error) {
      console.error('Failed to fetch security data:', error);
    } finally {
      setSecurityLoading(false);
    }
  };

  // Load security data when user is authenticated
  useEffect(() => {
    if (user) {
      fetchSecurityData();
    }
  }, [user]);

  const getStrengthLabel = () => {
    if (passwordData.newPassword.length === 0) return '';
    if (passwordStrength <= 1) return 'Weak';
    if (passwordStrength <= 2) return 'Fair';
    if (passwordStrength <= 3) return 'Good';
    if (passwordStrength <= 4) return 'Strong';
    return 'Very Strong';
  };

  const getStrengthColor = () => {
    if (passwordStrength <= 1) return 'bg-red-500';
    if (passwordStrength <= 2) return 'bg-orange-500';
    if (passwordStrength <= 3) return 'bg-yellow-500';
    if (passwordStrength <= 4) return 'bg-green-500';
    return 'bg-emerald-500';
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
    setErrors(prev => ({ ...prev, [id]: '' }));
  };

  const handlePasswordInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setPasswordData(prev => ({ ...prev, [id]: value }));
    setPasswordErrors(prev => ({ ...prev, [id]: '' }));
  };

  const handleSave = async () => {
    setErrors({});

    const result = profileSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach(err => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as string] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    setIsSaving(true);
    const { error } = await updateProfile({
      full_name: formData.full_name,
      phone: formData.phone,
      address: formData.address || null,
    });
    setIsSaving(false);

    if (!error) {
      setIsEditing(false);
    }
  };

  const handleChangePassword = async () => {
    setPasswordErrors({});

    const result = changePasswordSchema.safeParse(passwordData);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach(err => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as string] = err.message;
        }
      });
      setPasswordErrors(fieldErrors);
      return;
    }

    setIsChangingPassword(true);
    try {
      await api.changePassword(passwordData.currentPassword, passwordData.newPassword);
      toast({
        title: '✅ Password Changed',
        description: 'Your password has been updated successfully.',
      });
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setShowCurrentPassword(false);
      setShowNewPassword(false);
      setShowConfirmPassword(false);
      // Refresh security info to update password changed date
      fetchSecurityData();
    } catch (error: any) {
      if (error.message?.includes('incorrect') || error.message?.includes('Current password')) {
        setPasswordErrors({ currentPassword: 'Current password is incorrect' });
      } else {
        toast({
          title: 'Error',
          description: error.message || 'Failed to change password.',
          variant: 'destructive',
        });
      }
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeleteError('');

    if (deleteConfirmText !== 'DELETE') {
      setDeleteError('Please type DELETE to confirm');
      return;
    }

    if (!deletePassword) {
      setDeleteError('Password is required');
      return;
    }

    setIsDeleting(true);
    try {
      await api.deleteAccount(deletePassword);
      toast({
        title: 'Account Deleted',
        description: 'Your account has been permanently deleted.',
      });
      await signOut();
      navigate('/');
    } catch (error: any) {
      setDeleteError(error.message || 'Failed to delete account');
    } finally {
      setIsDeleting(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <h1 className="font-heading text-4xl font-bold text-foreground mb-8 text-center">
            My <span className="text-primary">Profile</span>
          </h1>

          <div className="max-w-4xl mx-auto">
            <Tabs defaultValue="profile" className="space-y-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="profile">Profile Details</TabsTrigger>
                <TabsTrigger value="orders">Order History</TabsTrigger>
                <TabsTrigger value="security" className="flex items-center gap-1.5">
                  <Shield className="h-4 w-4" />
                  Security
                </TabsTrigger>
              </TabsList>

              {/* ========================= PROFILE TAB ========================= */}
              <TabsContent value="profile">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Personal Information</CardTitle>
                    {!isEditing && (
                      <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                        <Edit2 className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {isEditing ? (
                      <>
                        <div className="space-y-2">
                          <Label htmlFor="full_name">Full Name</Label>
                          <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                            <Input
                              id="full_name"
                              type="text"
                              placeholder="John Doe"
                              className="pl-10"
                              value={formData.full_name}
                              onChange={handleInputChange}
                              disabled={isSaving}
                            />
                          </div>
                          {errors.full_name && (
                            <p className="text-sm text-destructive">{errors.full_name}</p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="phone">Phone Number</Label>
                          <div className="relative">
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                            <Input
                              id="phone"
                              type="tel"
                              placeholder="9876543210"
                              className="pl-10"
                              value={formData.phone}
                              onChange={handleInputChange}
                              disabled={isSaving}
                            />
                          </div>
                          {errors.phone && (
                            <p className="text-sm text-destructive">{errors.phone}</p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="address">Default Delivery Address</Label>
                          <div className="relative">
                            <MapPin className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                            <Textarea
                              id="address"
                              placeholder="Enter your delivery address"
                              className="pl-10 min-h-[100px]"
                              value={formData.address}
                              onChange={handleInputChange}
                              disabled={isSaving}
                            />
                          </div>
                        </div>

                        <div className="flex gap-2 pt-4">
                          <Button onClick={handleSave} disabled={isSaving}>
                            {isSaving ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Saving...
                              </>
                            ) : (
                              'Save Changes'
                            )}
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => {
                              setIsEditing(false);
                              setFormData({
                                full_name: profile?.full_name || '',
                                phone: profile?.phone || '',
                                address: profile?.address || '',
                              });
                              setErrors({});
                            }}
                            disabled={isSaving}
                          >
                            Cancel
                          </Button>
                        </div>
                      </>
                    ) : (
                      <div className="space-y-4">
                        <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                          <User className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="text-sm text-muted-foreground">Full Name</p>
                            <p className="font-medium">{profile?.full_name || 'Not set'}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                          <Phone className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="text-sm text-muted-foreground">Phone Number</p>
                            <p className="font-medium">{profile?.phone || 'Not set'}</p>
                          </div>
                        </div>

                        <div className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                          <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                          <div>
                            <p className="text-sm text-muted-foreground">Default Address</p>
                            <p className="font-medium">{profile?.address || 'Not set'}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                          <div className="h-5 w-5 flex items-center justify-center text-muted-foreground">@</div>
                          <div>
                            <p className="text-sm text-muted-foreground">Email</p>
                            <p className="font-medium">{user.email}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* ========================= ORDERS TAB ========================= */}
              <TabsContent value="orders">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Package className="h-5 w-5" />
                      Order History
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {orders.length === 0 ? (
                      <div className="text-center py-8">
                        <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">No orders yet.</p>
                        <Button variant="outline" className="mt-4" onClick={() => navigate('/menu')}>
                          Browse Menu
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {orders.map(order => (
                          <div
                            key={order.id}
                            className="flex items-center justify-between p-4 bg-muted rounded-lg cursor-pointer hover:bg-muted/80 transition-colors"
                            onClick={() => setSelectedOrder(order)}
                          >
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                                  {order.status}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {new Date(order.created_at).toLocaleDateString()}
                                </span>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {order.order_items.length} items • ₹{Number(order.total_amount).toLocaleString()}
                              </p>
                            </div>
                            <ChevronRight className="h-5 w-5 text-muted-foreground" />
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* ========================= SECURITY TAB ========================= */}
              <TabsContent value="security" className="space-y-6">

                {/* Account Overview Card */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <Fingerprint className="h-5 w-5 text-primary" />
                          Account Overview
                        </CardTitle>
                        <CardDescription>Your account security summary</CardDescription>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={fetchSecurityData}
                        disabled={securityLoading}
                      >
                        <RefreshCw className={`h-4 w-4 mr-1 ${securityLoading ? 'animate-spin' : ''}`} />
                        Refresh
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {securityLoading && !securityInfo ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                      </div>
                    ) : (
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-xl border">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                            <Mail className="h-5 w-5 text-primary" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Email</p>
                            <p className="font-medium text-sm truncate">{user.email}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-xl border">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500/10">
                            <ShieldCheck className="h-5 w-5 text-green-600" />
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Account Status</p>
                            <p className="font-medium text-sm">
                              {securityInfo?.isLocked ? (
                                <span className="text-red-600">🔒 Locked</span>
                              ) : (
                                <span className="text-green-600">✅ Active</span>
                              )}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-xl border">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/10">
                            <Calendar className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Member Since</p>
                            <p className="font-medium text-sm">
                              {securityInfo?.createdAt
                                ? new Date(securityInfo.createdAt).toLocaleDateString('en-IN', {
                                  day: 'numeric', month: 'long', year: 'numeric'
                                })
                                : 'N/A'}
                            </p>
                            {securityInfo?.accountAge != null && (
                              <p className="text-xs text-muted-foreground">{securityInfo.accountAge} days</p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-xl border">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-500/10">
                            <Clock className="h-5 w-5 text-purple-600" />
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Last Login</p>
                            <p className="font-medium text-sm">
                              {securityInfo?.lastLogin
                                ? formatRelativeTime(securityInfo.lastLogin)
                                : 'N/A'}
                            </p>
                            {securityInfo?.lastLogin && (
                              <p className="text-xs text-muted-foreground">
                                {new Date(securityInfo.lastLogin).toLocaleString('en-IN')}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-xl border">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-500/10">
                            <KeyRound className="h-5 w-5 text-orange-600" />
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Password Last Changed</p>
                            <p className="font-medium text-sm">
                              {securityInfo?.passwordChangedAt
                                ? formatRelativeTime(securityInfo.passwordChangedAt)
                                : 'Never changed'}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-xl border">
                          <div className={`flex h-10 w-10 items-center justify-center rounded-full ${securityInfo?.failedLoginAttempts > 0 ? 'bg-red-500/10' : 'bg-green-500/10'
                            }`}>
                            <AlertTriangle className={`h-5 w-5 ${securityInfo?.failedLoginAttempts > 0 ? 'text-red-600' : 'text-green-600'
                              }`} />
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Failed Login Attempts</p>
                            <p className={`font-medium text-sm ${securityInfo?.failedLoginAttempts > 0 ? 'text-red-600' : 'text-green-600'
                              }`}>
                              {securityInfo?.failedLoginAttempts || 0} attempt(s)
                            </p>
                            {securityInfo?.failedLoginAttempts > 0 && (
                              <p className="text-xs text-muted-foreground">Account locks after 5 failed attempts</p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Login Activity / History Card */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <History className="h-5 w-5 text-primary" />
                          Login Activity
                        </CardTitle>
                        <CardDescription>Recent login attempts on your account (last 20)</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {securityLoading && loginHistory.length === 0 ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                      </div>
                    ) : loginHistory.length === 0 ? (
                      <div className="text-center py-8">
                        <History className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                        <p className="text-muted-foreground text-sm">No login activity recorded yet.</p>
                        <p className="text-muted-foreground text-xs mt-1">Login history will appear here after your next sign-in.</p>
                      </div>
                    ) : (
                      <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
                        {loginHistory.map((entry: any, index: number) => (
                          <div
                            key={entry._id || index}
                            className={`flex items-start gap-3 p-3 rounded-lg border transition-colors ${entry.status === 'success'
                                ? 'bg-green-50/50 border-green-200 dark:bg-green-950/10 dark:border-green-900'
                                : 'bg-red-50/50 border-red-200 dark:bg-red-950/10 dark:border-red-900'
                              }`}
                          >
                            {/* Status icon */}
                            <div className={`flex h-9 w-9 items-center justify-center rounded-full flex-shrink-0 mt-0.5 ${entry.status === 'success'
                                ? 'bg-green-100 dark:bg-green-900/30'
                                : 'bg-red-100 dark:bg-red-900/30'
                              }`}>
                              {entry.status === 'success' ? (
                                <CheckCircle2 className="h-4 w-4 text-green-600" />
                              ) : (
                                <XCircle className="h-4 w-4 text-red-600" />
                              )}
                            </div>

                            {/* Details */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className={`text-sm font-semibold ${entry.status === 'success' ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'
                                  }`}>
                                  {entry.status === 'success' ? 'Successful Login' : 'Failed Attempt'}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {formatRelativeTime(entry.timestamp)}
                                </span>
                              </div>

                              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1.5 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  {getDeviceIcon(entry.device)}
                                  {entry.browser || 'Unknown'} • {entry.os || 'Unknown'}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Globe className="h-3.5 w-3.5" />
                                  IP: {entry.ipAddress || 'Unknown'}
                                </span>
                              </div>

                              <p className="text-[11px] text-muted-foreground/60 mt-1">
                                {new Date(entry.timestamp).toLocaleString('en-IN', {
                                  weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
                                  hour: '2-digit', minute: '2-digit', second: '2-digit'
                                })}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Change Password Card */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <KeyRound className="h-5 w-5 text-primary" />
                      Change Password
                    </CardTitle>
                    <CardDescription>
                      Update your password to keep your account secure. Use a strong password with a mix of letters, numbers, and symbols.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-5">
                    {/* Current Password */}
                    <div className="space-y-2">
                      <Label htmlFor="currentPassword">Current Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input
                          id="currentPassword"
                          type={showCurrentPassword ? 'text' : 'password'}
                          placeholder="Enter current password"
                          className="pl-10 pr-10"
                          value={passwordData.currentPassword}
                          onChange={handlePasswordInputChange}
                          disabled={isChangingPassword}
                          autoComplete="current-password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      {passwordErrors.currentPassword && (
                        <p className="text-sm text-destructive flex items-center gap-1">
                          <AlertTriangle className="h-3.5 w-3.5" />
                          {passwordErrors.currentPassword}
                        </p>
                      )}
                    </div>

                    {/* New Password */}
                    <div className="space-y-2">
                      <Label htmlFor="newPassword">New Password</Label>
                      <div className="relative">
                        <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input
                          id="newPassword"
                          type={showNewPassword ? 'text' : 'password'}
                          placeholder="Enter new password (min 6 chars)"
                          className="pl-10 pr-10"
                          value={passwordData.newPassword}
                          onChange={handlePasswordInputChange}
                          disabled={isChangingPassword}
                          autoComplete="new-password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      {passwordErrors.newPassword && (
                        <p className="text-sm text-destructive flex items-center gap-1">
                          <AlertTriangle className="h-3.5 w-3.5" />
                          {passwordErrors.newPassword}
                        </p>
                      )}
                      {/* Password Strength Meter */}
                      {passwordData.newPassword.length > 0 && (
                        <div className="space-y-1.5">
                          <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((level) => (
                              <div
                                key={level}
                                className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${level <= passwordStrength ? getStrengthColor() : 'bg-muted'
                                  }`}
                              />
                            ))}
                          </div>
                          <div className="flex items-center justify-between">
                            <p className={`text-xs font-medium ${passwordStrength <= 1 ? 'text-red-500' :
                                passwordStrength <= 2 ? 'text-orange-500' :
                                  passwordStrength <= 3 ? 'text-yellow-600' :
                                    'text-green-600'
                              }`}>
                              Strength: {getStrengthLabel()}
                            </p>
                            <div className="flex gap-2 text-[10px] text-muted-foreground">
                              <span className={/[A-Z]/.test(passwordData.newPassword) ? 'text-green-600' : ''}>
                                {/[A-Z]/.test(passwordData.newPassword) ? '✓' : '○'} A-Z
                              </span>
                              <span className={/[0-9]/.test(passwordData.newPassword) ? 'text-green-600' : ''}>
                                {/[0-9]/.test(passwordData.newPassword) ? '✓' : '○'} 0-9
                              </span>
                              <span className={/[^A-Za-z0-9]/.test(passwordData.newPassword) ? 'text-green-600' : ''}>
                                {/[^A-Za-z0-9]/.test(passwordData.newPassword) ? '✓' : '○'} !@#
                              </span>
                              <span className={passwordData.newPassword.length >= 10 ? 'text-green-600' : ''}>
                                {passwordData.newPassword.length >= 10 ? '✓' : '○'} 10+
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Confirm Password */}
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm New Password</Label>
                      <div className="relative">
                        <CheckCircle2 className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input
                          id="confirmPassword"
                          type={showConfirmPassword ? 'text' : 'password'}
                          placeholder="Confirm new password"
                          className="pl-10 pr-10"
                          value={passwordData.confirmPassword}
                          onChange={handlePasswordInputChange}
                          disabled={isChangingPassword}
                          autoComplete="new-password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      {passwordErrors.confirmPassword && (
                        <p className="text-sm text-destructive flex items-center gap-1">
                          <AlertTriangle className="h-3.5 w-3.5" />
                          {passwordErrors.confirmPassword}
                        </p>
                      )}
                      {passwordData.confirmPassword.length > 0 && !passwordErrors.confirmPassword && (
                        <p className={`text-xs font-medium flex items-center gap-1 ${passwordData.newPassword === passwordData.confirmPassword
                            ? 'text-green-600' : 'text-red-500'
                          }`}>
                          {passwordData.newPassword === passwordData.confirmPassword ? (
                            <>
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              Passwords match
                            </>
                          ) : (
                            <>
                              <AlertTriangle className="h-3.5 w-3.5" />
                              Passwords don't match
                            </>
                          )}
                        </p>
                      )}
                    </div>

                    <div className="pt-2">
                      <Button
                        onClick={handleChangePassword}
                        disabled={isChangingPassword || !passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword}
                        className="w-full sm:w-auto"
                      >
                        {isChangingPassword ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Updating Password...
                          </>
                        ) : (
                          <>
                            <Lock className="mr-2 h-4 w-4" />
                            Update Password
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Security Tips Card */}
                <Card className="border-blue-200 bg-blue-50/50 dark:border-blue-900 dark:bg-blue-950/20">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-400 text-base">
                      <ShieldAlert className="h-5 w-5" />
                      Security Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2.5 text-sm text-blue-700/80 dark:text-blue-400/80">
                      <li className="flex items-start gap-2">
                        <Lock className="h-4 w-4 mt-0.5 flex-shrink-0 text-blue-600 dark:text-blue-400" />
                        <span>Your account will be <strong>locked for 15 minutes</strong> after 5 consecutive failed login attempts to prevent unauthorized access.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Globe className="h-4 w-4 mt-0.5 flex-shrink-0 text-blue-600 dark:text-blue-400" />
                        <span>Login attempts are <strong>rate-limited</strong> to 10 per 15 minutes per IP address to prevent brute-force attacks.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <History className="h-4 w-4 mt-0.5 flex-shrink-0 text-blue-600 dark:text-blue-400" />
                        <span>All login attempts (successful and failed) are <strong>recorded with IP address, browser, and device info</strong>.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Shield className="h-4 w-4 mt-0.5 flex-shrink-0 text-blue-600 dark:text-blue-400" />
                        <span>Passwords are hashed with <strong>bcrypt (12 salt rounds)</strong> and never stored in plain text.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <KeyRound className="h-4 w-4 mt-0.5 flex-shrink-0 text-blue-600 dark:text-blue-400" />
                        <span>Authentication uses <strong>JWT tokens</strong> with automatic expiry for session management.</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>

                {/* Danger Zone Card */}
                <Card className="border-red-200 dark:border-red-900">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
                      <AlertTriangle className="h-5 w-5" />
                      Danger Zone
                    </CardTitle>
                    <CardDescription>
                      Irreversible and destructive actions. Please proceed with caution.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl border border-red-200 dark:border-red-900 bg-red-50/50 dark:bg-red-950/20">
                      <div>
                        <h4 className="font-semibold text-red-700 dark:text-red-400">Delete Account</h4>
                        <p className="text-sm text-red-600/70 dark:text-red-400/70 mt-1">
                          Permanently delete your account, all orders, favorites, and reviews. This cannot be undone.
                        </p>
                      </div>
                      <Button
                        variant="destructive"
                        size="sm"
                        className="flex-shrink-0"
                        onClick={() => {
                          setShowDeleteDialog(true);
                          setDeletePassword('');
                          setDeleteConfirmText('');
                          setDeleteError('');
                        }}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Account
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>

      {/* Order Details Dialog */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Order ID</p>
                  <p className="font-mono text-sm">{selectedOrder.id.slice(0, 8)}...</p>
                </div>
                <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedOrder.status)}`}>
                  {selectedOrder.status}
                </span>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Order Date</p>
                <p className="font-medium">
                  {new Date(selectedOrder.created_at).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>

              {selectedOrder.delivery_address && (
                <div>
                  <p className="text-sm text-muted-foreground">Delivery Address</p>
                  <p className="font-medium">{selectedOrder.delivery_address}</p>
                </div>
              )}

              <div className="border-t pt-4">
                <p className="font-medium mb-2">Items</p>
                <div className="space-y-2">
                  {selectedOrder.order_items.map(item => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span>{item.menu_item_name} × {item.quantity}</span>
                      <span>₹{(Number(item.price) * item.quantity).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between font-bold mt-4 pt-2 border-t">
                  <span>Total</span>
                  <span>₹{Number(selectedOrder.total_amount).toLocaleString()}</span>
                </div>
              </div>

              <Button variant="outline" className="w-full" onClick={() => setSelectedOrder(null)}>
                Close
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Account Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Delete Your Account
            </DialogTitle>
            <DialogDescription className="text-left">
              This action is <strong>permanent</strong> and <strong>cannot be undone</strong>. All your data will be permanently deleted.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900">
              <p className="text-sm text-red-700 dark:text-red-400 font-medium">
                The following data will be permanently deleted:
              </p>
              <ul className="mt-2 space-y-1 text-sm text-red-600/80 dark:text-red-400/70">
                <li>• Your profile and personal information</li>
                <li>• All order history</li>
                <li>• Saved favorites</li>
                <li>• Your reviews and ratings</li>
                <li>• Login activity history</li>
              </ul>
            </div>

            <div className="space-y-2">
              <Label htmlFor="deletePassword" className="text-sm">
                Enter your password to confirm
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="deletePassword"
                  type="password"
                  placeholder="Your password"
                  className="pl-10"
                  value={deletePassword}
                  onChange={(e) => {
                    setDeletePassword(e.target.value);
                    setDeleteError('');
                  }}
                  disabled={isDeleting}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="deleteConfirm" className="text-sm">
                Type <span className="font-bold text-red-600">DELETE</span> to confirm
              </Label>
              <Input
                id="deleteConfirm"
                type="text"
                placeholder="Type DELETE"
                value={deleteConfirmText}
                onChange={(e) => {
                  setDeleteConfirmText(e.target.value);
                  setDeleteError('');
                }}
                disabled={isDeleting}
              />
            </div>

            {deleteError && (
              <p className="text-sm text-destructive flex items-center gap-1.5">
                <AlertTriangle className="h-3.5 w-3.5" />
                {deleteError}
              </p>
            )}

            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowDeleteDialog(false)}
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                className="flex-1"
                onClick={handleDeleteAccount}
                disabled={isDeleting || deleteConfirmText !== 'DELETE' || !deletePassword}
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Permanently
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default ProfilePage;
