import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useRestaurantHours } from '@/hooks/useRestaurantHours';
import { api } from '@/integrations/mongodb';
import { useToast } from '@/hooks/use-toast';
import {
  MapPin, Phone, User, FileText, Loader2, CheckCircle,
  Banknote, Clock, ShoppingBag, ArrowLeft, Sparkles,
  Shield, Truck, Tag, X, Percent, QrCode, Smartphone
} from 'lucide-react';
import { z } from 'zod';
import { QRCodeSVG } from 'qrcode.react';

interface AppliedPromo {
  id: string;
  name: string;
  code: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  discountAmount: number;
}

const checkoutSchema = z.object({
  fullName: z.string().trim().min(2, 'Name must be at least 2 characters').max(100),
  phone: z.string().trim().min(10, 'Please enter a valid phone number').max(15),
  address: z.string().trim().min(10, 'Please enter a complete address').max(500),
  notes: z.string().trim().max(500).optional(),
});

// Checkout progress steps
const steps = [
  { id: 1, name: 'Cart', icon: ShoppingBag },
  { id: 2, name: 'Delivery', icon: Truck },
  { id: 3, name: 'Confirm', icon: CheckCircle },
];

const CheckoutPage = () => {
  const { items, totalPrice, clearCart } = useCart();
  const { user, loading: authLoading } = useAuth();
  const { isOpen: isRestaurantOpen, statusMessage, formattedHours } = useRestaurantHours();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(2); // Start at Delivery step
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'upi'>('cod');
  const [showQR, setShowQR] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    address: '',
    notes: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Franchises state
  const [franchises, setFranchises] = useState<any[]>([]);
  const [selectedFranchiseId, setSelectedFranchiseId] = useState<string>('');

  // Promo code state
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<AppliedPromo | null>(null);
  const [promoLoading, setPromoLoading] = useState(false);
  const [promoError, setPromoError] = useState('');

  const deliveryFee = 49;
  const discount = appliedPromo?.discountAmount || 0;
  const totalAmount = totalPrice + deliveryFee - discount;

  // ─── UPI Configuration ─────────────────────────────────────────
  // Change this to your merchant/restaurant UPI ID
  const MERCHANT_UPI_ID = 'flavorhub@okaxis';
  const MERCHANT_NAME = 'FlavorHub Restaurant';

  // Generate the UPI payment link string for QR code
  const upiPaymentString = `upi://pay?pa=${encodeURIComponent(MERCHANT_UPI_ID)}&pn=${encodeURIComponent(MERCHANT_NAME)}&am=${totalAmount.toFixed(2)}&cu=INR&tn=${encodeURIComponent(`FlavorHub Order Payment`)}`;

  useEffect(() => {
    if (!authLoading && !user) {
      toast({
        title: 'Please sign in',
        description: 'You need to be signed in to checkout',
        variant: 'destructive',
      });
      navigate('/auth');
    }
  }, [user, authLoading, navigate, toast]);

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        fullName: user.fullName || '',
        phone: user.phone || '',
      }));
    }
  }, [user]);

  useEffect(() => {
    if (!authLoading && items.length === 0 && !orderPlaced) {
      navigate('/cart');
    }
  }, [items, authLoading, orderPlaced, navigate]);

  // Load saved address from profile and franchises
  useEffect(() => {
    const loadData = async () => {
      try {
        const frs = await api.getFranchises();
        setFranchises(frs);
        if (frs.length > 0) setSelectedFranchiseId(frs[0]._id);
      } catch (err) {
        console.error('Error loading franchises:', err);
      }

      if (user) {
        try {
          const { profile } = await api.getProfile();
          if (profile?.address) {
            setFormData(prev => ({ ...prev, address: profile.address }));
          }
        } catch (error) {
          console.error('Error loading profile:', error);
        }
      }
    };
    loadData();
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
    setErrors(prev => ({ ...prev, [id]: '' }));
  };

  const applyPromoCode = async () => {
    if (!promoCode.trim()) {
      setPromoError('Please enter a promo code');
      return;
    }

    setPromoLoading(true);
    setPromoError('');

    try {
      const result = await api.validatePromoCode(promoCode.trim(), totalPrice);

      if (!result.valid || !result.promotion) {
        setPromoError('Invalid promo code');
        return;
      }

      const promo = result.promotion;

      setAppliedPromo({
        id: promo.id,
        name: promo.name,
        code: promoCode.toUpperCase().trim(),
        discount_type: promo.discountType as 'percentage' | 'fixed',
        discount_value: promo.discountValue,
        discountAmount: promo.discount,
      });

      toast({
        title: 'Promo applied! 🎉',
        description: `You saved ₹${promo.discount}`,
      });
    } catch (error: any) {
      console.error('Error applying promo:', error);
      setPromoError(error.message || 'Failed to apply promo code');
    } finally {
      setPromoLoading(false);
    }
  };

  const removePromoCode = () => {
    setAppliedPromo(null);
    setPromoCode('');
    setPromoError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = checkoutSchema.safeParse(formData);
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


    if (!user) {
      toast({
        title: 'Error',
        description: 'Please sign in to place an order',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    if (paymentMethod === 'upi') {
      // Show QR code for UPI payment
      setShowQR(true);
      setIsSubmitting(false);
      return;
    }

    await handleCODOrder();
  };

  const handleCODOrder = async () => {
    try {
      // Create order using MongoDB API
      const { order } = await api.createOrder({
        items: items.map(item => ({
          menuItemId: item.id || item._id || '',
          quantity: item.quantity,
        })),
        deliveryAddress: formData.address,
        notes: formData.notes || undefined,
        paymentMethod: 'cod',
        franchiseId: selectedFranchiseId || undefined,
      });

      if (!order) throw new Error('Failed to create order');

      // Update profile with address
      try {
        await api.updateProfile({
          fullName: formData.fullName,
          phone: formData.phone,
          address: formData.address,
        });
      } catch (profileError) {
        console.error('Failed to update profile:', profileError);
      }

      setOrderId(order._id || order.id);
      setOrderPlaced(true);
      setCurrentStep(3); // Move to confirm step
      clearCart();

      toast({
        title: 'Order Placed!',
        description: 'Your order has been placed. Pay on delivery.',
      });

    } catch (error: any) {
      console.error('Error placing order:', error);
      setCurrentStep(2); // Go back to delivery step on error
      toast({
        title: 'Error',
        description: error.message || 'Failed to place order. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUPIOrderConfirm = async () => {
    setIsSubmitting(true);
    try {
      const { order } = await api.createOrder({
        items: items.map(item => ({
          menuItemId: item.id || item._id || '',
          quantity: item.quantity,
        })),
        deliveryAddress: formData.address,
        notes: formData.notes || undefined,
        paymentMethod: 'upi',
        franchiseId: selectedFranchiseId || undefined,
      });

      if (!order) throw new Error('Failed to create order');

      try {
        await api.updateProfile({
          fullName: formData.fullName,
          phone: formData.phone,
          address: formData.address,
        });
      } catch (profileError) {
        console.error('Failed to update profile:', profileError);
      }

      setOrderId(order._id || order.id);
      setOrderPlaced(true);
      setCurrentStep(3);
      setShowQR(false);
      clearCart();

      toast({
        title: 'Order Placed! 🎉',
        description: 'Your order has been placed via UPI payment.',
      });
    } catch (error: any) {
      console.error('Error placing UPI order:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to place order. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading checkout...</p>
        </div>
      </div>
    );
  }

  // Success state with improved design
  if (orderPlaced) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-24 pb-16 min-h-screen flex items-center">
          <div className="container mx-auto px-4">
            <div className="max-w-lg mx-auto">
              {/* Progress indicator */}
              <div className="flex justify-between items-center mb-8">
                {steps.map((step, index) => (
                  <div key={step.id} className="flex items-center">
                    <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all ${step.id <= currentStep
                      ? 'bg-primary border-primary text-primary-foreground'
                      : 'border-border text-muted-foreground'
                      }`}>
                      <step.icon className="h-5 w-5" />
                    </div>
                    {index < steps.length - 1 && (
                      <div className={`h-1 w-8 sm:w-16 mx-2 rounded transition-all ${step.id < currentStep ? 'bg-primary' : 'bg-border'
                        }`} />
                    )}
                  </div>
                ))}
              </div>

              <div className="bg-card rounded-2xl border-2 border-border shadow-md p-8 animate-scale-in">
                <div className="relative">
                  <div className="absolute inset-0 bg-primary/5 rounded-full blur-3xl" />
                  <div className="relative w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="h-12 w-12 text-primary animate-pulse-soft" />
                  </div>
                </div>

                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Sparkles className="h-5 w-5 text-primary" />
                    <h1 className="font-heading text-3xl font-bold text-foreground">
                      Order Confirmed!
                    </h1>
                    <Sparkles className="h-5 w-5 text-primary" />
                  </div>
                  <p className="text-muted-foreground mb-6">
                    Thank you for your order. We'll start preparing it right away.
                  </p>
                </div>

                <div className="bg-secondary/50 rounded-xl p-5 mb-6 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Order ID</span>
                    <span className="font-mono text-sm font-semibold bg-background px-3 py-1 rounded-lg border border-border">
                      #{orderId?.slice(0, 8).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Payment Method</span>
                    <span className="text-sm font-medium flex items-center gap-2">
                      {paymentMethod === 'upi' ? (
                        <><QrCode className="h-4 w-4" /> UPI Payment</>
                      ) : (
                        <><Banknote className="h-4 w-4" /> Cash on Delivery</>
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-border">
                    <span className="text-sm font-medium">Total Amount</span>
                    <span className="text-lg font-bold text-primary">₹{totalAmount}</span>
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <Button variant="hero" size="lg" onClick={() => navigate('/track-order')} className="w-full">
                    <Truck className="mr-2 h-5 w-5" />
                    Track Your Order
                  </Button>
                  <Button variant="outline" size="lg" onClick={() => navigate('/menu')} className="w-full">
                    Continue Shopping
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Back button and title */}
          <div className="max-w-5xl mx-auto mb-6">
            <Link
              to="/cart"
              className="inline-flex items-center text-muted-foreground hover:text-foreground transition-colors mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Cart
            </Link>
            <h1 className="font-heading text-4xl font-bold text-foreground">
              Checkout
            </h1>
          </div>

          {/* Progress Steps */}
          <div className="max-w-5xl mx-auto mb-8">
            <div className="flex justify-between items-center bg-card rounded-xl border-2 border-border p-4 shadow-sm">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center flex-1">
                  <div className={`flex items-center gap-2 ${step.id === currentStep ? 'text-primary' :
                    step.id < currentStep ? 'text-primary' : 'text-muted-foreground'
                    }`}>
                    <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all ${step.id === currentStep
                      ? 'bg-primary border-primary text-primary-foreground scale-110'
                      : step.id < currentStep
                        ? 'bg-primary border-primary text-primary-foreground'
                        : 'border-border'
                      }`}>
                      {step.id < currentStep ? (
                        <CheckCircle className="h-5 w-5" />
                      ) : (
                        <step.icon className="h-5 w-5" />
                      )}
                    </div>
                    <span className={`hidden sm:block font-medium ${step.id === currentStep ? 'text-foreground' : ''
                      }`}>
                      {step.name}
                    </span>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`flex-1 h-1 mx-3 rounded transition-all ${step.id < currentStep ? 'bg-primary' : 'bg-border'
                      }`} />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Restaurant Closed Banner */}
          {!isRestaurantOpen && (
            <div className="max-w-5xl mx-auto mb-6">
              <div className="bg-destructive/10 border-2 border-destructive/20 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-destructive/20 flex items-center justify-center">
                    <Clock className="h-5 w-5 text-destructive" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-destructive">Restaurant is Currently Closed</h3>
                    <p className="text-sm text-muted-foreground">{statusMessage}</p>
                  </div>
                </div>
                <div className="text-sm text-muted-foreground bg-background/50 rounded-lg p-3 mt-3">
                  <p className="font-medium mb-1">Operating Hours:</p>
                  <p>Mon-Fri: {formattedHours.weekdays}</p>
                  <p>Saturday: {formattedHours.saturday}</p>
                  <p>Sunday: {formattedHours.sunday}</p>
                </div>
              </div>
            </div>
          )}

          <div className="grid lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Delivery Form */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-card rounded-xl border-2 border-border shadow-sm p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Truck className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="font-heading text-xl font-semibold text-foreground">
                      Delivery Details
                    </h2>
                    <p className="text-sm text-muted-foreground">Where should we deliver your order?</p>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">


                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="fullName" className="text-sm font-medium">Full Name</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input
                          id="fullName"
                          type="text"
                          placeholder="John Doe"
                          className={`pl-10 h-12 ${errors.fullName ? 'border-destructive' : ''}`}
                          value={formData.fullName}
                          onChange={handleInputChange}
                          disabled={isSubmitting}
                        />
                      </div>
                      {errors.fullName && (
                        <p className="text-sm text-destructive flex items-center gap-1">
                          <span className="inline-block w-1 h-1 rounded-full bg-destructive" />
                          {errors.fullName}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-sm font-medium">Phone Number</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input
                          id="phone"
                          type="tel"
                          placeholder="9876543210"
                          className={`pl-10 h-12 ${errors.phone ? 'border-destructive' : ''}`}
                          value={formData.phone}
                          onChange={handleInputChange}
                          disabled={isSubmitting}
                        />
                      </div>
                      {errors.phone && (
                        <p className="text-sm text-destructive flex items-center gap-1">
                          <span className="inline-block w-1 h-1 rounded-full bg-destructive" />
                          {errors.phone}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address" className="text-sm font-medium">Delivery Address</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                      <Textarea
                        id="address"
                        placeholder="Enter your full delivery address including street, landmark, city and pincode"
                        className={`pl-10 min-h-[100px] resize-none ${errors.address ? 'border-destructive' : ''}`}
                        value={formData.address}
                        onChange={handleInputChange}
                        disabled={isSubmitting}
                      />
                    </div>
                    {errors.address && (
                      <p className="text-sm text-destructive flex items-center gap-1">
                        <span className="inline-block w-1 h-1 rounded-full bg-destructive" />
                        {errors.address}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes" className="text-sm font-medium">
                      Order Notes <span className="text-muted-foreground">(Optional)</span>
                    </Label>
                    <div className="relative">
                      <FileText className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                      <Textarea
                        id="notes"
                        placeholder="Any special instructions for your order..."
                        className="pl-10 min-h-[80px] resize-none"
                        value={formData.notes}
                        onChange={handleInputChange}
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>

                  {/* Payment Method Selection */}
                  <div className="pt-4 border-t border-border">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Banknote className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-heading text-lg font-semibold text-foreground">Payment Method</h3>
                        <p className="text-sm text-muted-foreground">Choose how you'd like to pay</p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {/* COD Option */}
                      <button
                        type="button"
                        onClick={() => { setPaymentMethod('cod'); setShowQR(false); }}
                        className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all duration-300 ${paymentMethod === 'cod'
                          ? 'border-primary bg-primary/5 shadow-md shadow-primary/10'
                          : 'border-border hover:border-primary/40 hover:bg-secondary/30'
                          }`}
                      >
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${paymentMethod === 'cod' ? 'bg-primary/10' : 'bg-secondary'
                          }`}>
                          <Banknote className={`h-6 w-6 transition-colors ${paymentMethod === 'cod' ? 'text-primary' : 'text-muted-foreground'
                            }`} />
                        </div>
                        <div className="flex-1 text-left">
                          <span className="font-medium">Cash on Delivery</span>
                          <p className="text-sm text-muted-foreground">Pay when your order arrives</p>
                        </div>
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${paymentMethod === 'cod' ? 'border-primary' : 'border-muted-foreground/30'
                          }`}>
                          {paymentMethod === 'cod' && (
                            <div className="w-3 h-3 rounded-full bg-primary animate-scale-in" />
                          )}
                        </div>
                      </button>

                      {/* UPI QR Code Option */}
                      <button
                        type="button"
                        onClick={() => { setPaymentMethod('upi'); setShowQR(false); }}
                        className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all duration-300 ${paymentMethod === 'upi'
                          ? 'border-primary bg-primary/5 shadow-md shadow-primary/10'
                          : 'border-border hover:border-primary/40 hover:bg-secondary/30'
                          }`}
                      >
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${paymentMethod === 'upi' ? 'bg-primary/10' : 'bg-secondary'
                          }`}>
                          <QrCode className={`h-6 w-6 transition-colors ${paymentMethod === 'upi' ? 'text-primary' : 'text-muted-foreground'
                            }`} />
                        </div>
                        <div className="flex-1 text-left">
                          <span className="font-medium">Pay via UPI (QR Code)</span>
                          <p className="text-sm text-muted-foreground">Scan QR with GPay, PhonePe, Paytm</p>
                        </div>
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${paymentMethod === 'upi' ? 'border-primary' : 'border-muted-foreground/30'
                          }`}>
                          {paymentMethod === 'upi' && (
                            <div className="w-3 h-3 rounded-full bg-primary animate-scale-in" />
                          )}
                        </div>
                      </button>
                    </div>

                    {/* QR Code Display (shown after clicking Place Order with UPI selected) */}
                    {showQR && paymentMethod === 'upi' && (
                      <div className="mt-6 animate-scale-in">
                        <div className="bg-gradient-to-br from-primary/5 via-background to-primary/5 rounded-2xl border-2 border-primary/20 p-6">
                          <div className="text-center mb-4">
                            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-semibold mb-3">
                              <Smartphone className="h-4 w-4" />
                              Scan with any UPI App
                            </div>
                            <h4 className="font-heading text-lg font-bold text-foreground">Scan to Pay ₹{totalAmount}</h4>
                            <p className="text-sm text-muted-foreground mt-1">Open GPay, PhonePe, or Paytm and scan</p>
                          </div>

                          {/* QR Code */}
                          <div className="flex justify-center mb-4">
                            <div className="bg-white p-4 rounded-2xl shadow-lg shadow-primary/10 border border-primary/10">
                              <QRCodeSVG
                                value={upiPaymentString}
                                size={220}
                                level="H"
                                includeMargin={true}
                                bgColor="#ffffff"
                                fgColor="#1a1a2e"
                                imageSettings={{
                                  src: '',
                                  x: undefined,
                                  y: undefined,
                                  height: 0,
                                  width: 0,
                                  excavate: false,
                                }}
                              />
                            </div>
                          </div>

                          {/* Amount Display */}
                          <div className="bg-card rounded-xl border border-border p-4 mb-4">
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-muted-foreground">Amount to Pay</span>
                              <span className="text-2xl font-bold text-primary">₹{totalAmount}</span>
                            </div>
                            <div className="flex items-center justify-between mt-2 pt-2 border-t border-border">
                              <span className="text-xs text-muted-foreground">UPI ID</span>
                              <span className="text-xs font-mono text-muted-foreground">{MERCHANT_UPI_ID}</span>
                            </div>
                          </div>

                          {/* UPI App Logos hint */}
                          <div className="flex items-center justify-center gap-3 mb-4">
                            <div className="flex items-center gap-1 text-xs text-muted-foreground bg-secondary/50 px-3 py-1.5 rounded-full">
                              <span className="font-semibold text-foreground">GPay</span>
                              <span>•</span>
                              <span className="font-semibold text-foreground">PhonePe</span>
                              <span>•</span>
                              <span className="font-semibold text-foreground">Paytm</span>
                            </div>
                          </div>

                          {/* Confirm & Cancel buttons */}
                          <div className="flex gap-3">
                            <Button
                              type="button"
                              variant="outline"
                              className="flex-1"
                              onClick={() => setShowQR(false)}
                              disabled={isSubmitting}
                            >
                              <ArrowLeft className="mr-2 h-4 w-4" />
                              Back
                            </Button>
                            <Button
                              type="button"
                              variant="hero"
                              className="flex-1"
                              onClick={handleUPIOrderConfirm}
                              disabled={isSubmitting}
                            >
                              {isSubmitting ? (
                                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Confirming...</>
                              ) : (
                                <><CheckCircle className="mr-2 h-4 w-4" /> I've Paid</>
                              )}
                            </Button>
                          </div>

                          <p className="text-xs text-center text-muted-foreground mt-3">
                            Click "I've Paid" after completing the payment on your UPI app
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Security badge */}
                  <div className="flex items-center gap-2 text-sm text-muted-foreground bg-secondary/50 rounded-lg p-3">
                    <Shield className="h-4 w-4" />
                    <span>Your information is secure and encrypted</span>
                  </div>

                  {/* Only show Place Order button when QR is NOT displayed */}
                  {!showQR && (
                    <Button
                      type="submit"
                      variant="hero"
                      size="lg"
                      className="w-full h-14 text-lg"
                      disabled={isSubmitting || !isRestaurantOpen}
                    >
                      {!isRestaurantOpen ? (
                        <>
                          <Clock className="mr-2 h-5 w-5" />
                          Restaurant Closed
                        </>
                      ) : isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Placing Your Order...
                        </>
                      ) : paymentMethod === 'upi' ? (
                        <>
                          <QrCode className="mr-2 h-5 w-5" />
                          Generate QR Code • ₹{totalAmount}
                        </>
                      ) : (
                        <>
                          <CheckCircle className="mr-2 h-5 w-5" />
                          Place Order • ₹{totalAmount}
                        </>
                      )}
                    </Button>
                  )}
                </form>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-card rounded-xl border-2 border-border shadow-sm p-6 sticky top-24">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <ShoppingBag className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="font-heading text-xl font-semibold text-foreground">
                      Order Summary
                    </h2>
                    <p className="text-sm text-muted-foreground">{items.length} item{items.length !== 1 ? 's' : ''}</p>
                  </div>
                </div>

                <div className="space-y-3 mb-4 max-h-64 overflow-y-auto pr-2">
                  {items.map((item) => (
                    <div key={item.id || item._id} className="flex gap-3 p-3 bg-secondary/30 rounded-lg">
                      <img
                        src={item.image || item.imageUrl || item.image_url || '/placeholder.jpg'}
                        alt={item.name}
                        className="w-14 h-14 object-cover rounded-lg"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&q=80';
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{item.name}</p>
                        <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                      </div>
                      <span className="font-semibold text-sm">₹{item.price * item.quantity}</span>
                    </div>
                  ))}
                </div>

                {/* Promo Code Section */}
                <div className="border-t border-border pt-4 mb-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Tag className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">Promo Code</span>
                  </div>

                  {appliedPromo ? (
                    <div className="flex items-center justify-between bg-primary/10 border border-primary/20 rounded-lg p-3">
                      <div className="flex items-center gap-2">
                        <Percent className="h-4 w-4 text-primary" />
                        <div>
                          <p className="text-sm font-medium text-primary">{appliedPromo.code}</p>
                          <p className="text-xs text-muted-foreground">{appliedPromo.name}</p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={removePromoCode}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <Input
                          placeholder="Enter code"
                          value={promoCode}
                          onChange={(e) => {
                            setPromoCode(e.target.value.toUpperCase());
                            setPromoError('');
                          }}
                          className="h-10 uppercase"
                          disabled={promoLoading}
                        />
                        <Button
                          variant="outline"
                          onClick={applyPromoCode}
                          disabled={promoLoading || !promoCode.trim()}
                          className="shrink-0"
                        >
                          {promoLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            'Apply'
                          )}
                        </Button>
                      </div>
                      {promoError && (
                        <p className="text-xs text-destructive">{promoError}</p>
                      )}
                    </div>
                  )}
                </div>

                <div className="border-t border-border pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>₹{totalPrice}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Truck className="h-4 w-4" />
                      Delivery Fee
                    </span>
                    <span>₹{deliveryFee}</span>
                  </div>
                  {appliedPromo && (
                    <div className="flex justify-between text-sm text-primary">
                      <span className="flex items-center gap-1">
                        <Tag className="h-4 w-4" />
                        Discount ({appliedPromo.code})
                      </span>
                      <span>-₹{discount}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-lg pt-3 border-t border-border">
                    <span>Total</span>
                    <span className="text-primary">₹{totalAmount}</span>
                  </div>
                </div>

                {/* Delivery info */}
                <div className="mt-4 p-3 bg-secondary/30 rounded-lg">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>Estimated delivery: 30-45 mins</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CheckoutPage;
