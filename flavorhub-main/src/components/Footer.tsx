import { Link } from 'react-router-dom';
import { useRestaurantHours } from '@/hooks/useRestaurantHours';
import { cn } from '@/lib/utils';
export function Footer() {
  const {
    isOpen,
    statusMessage,
    formattedHours
  } = useRestaurantHours();
  return <footer className="bg-secondary/50 border-t border-border">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <span className="text-2xl">🍽️</span>
              <span className="font-heading text-xl font-bold text-foreground">
                Flavor<span className="text-primary">Hub</span>
              </span>
            </Link>
            <p className="text-muted-foreground text-sm">
              Delivering delicious meals right to your doorstep. Quality ingredients, exceptional taste.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-heading font-semibold text-foreground mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li><Link to="/menu" className="text-muted-foreground hover:text-primary transition-colors text-sm">Menu</Link></li>
              <li><Link to="/about" className="text-muted-foreground hover:text-primary transition-colors text-sm">About Us</Link></li>
              <li><Link to="/cart" className="text-muted-foreground hover:text-primary transition-colors text-sm">Cart</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-heading font-semibold text-foreground mb-4">Contact</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>📍 Food Express Restaurant, Near Kalwa Chowk, M.G. Road, Junagadh – 362001, Gujarat, India. 🍽️📍</li>
              <li>📞  +91 98765 43210</li>
              <li>✉️ hello@yumfood.com</li>
            </ul>
          </div>

          {/* Hours */}
          <div>
            <h4 className="font-heading font-semibold text-foreground mb-4">Hours</h4>
            <div className={cn("inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium mb-3", isOpen ? "bg-green-500/10 text-green-600" : "bg-red-500/10 text-red-500")}>
              <span className={cn("w-1.5 h-1.5 rounded-full", isOpen ? "bg-green-500 animate-pulse" : "bg-red-500")} />
              {isOpen ? 'Open Now' : 'Closed'} · {statusMessage}
            </div>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>Mon-Fri: {formattedHours.weekdays}</li>
              <li>Saturday: {formattedHours.saturday}</li>
              <li>Sunday: {formattedHours.sunday}</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-8 text-center text-muted-foreground text-sm">
          <p>© 2025 FlavorHub. All rights reserved.</p>
        </div>
      </div>
    </footer>;
}