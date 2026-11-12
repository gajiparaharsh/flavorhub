import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ShoppingBag, 
  Clock, 
  CheckCircle, 
  XCircle, 
  TrendingUp, 
  TrendingDown,
  Package, 
  ChefHat,
  ArrowRight,
  RefreshCw,
  Eye,
  Users,
  DollarSign
} from 'lucide-react';
import { useAdminOrders, OrderStatus } from '@/hooks/useAdminOrders';
import { useAnalytics } from '@/hooks/useAnalytics';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { AreaChart, Area, ResponsiveContainer, BarChart, Bar, XAxis, Tooltip } from 'recharts';

const STATUS_CONFIG: Record<OrderStatus, { label: string; color: string; bgColor: string }> = {
  pending: { label: 'Pending', color: 'text-amber-700', bgColor: 'bg-amber-100' },
  confirmed: { label: 'Confirmed', color: 'text-blue-700', bgColor: 'bg-blue-100' },
  preparing: { label: 'Preparing', color: 'text-purple-700', bgColor: 'bg-purple-100' },
  ready: { label: 'Ready', color: 'text-cyan-700', bgColor: 'bg-cyan-100' },
  delivered: { label: 'Delivered', color: 'text-green-700', bgColor: 'bg-green-100' },
  cancelled: { label: 'Cancelled', color: 'text-red-700', bgColor: 'bg-red-100' },
};

const NEXT_STATUS: Partial<Record<OrderStatus, OrderStatus>> = {
  pending: 'confirmed',
  confirmed: 'preparing',
  preparing: 'ready',
  ready: 'delivered',
};

