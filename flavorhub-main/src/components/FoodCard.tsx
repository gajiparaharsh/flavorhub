import { Plus, Heart, Eye, Flame } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MenuItem } from '@/data/menu';
import { useCart } from '@/context/CartContext';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { FoodItemModal } from './FoodItemModal';
import { useFavorites } from '@/hooks/useFavorites';
import { DietaryLabels } from './DietaryLabels';

interface FoodCardProps {
  item: MenuItem;
}

export function FoodCard({ item }: FoodCardProps) {
  const { addToCart } = useCart();
  const { isFavorite, toggleFavorite } = useFavorites();
  const [isAdding, setIsAdding] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTogglingFavorite, setIsTogglingFavorite] = useState(false);

  const isLiked = isFavorite(item.id);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsAdding(true);
    addToCart(item);
    setTimeout(() => setIsAdding(false), 300);
  };

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isTogglingFavorite) return;
    setIsTogglingFavorite(true);
    await toggleFavorite(item.id, item.name);
    setIsTogglingFavorite(false);
  };

  return (
    <>
      <div 
        className="group card-premium rounded-2xl overflow-hidden hover-lift cursor-pointer"
        onClick={() => setIsModalOpen(true)}
      >
        {/* Image Container */}
        <div className="relative h-52 overflow-hidden">
          <img
            src={item.image}
            alt={item.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
          
          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-foreground/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          {/* Category Badge */}
          <Badge 
            variant="secondary" 
            className="absolute top-3 left-3 bg-background/95 backdrop-blur-sm text-foreground font-medium shadow-sm"
          >
            {item.category}
          </Badge>


          {/* Like Button */}
          <button
            onClick={handleToggleFavorite}
            disabled={isTogglingFavorite}
            className={cn(
              "absolute top-3 right-3 p-2 rounded-full transition-all duration-300",
              "bg-background/80 backdrop-blur-sm hover:bg-background shadow-sm",
              isLiked && "text-red-500",
              isTogglingFavorite && "opacity-50"
            )}
          >
            <Heart className={cn("h-4 w-4 transition-transform", isLiked && "fill-current scale-110")} />
          </button>

          {/* Quick Actions - appear on hover */}
          <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0 flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                setIsModalOpen(true);
              }}
              className="flex-1 bg-background/90 backdrop-blur-sm hover:bg-background"
            >
              <Eye className="h-4 w-4 mr-2" />
              View
            </Button>
            <Button
              variant="hero"
              size="sm"
              onClick={handleAddToCart}
              className={cn(
                "flex-1 shadow-button",
                isAdding && "animate-scale-in"
              )}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="p-5">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="font-heading text-lg font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1">
              {item.name}
            </h3>
            {/* Veg/Non-Veg Indicator */}
            <div 
              className={cn(
                "w-4 h-4 border-2 rounded flex items-center justify-center flex-shrink-0",
                item.isVegetarian ? "border-green-600" : "border-red-600"
              )}
              title={item.isVegetarian ? "Vegetarian" : "Non-Vegetarian"}
            >
              {item.isVegetarian ? (
                <span className="w-1.5 h-1.5 bg-green-600 rounded-full" />
              ) : (
                <span className="w-0 h-0 border-l-[3px] border-r-[3px] border-b-[5px] border-l-transparent border-r-transparent border-b-red-600" />
              )}
            </div>
            {/* Spice Level Indicator */}
            {(item.spiceLevel ?? 0) > 0 && (
              <div 
                className="flex items-center gap-0.5 flex-shrink-0"
                title={`Spice Level: ${item.spiceLevel === 1 ? 'Medium' : item.spiceLevel === 2 ? 'Hot' : 'Extra Hot'}`}
              >
                {Array.from({ length: item.spiceLevel ?? 0 }).map((_, i) => (
                  <Flame 
                    key={i} 
                    className={cn(
                      "h-3.5 w-3.5",
                      item.spiceLevel === 1 ? "text-yellow-500" : 
                      item.spiceLevel === 2 ? "text-orange-500" : 
                      "text-red-500"
                    )} 
                    fill="currentColor"
                  />
                ))}
              </div>
            )}
          </div>
          
          {/* Dietary Labels */}
          <DietaryLabels
            isVegan={item.isVegan}
            isGlutenFree={item.isGlutenFree}
            containsNuts={item.containsNuts}
            containsDairy={item.containsDairy}
            allergenInfo={item.allergenInfo}
            size="sm"
          />
          
          <p className="text-muted-foreground text-sm mb-4 line-clamp-2 leading-relaxed mt-2">
            {item.description}
          </p>
          
          {/* Price & Action */}
          <div className="flex items-center justify-between">
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-primary">₹{item.price}</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleAddToCart}
              className={cn(
                "h-10 w-10 rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-300 md:flex hidden",
                isAdding && "animate-scale-in bg-primary text-primary-foreground"
              )}
            >
              <Plus className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      <FoodItemModal 
        item={item} 
        open={isModalOpen} 
        onOpenChange={setIsModalOpen} 
      />
    </>
  );
}
