import React, { useState, useRef, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { FoodCard } from '@/components/FoodCard';
import { ScrollReveal } from '@/components/ScrollReveal';
import FestivalOffersBanner from '@/components/FestivalOffersBanner';
import { useMenuItems } from '@/hooks/useMenuItems';
import { Search, Loader2, Sparkles, UtensilsCrossed, Pizza, Salad, Fish, Cookie, Cake, ChefHat, Leaf, WheatOff, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

const categoryIcons: Record<string, React.ReactNode> = {
  'All': <Sparkles className="w-4 h-4" />,
  'Burgers': <UtensilsCrossed className="w-4 h-4" />,
  'Pizza': <Pizza className="w-4 h-4" />,
  'Salads': <Salad className="w-4 h-4" />,
  'Seafood': <Fish className="w-4 h-4" />,
  'Appetizers': <Cookie className="w-4 h-4" />,
  'Desserts': <Cake className="w-4 h-4" />,
};

type DietFilter = 'all' | 'veg' | 'nonveg';
type DietaryFilter = 'vegan' | 'gluten-free' | 'allergen-free';

const MenuPage = () => {
  const { items, loading, categories } = useMenuItems();
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [dietFilter, setDietFilter] = useState<DietFilter>('all');
  const [dietaryFilters, setDietaryFilters] = useState<DietaryFilter[]>([]);
  const [isFiltering, setIsFiltering] = useState(false);
  const tabsRef = useRef<HTMLDivElement>(null);
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });

  // Memoize allCategories to prevent re-renders
  const allCategories = React.useMemo(() => ['All', ...categories], [categories]);

  // Update indicator position when active category changes
  useEffect(() => {
    if (tabsRef.current) {
      const activeTab = tabsRef.current.querySelector(`[data-category="${activeCategory}"]`) as HTMLButtonElement;
      if (activeTab) {
        const newLeft = activeTab.offsetLeft;
        const newWidth = activeTab.offsetWidth;
        // Only update if values actually changed to prevent infinite loop
        setIndicatorStyle(prev => {
          if (prev.left === newLeft && prev.width === newWidth) {
            return prev;
          }
          return { left: newLeft, width: newWidth };
        });
      }
    }
  }, [activeCategory, allCategories]);

  const handleCategoryChange = (category: string) => {
    setIsFiltering(true);
    setActiveCategory(category);
    setTimeout(() => setIsFiltering(false), 300);
  };

  const handleDietChange = (filter: DietFilter) => {
    setIsFiltering(true);
    setDietFilter(filter);
    setTimeout(() => setIsFiltering(false), 300);
  };

  const toggleDietaryFilter = (filter: DietaryFilter) => {
    setIsFiltering(true);
    setDietaryFilters(prev =>
      prev.includes(filter)
        ? prev.filter(f => f !== filter)
        : [...prev, filter]
    );
    setTimeout(() => setIsFiltering(false), 300);
  };

  const filteredItems = items.filter(item => {
    const matchesCategory = activeCategory === 'All' || item.category === activeCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
    const matchesDiet = dietFilter === 'all' ||
      (dietFilter === 'veg' && item.is_vegetarian) ||
      (dietFilter === 'nonveg' && !item.is_vegetarian);

    // Check dietary filters
    const matchesDietary = dietaryFilters.every(filter => {
      if (filter === 'vegan') return item.is_vegan;
      if (filter === 'gluten-free') return item.is_gluten_free;
      if (filter === 'allergen-free') return !item.contains_nuts && !item.contains_dairy && !item.allergen_info;
      return true;
    });

    return matchesCategory && matchesSearch && matchesDiet && matchesDietary;
  });

  // Transform database items to match FoodCard expected format
  const transformedItems = filteredItems.map(item => ({
    id: item.id,
    name: item.name,
    description: item.description || '',
    price: Number(item.price),
    image: item.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&q=80',
    category: item.category,
    isVegetarian: item.is_vegetarian ?? false,
    isVegan: item.is_vegan ?? false,
    isGlutenFree: item.is_gluten_free ?? false,
    containsNuts: item.contains_nuts ?? false,
    containsDairy: item.contains_dairy ?? false,
    allergenInfo: item.allergen_info ?? null,
    spiceLevel: item.spice_level ?? 0,
  }));

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <FestivalOffersBanner />

      <main className="pt-24 pb-16">
        {/* Header with animated background */}
        <section className="relative py-20 overflow-hidden">
          {/* Animated background */}
          <div className="absolute inset-0 bg-gradient-warm" />
          <div className="absolute inset-0 bg-grid-pattern opacity-30" />
          <div className="absolute top-10 left-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl animate-blob" />
          <div className="absolute bottom-10 right-10 w-72 h-72 bg-accent/20 rounded-full blur-3xl animate-blob animation-delay-2000" />

          <div className="container mx-auto px-4 text-center relative z-10">
            <ScrollReveal variant="fade-down">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary text-sm font-medium mb-6">
                <ChefHat className="w-4 h-4" />
                <span>Fresh & Delicious</span>
              </div>
            </ScrollReveal>

            <ScrollReveal variant="fade-up" delay={100}>
              <h1 className="font-heading text-5xl sm:text-6xl font-bold text-foreground mb-6">
                Explore Our <span className="text-gradient-hero">Menu</span>
              </h1>
            </ScrollReveal>

            <ScrollReveal variant="fade-up" delay={200}>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-10">
                Discover our carefully curated selection of dishes, crafted with passion and the finest ingredients.
              </p>
            </ScrollReveal>

            {/* Enhanced Search Bar */}
            <ScrollReveal variant="zoom-in" delay={300} className="relative max-w-xl mx-auto mb-12">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 rounded-2xl blur-xl opacity-50" />
              <div className="relative">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search for your favorite dish..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-14 pr-6 py-4 rounded-2xl bg-card/80 backdrop-blur-sm border border-border/50 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all duration-300 text-foreground placeholder:text-muted-foreground shadow-soft"
                />
              </div>
            </ScrollReveal>

            {/* Veg/Non-Veg Filter */}
            <ScrollReveal variant="fade-up" delay={400} className="flex justify-center gap-2 mb-4">
              <button
                onClick={() => handleDietChange('all')}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 flex items-center gap-2",
                  dietFilter === 'all'
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "bg-card/80 text-muted-foreground hover:text-foreground border border-border/50"
                )}
              >
                All
              </button>
              <button
                onClick={() => handleDietChange('veg')}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 flex items-center gap-2",
                  dietFilter === 'veg'
                    ? "bg-green-600 text-white shadow-md"
                    : "bg-card/80 text-muted-foreground hover:text-foreground border border-border/50"
                )}
              >
                <span className="w-3 h-3 border-2 border-green-600 rounded-sm flex items-center justify-center">
                  <span className="w-1.5 h-1.5 bg-green-600 rounded-full" />
                </span>
                Veg
              </button>
              <button
                onClick={() => handleDietChange('nonveg')}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 flex items-center gap-2",
                  dietFilter === 'nonveg'
                    ? "bg-red-600 text-white shadow-md"
                    : "bg-card/80 text-muted-foreground hover:text-foreground border border-border/50"
                )}
              >
                <span className="w-3 h-3 border-2 border-red-600 rounded-sm flex items-center justify-center">
                  <span className="w-0 h-0 border-l-[3px] border-r-[3px] border-b-[5px] border-l-transparent border-r-transparent border-b-red-600" />
                </span>
                Non-Veg
              </button>
            </ScrollReveal>

            {/* Dietary Filter Buttons */}
            <ScrollReveal variant="fade-up" delay={500} className="flex justify-center flex-wrap gap-2 mb-6">
              <button
                onClick={() => toggleDietaryFilter('vegan')}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 flex items-center gap-2",
                  dietaryFilters.includes('vegan')
                    ? "bg-emerald-600 text-white shadow-md"
                    : "bg-card/80 text-muted-foreground hover:text-foreground border border-border/50"
                )}
              >
                <Leaf className="w-4 h-4" />
                Vegan
              </button>
              <button
                onClick={() => toggleDietaryFilter('gluten-free')}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 flex items-center gap-2",
                  dietaryFilters.includes('gluten-free')
                    ? "bg-amber-600 text-white shadow-md"
                    : "bg-card/80 text-muted-foreground hover:text-foreground border border-border/50"
                )}
              >
                <WheatOff className="w-4 h-4" />
                Gluten-Free
              </button>
              <button
                onClick={() => toggleDietaryFilter('allergen-free')}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 flex items-center gap-2",
                  dietaryFilters.includes('allergen-free')
                    ? "bg-blue-600 text-white shadow-md"
                    : "bg-card/80 text-muted-foreground hover:text-foreground border border-border/50"
                )}
              >
                <AlertTriangle className="w-4 h-4" />
                Allergen-Free
              </button>
            </ScrollReveal>

            {/* Animated Category Tabs */}
            <ScrollReveal variant="zoom-in" delay={600} className="relative inline-block">
              <div className="relative bg-card/80 backdrop-blur-sm rounded-2xl p-2 shadow-soft border border-border/50">
                {/* Sliding indicator */}
                <div
                  className="absolute top-2 h-[calc(100%-16px)] bg-gradient-hero rounded-xl transition-all duration-300 ease-out shadow-lg"
                  style={{
                    left: `${indicatorStyle.left}px`,
                    width: `${indicatorStyle.width}px`,
                  }}
                />

                {/* Category tabs */}
                <div ref={tabsRef} className="relative flex flex-wrap justify-center gap-1">
                  {allCategories.map((category) => (
                    <button
                      key={category}
                      data-category={category}
                      onClick={() => handleCategoryChange(category)}
                      className={cn(
                        "relative px-5 py-3 rounded-xl font-medium text-sm transition-all duration-300 flex items-center gap-2",
                        activeCategory === category
                          ? "text-primary-foreground"
                          : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                      )}
                    >
                      {categoryIcons[category] || <UtensilsCrossed className="w-4 h-4" />}
                      <span>{category}</span>
                    </button>
                  ))}
                </div>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* Menu Grid with filtering animation */}
        <section className="py-16 relative">
          <div className="container mx-auto px-4">
            {/* Results count */}
            <ScrollReveal variant="fade-left" className="flex items-center justify-between mb-8">
              <p className="text-muted-foreground">
                Showing <span className="text-foreground font-semibold">{transformedItems.length}</span> {transformedItems.length === 1 ? 'dish' : 'dishes'}
                {activeCategory !== 'All' && (
                  <span> in <span className="text-primary font-medium">{activeCategory}</span></span>
                )}
              </p>
            </ScrollReveal>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="relative">
                  <div className="w-16 h-16 border-4 border-primary/20 rounded-full" />
                  <div className="absolute inset-0 w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
                <p className="mt-4 text-muted-foreground">Loading delicious dishes...</p>
              </div>
            ) : transformedItems.length > 0 ? (
              <div
                className={cn(
                  "transition-all duration-300",
                  isFiltering && "opacity-0 scale-95"
                )}
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {transformedItems.map((item, index) => (
                    <div
                      key={item.id}
                      className="animate-fade-in-up"
                      style={{ animationDelay: `${Math.min(index * 40, 800)}ms` }}
                    >
                      <FoodCard item={item} />
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <ScrollReveal variant="zoom-in" className="text-center py-20">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-muted/50 rounded-full mb-6">
                  <Search className="w-10 h-10 text-muted-foreground" />
                </div>
                <h3 className="font-heading text-2xl font-semibold text-foreground mb-3">
                  No dishes found
                </h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  We couldn't find any dishes matching your criteria. Try adjusting your search or selecting a different category.
                </p>
                <button
                  onClick={() => {
                    setActiveCategory('All');
                    setSearchQuery('');
                    setDietFilter('all');
                    setDietaryFilters([]);
                  }}
                  className="mt-6 px-6 py-3 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition-colors"
                >
                  Clear Filters
                </button>
              </ScrollReveal>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default MenuPage;
