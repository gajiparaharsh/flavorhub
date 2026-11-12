import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { ScrollReveal, ScrollRevealGroup } from '@/components/ScrollReveal';
import { Flame, Leaf, Star, Clock, ChefHat } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const IndianCuisinePage = () => {
  const dishes = [
    {
      name: "Butter Chicken",
      description: "Tender chicken in a rich, creamy tomato-based sauce with aromatic spices",
      image: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=400&q=80",
      spiceLevel: 2,
      isVeg: false,
      prepTime: "25 min"
    },
    {
      name: "Paneer Tikka Masala",
      description: "Grilled cottage cheese cubes in a spiced creamy gravy",
      image: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=400&q=80",
      spiceLevel: 2,
      isVeg: true,
      prepTime: "20 min"
    },
    {
      name: "Biryani",
      description: "Fragrant basmati rice layered with spiced meat and caramelized onions",
      image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400&q=80",
      spiceLevel: 3,
      isVeg: false,
      prepTime: "45 min"
    },
    {
      name: "Dal Makhani",
      description: "Slow-cooked black lentils in a buttery, creamy sauce",
      image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&q=80",
      spiceLevel: 1,
      isVeg: true,
      prepTime: "30 min"
    },
    {
      name: "Tandoori Chicken",
      description: "Marinated chicken roasted in a traditional clay oven",
      image: "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=400&q=80",
      spiceLevel: 3,
      isVeg: false,
      prepTime: "35 min"
    },
    {
      name: "Palak Paneer",
      description: "Cottage cheese cubes in a creamy spinach gravy",
      image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&q=80",
      spiceLevel: 1,
      isVeg: true,
      prepTime: "25 min"
    }
  ];

  const features = [
    {
      icon: ChefHat,
      title: "Authentic Recipes",
      description: "Traditional recipes passed down through generations of Indian chefs"
    },
    {
      icon: Flame,
      title: "Fresh Spices",
      description: "We import premium spices directly from India for authentic flavor"
    },
    {
      icon: Leaf,
      title: "Vegetarian Options",
      description: "Extensive selection of delicious vegetarian and vegan dishes"
    },
    {
      icon: Star,
      title: "Award Winning",
      description: "Recognized for excellence in Indian cuisine by food critics"
    }
  ];

  const renderSpiceLevel = (level: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3].map((i) => (
          <Flame
            key={i}
            className={`w-4 h-4 ${i <= level ? 'text-orange-500 fill-orange-500' : 'text-muted-foreground/30'}`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-20">
        {/* Hero Section */}
        <section className="relative py-24 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-red-500/10 to-yellow-500/10" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,hsl(25_95%_53%/0.15),transparent_50%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,hsl(0_72%_51%/0.15),transparent_50%)]" />
          
          <div className="container mx-auto px-4 relative z-10">
            <ScrollReveal variant="fade-up">
              <div className="text-center max-w-4xl mx-auto">
                <span className="inline-block px-4 py-2 bg-orange-500/10 text-orange-600 dark:text-orange-400 rounded-full text-sm font-medium mb-6">
                  🇮🇳 Taste of India
                </span>
                <h1 className="font-heading text-5xl sm:text-6xl lg:text-7xl font-bold text-foreground mb-6">
                  Authentic <span className="text-gradient bg-gradient-to-r from-orange-500 via-red-500 to-yellow-500 bg-clip-text text-transparent">Indian Cuisine</span>
                </h1>
                <p className="text-muted-foreground text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed">
                  Experience the rich flavors and aromatic spices of India. From creamy curries 
                  to sizzling tandoori dishes, every bite is a journey to the heart of Indian culture.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
                  <Button asChild size="lg" className="rounded-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600">
                    <Link to="/menu">Explore Menu</Link>
                  </Button>
                  <Button asChild variant="outline" size="lg" className="rounded-full border-orange-500/50 text-orange-600 dark:text-orange-400 hover:bg-orange-500/10">
                    <Link to="/about">Back to About</Link>
                  </Button>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* Features */}
        <section className="py-20 bg-gradient-to-b from-orange-500/5 to-transparent">
          <div className="container mx-auto px-4">
            <ScrollRevealGroup 
              className="grid md:grid-cols-2 lg:grid-cols-4 gap-6" 
              staggerDelay={100}
              variant="fade-up"
            >
              {features.map((feature) => (
                <div 
                  key={feature.title}
                  className="text-center p-6 bg-card rounded-2xl shadow-soft border border-border/50 hover:shadow-elevated hover:-translate-y-1 transition-all duration-300"
                >
                  <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-orange-500/20 to-red-500/20 flex items-center justify-center">
                    <feature.icon className="w-7 h-7 text-orange-500" />
                  </div>
                  <h3 className="font-heading text-lg font-semibold text-foreground mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground text-sm">{feature.description}</p>
                </div>
              ))}
            </ScrollRevealGroup>
          </div>
        </section>

        {/* Signature Dishes */}
        <section className="py-24">
          <div className="container mx-auto px-4">
            <ScrollReveal variant="fade-up">
              <div className="text-center max-w-3xl mx-auto mb-16">
                <span className="inline-block px-4 py-2 bg-orange-500/10 text-orange-600 dark:text-orange-400 rounded-full text-sm font-medium mb-6">
                  Chef's Specials
                </span>
                <h2 className="font-heading text-4xl lg:text-5xl font-bold text-foreground mb-6">
                  Signature <span className="text-gradient bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">Dishes</span>
                </h2>
                <p className="text-muted-foreground text-lg">
                  Our most beloved Indian dishes, crafted with authentic spices and traditional techniques.
                </p>
              </div>
            </ScrollReveal>

            <ScrollRevealGroup 
              className="grid md:grid-cols-2 lg:grid-cols-3 gap-8" 
              staggerDelay={100}
              variant="zoom-in"
            >
              {dishes.map((dish) => (
                <div 
                  key={dish.name}
                  className="group bg-card rounded-3xl overflow-hidden shadow-soft hover:shadow-elevated transition-all duration-300 border border-border/50"
                >
                  <div className="aspect-[4/3] overflow-hidden relative">
                    <img
                      src={dish.image}
                      alt={dish.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute top-4 left-4 flex gap-2">
                      {dish.isVeg && (
                        <span className="px-3 py-1 bg-green-500 text-white text-xs font-medium rounded-full flex items-center gap-1">
                          <Leaf className="w-3 h-3" /> Veg
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-heading text-xl font-semibold text-foreground">
                        {dish.name}
                      </h3>
                      {renderSpiceLevel(dish.spiceLevel)}
                    </div>
                    <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                      {dish.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        {dish.prepTime}
                      </div>
                      <Button size="sm" variant="outline" className="rounded-full border-orange-500/50 text-orange-600 dark:text-orange-400 hover:bg-orange-500/10">
                        View Details
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </ScrollRevealGroup>
          </div>
        </section>

        {/* Story Section */}
        <section className="py-24 bg-gradient-to-br from-orange-500/5 via-red-500/5 to-yellow-500/5">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <ScrollReveal variant="fade-right">
                <div className="relative">
                  <div className="absolute -inset-4 bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-3xl blur-2xl" />
                  <img
                    src="https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=600&q=80"
                    alt="Indian spices"
                    className="relative rounded-3xl shadow-elevated w-full aspect-[4/3] object-cover"
                  />
                </div>
              </ScrollReveal>

              <ScrollReveal variant="fade-left">
                <div>
                  <span className="inline-block px-4 py-2 bg-orange-500/10 text-orange-600 dark:text-orange-400 rounded-full text-sm font-medium mb-6">
                    Our Heritage
                  </span>
                  <h2 className="font-heading text-4xl lg:text-5xl font-bold text-foreground mb-6">
                    A Culinary Journey Through <span className="text-gradient bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">India</span>
                  </h2>
                  <div className="space-y-4 text-muted-foreground leading-relaxed">
                    <p>
                      Our Indian kitchen is led by chefs who grew up learning the art of Indian cooking 
                      from their families. Each recipe tells a story of tradition, passed down through 
                      generations.
                    </p>
                    <p>
                      We source our spices directly from the spice markets of Kerala, Rajasthan, and 
                      Kashmir, ensuring that every dish captures the authentic essence of Indian cuisine.
                    </p>
                    <p>
                      From the fiery curries of the South to the rich, creamy dishes of the North, 
                      we bring you the diverse flavors of India's culinary landscape.
                    </p>
                  </div>
                  <Button asChild size="lg" className="mt-8 rounded-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600">
                    <Link to="/menu">Order Indian Cuisine</Link>
                  </Button>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-24">
          <div className="container mx-auto px-4">
            <ScrollReveal variant="zoom-in">
              <div className="relative rounded-3xl overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-red-500" />
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1596797038530-2c107229654b?w=1200&q=80')] bg-cover bg-center opacity-20" />
                <div className="relative z-10 text-center py-16 px-8">
                  <h2 className="font-heading text-4xl lg:text-5xl font-bold text-white mb-6">
                    Ready to Spice Up Your Day?
                  </h2>
                  <p className="text-white/90 text-lg mb-8 max-w-2xl mx-auto">
                    Order now and experience the authentic taste of India delivered to your doorstep.
                  </p>
                  <Button asChild size="lg" className="rounded-full bg-white text-orange-600 hover:bg-white/90">
                    <Link to="/menu">Order Now</Link>
                  </Button>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default IndianCuisinePage;