export default function AdminDashboard() {
  const { orders, loading, updateOrderStatus, refetchOrders } = useAdminOrders();
  const { data: analytics, loading: analyticsLoading } = useAnalytics();

  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    inProgress: orders.filter(o => ['confirmed', 'preparing', 'ready'].includes(o.status)).length,
    completed: orders.filter(o => o.status === 'delivered').length,
    cancelled: orders.filter(o => o.status === 'cancelled').length,
  };

  const totalRevenue = orders
    .filter(o => o.status !== 'cancelled')
    .reduce((sum, o) => sum + Number(o.total_amount), 0);

  const todayOrders = orders.filter(o => {
    const orderDate = new Date(o.created_at);
    const today = new Date();
    return orderDate.toDateString() === today.toDateString();
  });

  const todayRevenue = todayOrders
    .filter(o => o.status !== 'cancelled')
    .reduce((sum, o) => sum + Number(o.total_amount), 0);

  const activeOrders = orders.filter(o => 
    ['pending', 'confirmed', 'preparing', 'ready'].includes(o.status)
  );

  // Calculate week-over-week growth
  const weekRevenue = analytics?.weekRevenue || 0;
  const avgOrderValue = analytics?.averageOrderValue || 0;
  
  // Get yesterday's data for comparison
  const yesterdayRevenue = analytics?.dailyRevenue?.[5]?.revenue || 0;
  const todayRevenueFromAnalytics = analytics?.dailyRevenue?.[6]?.revenue || 0;
  const revenueGrowth = yesterdayRevenue > 0 
    ? ((todayRevenueFromAnalytics - yesterdayRevenue) / yesterdayRevenue * 100).toFixed(1) 
    : '0';

  const handleQuickAction = async (orderId: string, currentStatus: OrderStatus) => {
    const nextStatus = NEXT_STATUS[currentStatus];
    if (nextStatus) {
      await updateOrderStatus(orderId, nextStatus);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-heading text-3xl font-bold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground mt-1">Welcome back! Here's what's happening today.</p>
          </div>
          <Button variant="outline" size="sm" onClick={refetchOrders} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="border-l-4 border-l-primary">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Today's Orders
              </CardTitle>
              <ShoppingBag className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{loading ? '...' : todayOrders.length}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.total} total orders
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-amber-500">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Active Orders
              </CardTitle>
              <Clock className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-600">{loading ? '...' : activeOrders.length}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.pending} pending approval
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Today's Revenue
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">₹{loading ? '...' : todayRevenue.toLocaleString()}</div>
              <div className="flex items-center gap-1 mt-1">
                {Number(revenueGrowth) >= 0 ? (
                  <TrendingUp className="h-3 w-3 text-green-500" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-red-500" />
                )}
                <span className={`text-xs ${Number(revenueGrowth) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {revenueGrowth}% vs yesterday
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-blue-500">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Avg Order Value
              </CardTitle>
              <DollarSign className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">₹{analyticsLoading ? '...' : avgOrderValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.completed} delivered orders
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Revenue Charts Row */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Weekly Revenue Trend</CardTitle>
              <CardDescription>Last 7 days performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[120px]">
                {analyticsLoading ? (
                  <div className="h-full flex items-center justify-center text-muted-foreground">Loading...</div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={analytics?.dailyRevenue || []}>
                      <defs>
                        <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <Tooltip 
                        formatter={(value: number) => [`₹${value.toLocaleString()}`, 'Revenue']}
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--background))', 
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="revenue" 
                        stroke="hsl(var(--primary))" 
                        fill="url(#revenueGradient)"
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>
              <div className="flex justify-between mt-2 text-sm">
                <span className="text-muted-foreground">Week Total</span>
                <span className="font-semibold">₹{weekRevenue.toLocaleString()}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Orders by Day</CardTitle>
              <CardDescription>Daily order volume</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[120px]">
                {analyticsLoading ? (
                  <div className="h-full flex items-center justify-center text-muted-foreground">Loading...</div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analytics?.dailyRevenue || []}>
                      <XAxis 
                        dataKey="date" 
                        tick={{ fontSize: 10 }} 
                        tickFormatter={(value) => value.split(',')[0]}
                        axisLine={false}
                        tickLine={false}
                      />
                      <Tooltip 
                        formatter={(value: number) => [value, 'Orders']}
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--background))', 
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }}
                      />
                      <Bar 
                        dataKey="orders" 
                        fill="hsl(var(--primary))" 
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
              <div className="flex justify-between mt-2 text-sm">
                <span className="text-muted-foreground">Week Orders</span>
                <span className="font-semibold">{analytics?.weekOrders || 0}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Top Selling Items */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">Top Selling Items</CardTitle>
                <CardDescription>Best performers this period</CardDescription>
              </div>
              <Link to="/admin/analytics">
                <Button variant="ghost" size="sm">View All</Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {analyticsLoading ? (
              <div className="text-muted-foreground">Loading...</div>
            ) : (
              <div className="space-y-3">
                {analytics?.popularItems?.slice(0, 4).map((item, index) => (
                  <div key={item.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        index === 0 ? 'bg-yellow-100 text-yellow-700' :
                        index === 1 ? 'bg-gray-100 text-gray-700' :
                        index === 2 ? 'bg-orange-100 text-orange-700' :
                        'bg-muted text-muted-foreground'
                      }`}>
                        {index + 1}
                      </span>
                      <span className="font-medium">{item.name}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-semibold">{item.quantity} sold</span>
                      <span className="text-xs text-muted-foreground ml-2">₹{item.revenue.toLocaleString()}</span>
                    </div>
                  </div>
                ))}
                {(!analytics?.popularItems || analytics.popularItems.length === 0) && (
                  <p className="text-muted-foreground text-sm">No sales data yet</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid gap-4 md:grid-cols-3">
          <Link to="/admin/orders">
            <Card className="hover:shadow-md transition-shadow cursor-pointer group">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-primary/10 text-primary">
                    <Package className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">Manage Orders</h3>
                    <p className="text-sm text-muted-foreground">View and update all orders</p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link to="/admin/menu">
            <Card className="hover:shadow-md transition-shadow cursor-pointer group">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-orange-100 text-orange-600">
                    <ChefHat className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">Edit Menu</h3>
                    <p className="text-sm text-muted-foreground">Add or update menu items</p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link to="/admin/analytics">
            <Card className="hover:shadow-md transition-shadow cursor-pointer group">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-green-100 text-green-600">
                    <TrendingUp className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">View Analytics</h3>
                    <p className="text-sm text-muted-foreground">Sales reports & insights</p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Active Orders - Needs Attention */}
        {activeOrders.length > 0 && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
                  </span>
                  Active Orders
                </CardTitle>
                <CardDescription>Orders that need your attention</CardDescription>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link to="/admin/orders">View All</Link>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {activeOrders.slice(0, 5).map(order => {
                  const config = STATUS_CONFIG[order.status];
                  const nextStatus = NEXT_STATUS[order.status];
                  
                  return (
                    <div 
                      key={order.id} 
                      className="flex items-center justify-between p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex flex-col">
                          <span className="font-medium">{order.profile?.full_name || 'Customer'}</span>
                          <span className="text-sm text-muted-foreground">
                            {order.order_items.length} items • ₹{Number(order.total_amount).toLocaleString()}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <Badge className={`${config.bgColor} ${config.color} hover:${config.bgColor}`}>
                          {config.label}
                        </Badge>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {format(new Date(order.created_at), 'h:mm a')}
                        </span>
                        {nextStatus && (
                          <Button 
                            size="sm" 
                            onClick={() => handleQuickAction(order.id, order.status)}
                          >
                            Move to {STATUS_CONFIG[nextStatus].label}
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recent Orders */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Orders</CardTitle>
              <CardDescription>Latest order activity</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/admin/orders" className="gap-1">
                <Eye className="h-4 w-4" />
                View All
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-muted-foreground">Loading...</p>
            ) : orders.length === 0 ? (
              <div className="text-center py-8">
                <ShoppingBag className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
                <p className="text-muted-foreground">No orders yet.</p>
                <p className="text-sm text-muted-foreground">Orders will appear here once customers start ordering.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {orders.slice(0, 8).map(order => {
                  const config = STATUS_CONFIG[order.status];
                  
                  return (
                    <div 
                      key={order.id} 
                      className="flex items-center justify-between py-3 border-b border-border last:border-0"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${config.bgColor}`}>
                          {order.status === 'delivered' ? (
                            <CheckCircle className={`h-4 w-4 ${config.color}`} />
                          ) : order.status === 'cancelled' ? (
                            <XCircle className={`h-4 w-4 ${config.color}`} />
                          ) : (
                            <Package className={`h-4 w-4 ${config.color}`} />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{order.profile?.full_name || 'Customer'}</p>
                          <p className="text-sm text-muted-foreground">
                            {order.order_items.length} items • ₹{Number(order.total_amount).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant="outline" className={`${config.color}`}>
                          {config.label}
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-1">
                          {format(new Date(order.created_at), 'MMM d, h:mm a')}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
