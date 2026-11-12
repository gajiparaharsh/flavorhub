import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { FoodCard } from '@/components/FoodCard';
import { Button } from '@/components/ui/button';
import { useFavorites } from '@/hooks/useFavorites';
import { useMenuItems } from '@/hooks/useMenuItems';
import { useAuth } from '@/context/AuthContext';
import { Link, Navigate } from 'react-router-dom';
import { Heart, Loader2, UtensilsCrossed } from 'lucide-react';

const FavoritesPage = () => {
  const { user, loading: authLoading } = useAuth();
  const { favorites, loading: favoritesLoading } = useFavorites();
  const { items: menuItems, loading: menuLoading } = useMenuItems();

  const loading = authLoading || favoritesLoading || menuLoading;

  // Get favorite menu items
  const favoriteItems = menuItems
    .filter(item => favorites.some(f => f.menu_item_id === item.id))
    .map(item => ({
      id: item.id,
      name: item.name,
      description: item.description || '',
      price: Number(item.price),
      image: item.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&q=80',
      category: item.category,
    }));

  if (!authLoading && !user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24 pb-16">
        {/* Header */}
        <section className="relative py-16 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-warm" />
          <div className="absolute top-10 right-10 w-64 h-64 bg-red-500/10 rounded-full blur-3xl" />
          
          <div className="container mx-auto px-4 text-center relative z-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-500/10 rounded-full text-red-500 text-sm font-medium mb-6 animate-fade-in">
              <Heart className="w-4 h-4 fill-current" />
              <span>Your Favorites</span>
            </div>
            
            <h1 className="font-heading text-4xl sm:text-5xl font-bold text-foreground mb-4 animate-fade-in">
              Saved <span className="text-red-500">Favorites</span>
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto animate-fade-in animation-delay-200">
              All your favorite dishes in one place. Quick access to the food you love.
            </p>
          </div>
        </section>

        {/* Favorites Grid */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="relative">
                  <div className="w-16 h-16 border-4 border-red-500/20 rounded-full" />
                  <div className="absolute inset-0 w-16 h-16 border-4 border-red-500 border-t-transparent rounded-full animate-spin" />
                </div>
                <p className="mt-4 text-muted-foreground">Loading your favorites...</p>
              </div>
            ) : favoriteItems.length > 0 ? (
              <>
                <p className="text-muted-foreground mb-8">
                  You have <span className="text-foreground font-semibold">{favoriteItems.length}</span> {favoriteItems.length === 1 ? 'favorite' : 'favorites'}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {favoriteItems.map((item, index) => (
                    <div 
                      key={item.id}
                      className="animate-fade-up"
                      style={{ 
                        animationDelay: `${(index % 8) * 0.05}s`,
                        animationFillMode: 'backwards'
                      }}
                    >
                      <FoodCard item={item} />
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-20">
                <div className="inline-flex items-center justify-center w-24 h-24 bg-muted/50 rounded-full mb-6">
                  <Heart className="w-12 h-12 text-muted-foreground" />
                </div>
                <h3 className="font-heading text-2xl font-semibold text-foreground mb-3">
                  No favorites yet
                </h3>
                <p className="text-muted-foreground max-w-md mx-auto mb-8">
                  Start exploring our menu and save your favorite dishes by clicking the heart icon.
                </p>
                <Link to="/menu">
                  <Button variant="hero" size="lg">
                    <UtensilsCrossed className="mr-2 h-5 w-5" />
                    Explore Menu
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default FavoritesPage;
