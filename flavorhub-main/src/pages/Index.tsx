import { Navbar } from '@/components/Navbar';
import { Hero } from '@/components/Hero';
import { Footer } from '@/components/Footer';
import { FoodCard } from '@/components/FoodCard';
import { RecommendationsSection } from '@/components/RecommendationsSection';
import { ScrollReveal, ScrollRevealGroup } from '@/components/ScrollReveal';
import FestivalOffersBanner from '@/components/FestivalOffersBanner';
import { useMenuItems } from '@/hooks/useMenuItems';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, ChefHat, Truck, Clock, Shield, Loader2 } from 'lucide-react';

const Index = () => {
  const { items, loading } = useMenuItems();
  
  // Transform and get first 4 items for featured section
  const featuredItems = items.slice(0, 4).map(item => ({
    id: item.id,
    name: item.name,
    description: item.description || '',
    price: Number(item.price),
    image: item.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&q=80',
    category: item.category,
    isVegetarian: item.is_vegetarian ?? false,
    spiceLevel: item.spice_level ?? 0,
  }));

  const features = [
    { 
      icon: ChefHat, 
      title: "Master Chefs", 
      description: "Our expert chefs craft every dish with passion and precision.",
      color: "bg-primary/10 text-primary"
    },
    { 
      icon: Truck, 
      title: "Fast Delivery", 
      description: "Hot and fresh food at your doorstep in 15-30 minutes.",
      color: "bg-green-500/10 text-green-600"
    },
    { 
      icon: Clock, 
      title: "Fresh Daily", 
      description: "We source the freshest ingredients every single day.",
      color: "bg-amber-500/10 text-amber-600"
    },
    { 
      icon: Shield, 
      title: "Quality Promise", 
      description: "100% satisfaction guaranteed or your money back.",
      color: "bg-blue-500/10 text-blue-600"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <FestivalOffersBanner />
      
      <main>
        <Hero />

        {/* Featured Menu Section */}
        <section className="py-24 bg-background relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -translate-y-1/2" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent-foreground/5 rounded-full blur-3xl translate-y-1/2" />
          
          <div className="container mx-auto px-4 relative z-10">
            <ScrollReveal variant="fade-up" className="text-center mb-16">
              <span className="inline-block text-primary font-semibold text-sm tracking-wider uppercase mb-4">
                Our Menu
              </span>
              <h2 className="font-heading text-4xl sm:text-5xl font-bold text-foreground mb-6">
                Featured <span className="text-gradient">Dishes</span>
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
                Handpicked favorites by our chef — each dish is a masterpiece of flavor and presentation.
              </p>
            </ScrollReveal>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <ScrollRevealGroup 
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
                staggerDelay={100}
                variant="fade-up"
              >
                {featuredItems.map((item) => (
                  <FoodCard key={item.id} item={item} />
                ))}
              </ScrollRevealGroup>
            )}

            <ScrollReveal variant="zoom-in" delay={400} className="text-center mt-16">
              <Link to="/menu">
                <Button variant="hero" size="lg" className="group shadow-button btn-glow">
                  Explore Full Menu
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            </ScrollReveal>
          </div>
        </section>

        {/* AI Recommendations */}
        <RecommendationsSection />

        {/* Why Choose Us */}
        <section className="py-24 bg-gradient-warm relative overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute inset-0 pattern-grid opacity-30" />
          
          <div className="container mx-auto px-4 relative z-10">
            <ScrollReveal variant="fade-up" className="text-center mb-16">
              <span className="inline-block text-primary font-semibold text-sm tracking-wider uppercase mb-4">
                Why Choose Us
              </span>
              <h2 className="font-heading text-4xl sm:text-5xl font-bold text-foreground mb-6">
                The FlavorHub <span className="text-gradient">Difference</span>
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
                We don't just deliver food — we deliver happiness, one delicious meal at a time.
              </p>
            </ScrollReveal>

            <ScrollRevealGroup 
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
              staggerDelay={100}
              variant="zoom-in"
            >
              {features.map((feature) => (
                <div 
                  key={feature.title}
                  className="group card-premium p-8 rounded-2xl hover-lift text-center"
                >
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl ${feature.color} mb-6 transition-transform duration-300 group-hover:scale-110`}>
                    <feature.icon className="h-8 w-8" />
                  </div>
                  <h3 className="font-heading text-xl font-semibold text-foreground mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              ))}
            </ScrollRevealGroup>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 bg-background relative overflow-hidden">
          <div className="absolute inset-0">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-hero opacity-10 blur-3xl rounded-full" />
          </div>
          
          <div className="container mx-auto px-4 relative z-10">
            <ScrollReveal variant="blur-in" className="max-w-3xl mx-auto text-center">
              <h2 className="font-heading text-4xl sm:text-5xl font-bold text-foreground mb-6">
                Ready to Order?
              </h2>
              <p className="text-muted-foreground text-lg mb-10">
                Join thousands of happy customers who trust FlavorHub for their daily cravings. 
                Fresh, fast, and always delicious.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/menu">
                  <Button variant="hero" size="xl" className="group shadow-button btn-glow">
                    Start Ordering
                    <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
              </div>
            </ScrollReveal>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
