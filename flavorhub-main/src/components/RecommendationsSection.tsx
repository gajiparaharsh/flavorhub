import { FoodCard } from '@/components/FoodCard';
import { useRecommendations } from '@/hooks/useRecommendations';
import { useAuth } from '@/context/AuthContext';
import { useMenuItems } from '@/hooks/useMenuItems';
import { Sparkles, Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

export function RecommendationsSection() {
  const { user } = useAuth();
  const { recommendations, loading, refetch } = useRecommendations();
  const { items: menuItems } = useMenuItems();

  // Transform recommendations to FoodCard format
  const transformedRecommendations = recommendations.map(rec => {
    const menuItem = menuItems.find(m => m.id === rec.id);
    return {
      id: rec.id,
      name: rec.name,
      description: rec.description || '',
      price: Number(rec.price),
      image: menuItem?.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&q=80',
      category: rec.category,
    };
  });

  if (!user) {
    return (
      <section className="py-16 bg-gradient-warm">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary text-sm font-medium mb-4">
              <Sparkles className="w-4 h-4" />
              <span>AI-Powered</span>
            </div>
            <h2 className="font-heading text-3xl font-bold text-foreground mb-4">
              Personalized Recommendations
            </h2>
            <p className="text-muted-foreground max-w-md mx-auto mb-6">
              Sign in to get AI-powered dish recommendations based on your favorites and order history.
            </p>
            <Link to="/auth">
              <Button variant="hero">Sign In for Recommendations</Button>
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-gradient-warm relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-accent/5 rounded-full blur-3xl" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary text-sm font-medium mb-4">
              <Sparkles className="w-4 h-4" />
              <span>AI-Powered</span>
            </div>
            <h2 className="font-heading text-3xl font-bold text-foreground">
              Recommended for You
            </h2>
            <p className="text-muted-foreground mt-2">
              Personalized picks based on your favorites and order history
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={refetch}
            disabled={loading}
            className="hidden sm:flex gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="relative">
              <div className="w-12 h-12 border-4 border-primary/20 rounded-full" />
              <div className="absolute inset-0 w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
            <p className="mt-4 text-muted-foreground">Getting personalized recommendations...</p>
          </div>
        ) : transformedRecommendations.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {transformedRecommendations.map((item, index) => (
              <div 
                key={item.id}
                className="animate-fade-up"
                style={{ 
                  animationDelay: `${index * 0.1}s`,
                  animationFillMode: 'backwards'
                }}
              >
                <FoodCard item={item} />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              Add some favorites or place orders to get personalized recommendations!
            </p>
            <Link to="/menu" className="mt-4 inline-block">
              <Button variant="hero">Explore Menu</Button>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
