import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { useOrderTracking, TrackedOrder } from '@/hooks/useOrderTracking';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Package, CheckCircle, Truck, Clock, XCircle, Map as MapIcon } from 'lucide-react';
import { format } from 'date-fns';
import { DeliveryMap } from '@/components/DeliveryMap';

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  pending: { label: 'Pending', color: 'bg-yellow-500', icon: Clock },
  confirmed: { label: 'Confirmed', color: 'bg-blue-500', icon: Package },
  preparing: { label: 'Preparing', color: 'bg-orange-500', icon: Package },
  out_for_delivery: { label: 'Out for Delivery', color: 'bg-purple-500', icon: Truck },
  delivered: { label: 'Delivered', color: 'bg-green-500', icon: CheckCircle },
  cancelled: { label: 'Cancelled', color: 'bg-red-500', icon: XCircle },
};

const STATUS_STEPS = ['pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered'];

const OrderProgressTracker = ({ status }: { status: string }) => {
  const currentIndex = STATUS_STEPS.indexOf(status);
  const isCancelled = status === 'cancelled';

  if (isCancelled) {
    return (
      <div className="flex items-center justify-center py-4">
        <Badge variant="destructive" className="text-sm">Order Cancelled</Badge>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between py-4">
      {STATUS_STEPS.map((step, index) => {
        const config = STATUS_CONFIG[step];
        const Icon = config.icon;
        const isActive = index <= currentIndex;
        const isCurrent = index === currentIndex;

        return (
          <div key={step} className="flex flex-col items-center flex-1">
            <div className="relative flex items-center w-full">
              {index > 0 && (
                <div 
                  className={`absolute left-0 right-1/2 h-1 -translate-y-1/2 top-1/2 ${
                    index <= currentIndex ? 'bg-primary' : 'bg-muted'
                  }`}
                />
              )}
              {index < STATUS_STEPS.length - 1 && (
                <div 
                  className={`absolute left-1/2 right-0 h-1 -translate-y-1/2 top-1/2 ${
                    index < currentIndex ? 'bg-primary' : 'bg-muted'
                  }`}
                />
              )}
              <div 
                className={`relative z-10 mx-auto flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all ${
                  isCurrent 
                    ? 'border-primary bg-primary text-primary-foreground scale-110' 
                    : isActive 
                      ? 'border-primary bg-primary text-primary-foreground' 
                      : 'border-muted bg-background text-muted-foreground'
                }`}
              >
                <Icon className="h-5 w-5" />
              </div>
            </div>
            <span className={`mt-2 text-xs text-center ${isCurrent ? 'font-semibold text-primary' : 'text-muted-foreground'}`}>
              {config.label}
            </span>
          </div>
        );
      })}
    </div>
  );
};

const OrderCard = ({ order }: { order: TrackedOrder }) => {
  const config = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">
            Order #{order.id.slice(0, 8).toUpperCase()}
          </CardTitle>
          <Badge className={`${config.color} text-white`}>
            {config.label}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          Placed on {format(new Date(order.created_at), 'MMM d, yyyy h:mm a')}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <OrderProgressTracker status={order.status} />
        
        <div className="space-y-2">
          <h4 className="font-medium text-sm">Items</h4>
          {order.items.map((item) => (
            <div key={item.id} className="flex justify-between text-sm">
              <span>{item.quantity}x {item.menu_item_name}</span>
              <span className="text-muted-foreground">₹{(item.price * item.quantity).toFixed(0)}</span>
            </div>
          ))}
          <div className="border-t pt-2 flex justify-between font-medium">
            <span>Total</span>
            <span>₹{Number(order.total_amount || order.totalAmount).toFixed(0)}</span>
          </div>
        </div>

        {order.status !== 'cancelled' && order.status !== 'delivered' && (
          <div className="mt-4 pt-4 border-t border-border">
             <div className="flex items-center gap-2 mb-3">
                <MapIcon className="h-4 w-4 text-primary" />
                <h4 className="font-medium text-sm">Delivery Tracking</h4>
             </div>
             <DeliveryMap 
                location={order.deliveryLocation} 
                status={order.status} 
             />
          </div>
        )}

        {order.delivery_address && (
          <div className="text-sm">
            <span className="font-medium">Delivery to: </span>
            <span className="text-muted-foreground">{order.delivery_address}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const OrderTrackingPage = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { activeOrders, pastOrders, loading } = useOrderTracking();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 container py-8">
        <h1 className="text-3xl font-bold mb-8">Track Your Orders</h1>

        {activeOrders.length > 0 && (
          <section className="mb-10">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Truck className="h-5 w-5 text-primary" />
              Active Orders
            </h2>
            <div className="grid gap-6 md:grid-cols-2">
              {activeOrders.map((order) => (
                <OrderCard key={order.id} order={order} />
              ))}
            </div>
          </section>
        )}

        <section>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-muted-foreground" />
            Past Orders
          </h2>
          {pastOrders.length === 0 ? (
            <p className="text-muted-foreground">No past orders yet.</p>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              {pastOrders.map((order) => (
                <OrderCard key={order.id} order={order} />
              ))}
            </div>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default OrderTrackingPage;
