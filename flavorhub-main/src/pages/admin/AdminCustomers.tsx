import { useState, useMemo } from 'react';
import { Users, Package, IndianRupee, Phone, MapPin, ChevronDown, ChevronUp, RefreshCw, Search, Filter } from 'lucide-react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { useAdminCustomers, Customer } from '@/hooks/useAdminCustomers';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { format } from 'date-fns';

const STATUS_CONFIG: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  pending: { label: 'Pending', variant: 'secondary' },
  confirmed: { label: 'Confirmed', variant: 'default' },
  preparing: { label: 'Preparing', variant: 'default' },
  out_for_delivery: { label: 'Out for Delivery', variant: 'default' },
  delivered: { label: 'Delivered', variant: 'outline' },
  cancelled: { label: 'Cancelled', variant: 'destructive' },
};

function CustomerRow({ customer }: { customer: Customer }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <TableRow className="hover:bg-muted/50">
        <TableCell>
          <div className="font-medium">{customer.full_name || 'No name'}</div>
          <div className="text-sm text-muted-foreground">
            Joined {format(new Date(customer.created_at), 'MMM d, yyyy')}
          </div>
        </TableCell>
        <TableCell>
          {customer.phone ? (
            <div className="flex items-center gap-1 text-sm">
              <Phone className="h-3 w-3" />
              {customer.phone}
            </div>
          ) : (
            <span className="text-muted-foreground text-sm">Not provided</span>
          )}
        </TableCell>
        <TableCell>
          {customer.address ? (
            <div className="flex items-center gap-1 text-sm max-w-[200px] truncate">
              <MapPin className="h-3 w-3 flex-shrink-0" />
              {customer.address}
            </div>
          ) : (
            <span className="text-muted-foreground text-sm">Not provided</span>
          )}
        </TableCell>
        <TableCell className="text-center">
          <Badge variant="outline">{customer.order_count}</Badge>
        </TableCell>
        <TableCell className="text-right font-medium">
          ₹{customer.total_spent.toFixed(2)}
        </TableCell>
        <TableCell>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" disabled={customer.order_count === 0}>
              {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              <span className="ml-1">Orders</span>
            </Button>
          </CollapsibleTrigger>
        </TableCell>
      </TableRow>
      <CollapsibleContent asChild>
        <TableRow className="bg-muted/30">
          <TableCell colSpan={6} className="p-4">
            {customer.orders.length > 0 ? (
              <div className="space-y-3">
                <h4 className="font-medium text-sm">Order History</h4>
                <div className="space-y-2">
                  {customer.orders.map(order => {
                    const statusConfig = STATUS_CONFIG[order.status] || { label: order.status, variant: 'secondary' as const };
                    return (
                      <div key={order.id} className="bg-background rounded-lg p-3 border">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">
                              #{order.id.slice(0, 8)}
                            </span>
                            <Badge variant={statusConfig.variant}>{statusConfig.label}</Badge>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {format(new Date(order.created_at), 'MMM d, yyyy h:mm a')}
                          </div>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {order.order_items.map(item => (
                            <span key={item.id} className="mr-2">
                              {item.quantity}x {item.menu_item_name}
                            </span>
                          ))}
                        </div>
                        <div className="text-right font-medium mt-2">
                          ₹{Number(order.total_amount).toFixed(2)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">No orders yet</p>
            )}
          </TableCell>
        </TableRow>
      </CollapsibleContent>
    </Collapsible>
  );
}

export default function AdminCustomers() {
  const { customers, loading, refetch } = useAdminCustomers();
  const [searchQuery, setSearchQuery] = useState('');
  const [orderFilter, setOrderFilter] = useState<'all' | 'with-orders' | 'no-orders'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'most-orders' | 'most-spent'>('newest');

  const filteredCustomers = useMemo(() => {
    let result = [...customers];

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(c =>
        c.full_name?.toLowerCase().includes(query) ||
        c.phone?.toLowerCase().includes(query) ||
        c.address?.toLowerCase().includes(query)
      );
    }

    // Apply order filter
    if (orderFilter === 'with-orders') {
      result = result.filter(c => c.order_count > 0);
    } else if (orderFilter === 'no-orders') {
      result = result.filter(c => c.order_count === 0);
    }

    // Apply sorting
    if (sortBy === 'newest') {
      result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    } else if (sortBy === 'most-orders') {
      result.sort((a, b) => b.order_count - a.order_count);
    } else if (sortBy === 'most-spent') {
      result.sort((a, b) => b.total_spent - a.total_spent);
    }

    return result;
  }, [customers, searchQuery, orderFilter, sortBy]);

  const totalCustomers = customers.length;
  const activeCustomers = customers.filter(c => c.order_count > 0).length;
  const totalRevenue = customers.reduce((sum, c) => sum + c.total_spent, 0);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-heading font-bold">Customer Management</h1>
            <p className="text-muted-foreground">View all customers and their order history</p>
          </div>
          <Button variant="outline" onClick={refetch} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <div className="text-2xl font-bold">{totalCustomers}</div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Customers</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <div className="text-2xl font-bold">{activeCustomers}</div>
              )}
              <p className="text-xs text-muted-foreground">Customers with orders</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <IndianRupee className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <div className="text-2xl font-bold">₹{totalRevenue.toFixed(2)}</div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Customers Table */}
        <Card>
          <CardHeader>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <CardTitle>All Customers</CardTitle>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search name, phone, address..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 w-full sm:w-[250px]"
                  />
                </div>
                <Select value={orderFilter} onValueChange={(v) => setOrderFilter(v as typeof orderFilter)}>
                  <SelectTrigger className="w-full sm:w-[150px]">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Filter" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Customers</SelectItem>
                    <SelectItem value="with-orders">With Orders</SelectItem>
                    <SelectItem value="no-orders">No Orders</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={sortBy} onValueChange={(v) => setSortBy(v as typeof sortBy)}>
                  <SelectTrigger className="w-full sm:w-[150px]">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="most-orders">Most Orders</SelectItem>
                    <SelectItem value="most-spent">Most Spent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : filteredCustomers.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>{searchQuery || orderFilter !== 'all' ? 'No customers match your filters' : 'No customers found'}</p>
                {(searchQuery || orderFilter !== 'all') && (
                  <Button
                    variant="link"
                    onClick={() => { setSearchQuery(''); setOrderFilter('all'); }}
                    className="mt-2"
                  >
                    Clear filters
                  </Button>
                )}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Address</TableHead>
                    <TableHead className="text-center">Orders</TableHead>
                    <TableHead className="text-right">Total Spent</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCustomers.map(customer => (
                    <CustomerRow key={customer.id} customer={customer} />
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
