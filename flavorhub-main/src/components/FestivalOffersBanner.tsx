import { useState } from 'react';
import { Gift, X, Clock, Percent, BadgeIndianRupee } from 'lucide-react';
import { usePromotions } from '@/hooks/usePromotions';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const FestivalOffersBanner = () => {
  const { promotions, loading } = usePromotions();
  const [dismissed, setDismissed] = useState<string[]>([]);

  if (loading || promotions.length === 0) return null;

  const activeOffers = promotions.filter(p => !dismissed.includes(p.id));
  if (activeOffers.length === 0) return null;

  const formatExpiry = (date: string) => {
    const expiry = new Date(date);
    const now = new Date();
    const diffDays = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 0) return 'Expires today';
    if (diffDays === 1) return 'Expires tomorrow';
    return `${diffDays} days left`;
  };

  return (
    <div className="bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 border-b border-primary/20">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center gap-3 overflow-x-auto scrollbar-hide">
          <div className="flex items-center gap-2 shrink-0">
            <Gift className="h-5 w-5 text-primary animate-pulse" />
            <span className="font-semibold text-foreground">Festival Offers:</span>
          </div>
          
          <div className="flex gap-3 overflow-x-auto pb-1">
            {activeOffers.slice(0, 3).map((offer) => (
              <div
                key={offer.id}
                className="flex items-center gap-3 bg-background/80 backdrop-blur-sm rounded-lg px-4 py-2 border border-primary/20 shrink-0 group hover:border-primary/40 transition-colors"
              >
                <div className="flex items-center gap-2">
                  {offer.discount_type === 'percentage' ? (
                    <Percent className="h-4 w-4 text-primary" />
                  ) : (
                    <BadgeIndianRupee className="h-4 w-4 text-primary" />
                  )}
                  <div>
                    <p className="font-medium text-sm text-foreground">{offer.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {offer.discount_type === 'percentage' 
                        ? `${offer.discount_value}% off` 
                        : `₹${offer.discount_value} off`}
                      {offer.min_order_amount > 0 && ` on ₹${offer.min_order_amount}+`}
                    </p>
                  </div>
                </div>
                
                {offer.code && (
                  <Badge variant="secondary" className="font-mono text-xs">
                    {offer.code}
                  </Badge>
                )}
                
                {offer.expires_at && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {formatExpiry(offer.expires_at)}
                  </div>
                )}
                
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => setDismissed([...dismissed, offer.id])}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FestivalOffersBanner;
