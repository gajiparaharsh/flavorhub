import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MenuItem } from '@/data/menu';
import { useCart } from '@/context/CartContext';
import { useFavorites } from '@/hooks/useFavorites';
import { DietaryLabels } from './DietaryLabels';
import { cn } from '@/lib/utils';
import { 
  Plus, 
  Minus, 
  ShoppingCart, 
  Heart, 
  Flame, 
  Wheat, 
  Droplets, 
  Beef,
  Leaf,
  Clock,
  Star,
  AlertTriangle
} from 'lucide-react';

interface FoodItemModalProps {
  item: MenuItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Mock nutritional data - in a real app this would come from the database
const getNutritionalInfo = (item: MenuItem) => {
  const baseCalories = Math.floor(item.price * 1.5 + 100);
  return {
    calories: baseCalories,
    protein: Math.floor(baseCalories * 0.08),
    carbs: Math.floor(baseCalories * 0.12),
    fat: Math.floor(baseCalories * 0.05),
    fiber: Math.floor(Math.random() * 5 + 2),
    prepTime: Math.floor(Math.random() * 15 + 10),
    rating: (Math.random() * 1 + 4).toFixed(1),
    reviews: Math.floor(Math.random() * 200 + 50),
  };
};

export function FoodItemModal({ item, open, onOpenChange }: FoodItemModalProps) {
  const { addToCart } = useCart();
  const { isFavorite, toggleFavorite } = useFavorites();
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [isTogglingFavorite, setIsTogglingFavorite] = useState(false);

  const isLiked = item ? isFavorite(item.id) : false;

  const handleToggleFavorite = async () => {
    if (!item || isTogglingFavorite) return;
    setIsTogglingFavorite(true);
    await toggleFavorite(item.id, item.name);
    setIsTogglingFavorite(false);
  };

  if (!item) return null;

  const nutritionalInfo = getNutritionalInfo(item);

  const handleAddToCart = () => {
    setIsAdding(true);
    for (let i = 0; i < quantity; i++) {
      addToCart(item);
    }
    setTimeout(() => {
      setIsAdding(false);
      setQuantity(1);
      onOpenChange(false);
    }, 500);
  };

  const incrementQuantity = () => setQuantity(prev => Math.min(prev + 1, 10));
  const decrementQuantity = () => setQuantity(prev => Math.max(prev - 1, 1));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl p-0 overflow-hidden bg-card border-border">
        <div className="grid md:grid-cols-2 gap-0">
          {/* Image Section */}
          <div className="relative h-64 md:h-full min-h-[300px]">
            <img
              src={item.image}
              alt={item.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-foreground/40 to-transparent" />
            
            {/* Like Button */}
            <button
              onClick={handleToggleFavorite}
              disabled={isTogglingFavorite}
              className={cn(
                "absolute top-4 right-4 p-3 rounded-full transition-all duration-300 z-20",
                "bg-background/90 backdrop-blur-sm hover:bg-background shadow-lg",
                isLiked && "text-red-500",
                isTogglingFavorite && "opacity-50"
              )}
            >
              <Heart className={cn("h-5 w-5 transition-transform", isLiked && "fill-current scale-110")} />
            </button>

            {/* Category Badge */}
            <Badge 
              className="absolute bottom-14 left-4 bg-primary text-primary-foreground font-medium z-10"
            >
              {item.category}
            </Badge>

            {/* Rating */}
            <div className="absolute bottom-4 left-4 flex items-center gap-2 bg-background/90 backdrop-blur-sm px-3 py-1.5 rounded-full z-10">
              <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
              <span className="font-semibold text-sm">{nutritionalInfo.rating}</span>
              <span className="text-muted-foreground text-xs">({nutritionalInfo.reviews})</span>
            </div>
          </div>

          {/* Content Section */}
          <div className="p-6 flex flex-col">
            <DialogHeader className="text-left mb-4">
              <DialogTitle className="font-heading text-2xl font-bold text-foreground">
                {item.name}
              </DialogTitle>
            </DialogHeader>

            {/* Description */}
            <p className="text-muted-foreground leading-relaxed mb-4">
              {item.description}
            </p>

            {/* Dietary Labels */}
            {(item.isVegan || item.isGlutenFree || item.containsNuts || item.containsDairy || item.allergenInfo) && (
              <div className="mb-4">
                <h4 className="font-semibold text-sm text-foreground mb-2 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                  Dietary Information
                </h4>
                <DietaryLabels
                  isVegan={item.isVegan}
                  isGlutenFree={item.isGlutenFree}
                  containsNuts={item.containsNuts}
                  containsDairy={item.containsDairy}
                  allergenInfo={item.allergenInfo}
                  size="md"
                />
              </div>
            )}

            {/* Prep Time */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
              <Clock className="h-4 w-4" />
              <span>{nutritionalInfo.prepTime}-{nutritionalInfo.prepTime + 5} mins prep time</span>
            </div>

            {/* Nutritional Info */}
            <div className="mb-6">
              <h4 className="font-semibold text-sm text-foreground mb-3 flex items-center gap-2">
                <Leaf className="h-4 w-4 text-green-500" />
                Nutritional Information
              </h4>
              <div className="grid grid-cols-4 gap-2">
                <div className="bg-muted/50 rounded-xl p-3 text-center">
                  <Flame className="h-4 w-4 text-orange-500 mx-auto mb-1" />
                  <span className="block text-lg font-bold text-foreground">{nutritionalInfo.calories}</span>
                  <span className="text-xs text-muted-foreground">Calories</span>
                </div>
                <div className="bg-muted/50 rounded-xl p-3 text-center">
                  <Beef className="h-4 w-4 text-red-500 mx-auto mb-1" />
                  <span className="block text-lg font-bold text-foreground">{nutritionalInfo.protein}g</span>
                  <span className="text-xs text-muted-foreground">Protein</span>
                </div>
                <div className="bg-muted/50 rounded-xl p-3 text-center">
                  <Wheat className="h-4 w-4 text-amber-500 mx-auto mb-1" />
                  <span className="block text-lg font-bold text-foreground">{nutritionalInfo.carbs}g</span>
                  <span className="text-xs text-muted-foreground">Carbs</span>
                </div>
                <div className="bg-muted/50 rounded-xl p-3 text-center">
                  <Droplets className="h-4 w-4 text-blue-500 mx-auto mb-1" />
                  <span className="block text-lg font-bold text-foreground">{nutritionalInfo.fat}g</span>
                  <span className="text-xs text-muted-foreground">Fat</span>
                </div>
              </div>
            </div>

            {/* Spacer */}
            <div className="flex-grow" />

            {/* Price & Quantity */}
            <div className="border-t border-border pt-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <span className="text-sm text-muted-foreground">Price</span>
                  <div className="text-3xl font-bold text-primary">₹{item.price * quantity}</div>
                </div>

                {/* Quantity Selector */}
                <div className="flex items-center gap-3 bg-muted/50 rounded-full p-1">
                  <button
                    onClick={decrementQuantity}
                    disabled={quantity <= 1}
                    className="p-2 rounded-full bg-background hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="w-8 text-center font-semibold text-lg">{quantity}</span>
                  <button
                    onClick={incrementQuantity}
                    disabled={quantity >= 10}
                    className="p-2 rounded-full bg-background hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Add to Cart Button */}
              <Button
                variant="hero"
                size="lg"
                onClick={handleAddToCart}
                disabled={isAdding}
                className={cn(
                  "w-full shadow-button",
                  isAdding && "animate-pulse"
                )}
              >
                <ShoppingCart className="h-5 w-5 mr-2" />
                {isAdding ? 'Adding...' : `Add ${quantity} to Cart • ₹${item.price * quantity}`}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
