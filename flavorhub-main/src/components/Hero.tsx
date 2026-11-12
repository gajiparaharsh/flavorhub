import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles, Star, Clock, Truck } from 'lucide-react';
import { useParallax } from '@/hooks/useParallax';
import heroPizza from '@/assets/hero-pizza-exploding.png';
import noodlesBg from '@/assets/noodles-bg.png';

import pizzaIcon from '@/assets/pizza-icon.png';
import burgerIcon from '@/assets/burger-icon.png';

export function Hero() {
  const { scrollY } = useParallax();

  return (
    <section className="relative min-h-[95vh] flex items-center justify-center overflow-hidden">
      {/* Animated Background with Parallax */}
      <div 
        className="absolute inset-0 bg-gradient-warm"
        style={{ transform: `translateY(${scrollY * 0.3}px)` }}
      >
        <div className="absolute inset-0 pattern-dots opacity-50" />
      </div>

      {/* Floating Blobs with Parallax */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div 
          className="absolute top-10 left-[10%] w-80 h-80 bg-primary/15 blob blob-animate blur-3xl" 
          style={{ transform: `translateY(${scrollY * 0.15}px)` }}
        />
        <div 
          className="absolute top-1/3 right-[5%] w-96 h-96 bg-accent-foreground/10 blob blob-animate blur-3xl" 
          style={{ animationDelay: '-3s', transform: `translateY(${scrollY * 0.25}px)` }}
        />
        <div 
          className="absolute bottom-20 left-[20%] w-64 h-64 bg-primary/10 blob blob-animate blur-3xl" 
          style={{ animationDelay: '-5s', transform: `translateY(${scrollY * 0.1}px)` }}
        />
        
        {/* Decorative Noodles Background Image */}
        <img 
          src={noodlesBg}
          alt=""
          className="absolute -bottom-10 -left-20 w-72 h-72 object-contain opacity-15 dark:opacity-10 blur-[1px] rotate-12 animate-float-slow"
          style={{ 
            animationDelay: '-2s',
            transform: `translateY(${scrollY * 0.2}px)`,
            filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.1)) blur(1px)'
          }}
        />
        <img 
          src={noodlesBg}
          alt=""
          className="absolute top-20 -right-16 w-64 h-64 object-contain opacity-10 dark:opacity-[0.06] blur-[2px] -rotate-12 animate-float"
          style={{ 
            animationDelay: '-4s',
            transform: `translateY(${scrollY * 0.15}px) scale(-1, 1)`,
            filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.1)) blur(2px)'
          }}
        />
      </div>

      <div className="container mx-auto px-4 relative z-10 pt-20">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Text Content with Parallax */}
          <div 
            className="text-center lg:text-left"
            style={{ transform: `translateY(${scrollY * 0.1}px)` }}
          >
            {/* Badge */}
            <div 
              className="inline-flex items-center gap-2 bg-primary/10 text-primary px-5 py-2.5 rounded-full text-sm font-semibold mb-8 animate-fade-up border border-primary/20"
            >
              <Sparkles className="h-4 w-4" />
              <span>Fresh & Delicious Daily</span>
            </div>
            
            {/* Heading */}
            <h1 
              className="font-heading text-5xl sm:text-6xl lg:text-7xl font-bold text-foreground leading-[1.1] mb-8 animate-fade-up" 
              style={{ animationDelay: '0.1s' }}
            >
              Experience
              <span className="text-gradient block mt-3">Flavor Magic</span>
            </h1>
            
            {/* Description */}
            <p 
              className="text-muted-foreground text-lg sm:text-xl mb-10 max-w-xl mx-auto lg:mx-0 leading-relaxed animate-fade-up" 
              style={{ animationDelay: '0.2s' }}
            >
              Discover a world of culinary excellence delivered right to your doorstep. 
              From gourmet classics to exotic flavors — every bite tells a story.
            </p>
            
            {/* CTA Buttons */}
            <div 
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start animate-fade-up" 
              style={{ animationDelay: '0.3s' }}
            >
              <Link to="/menu">
                <Button variant="hero" size="xl" className="group w-full sm:w-auto btn-glow shadow-button">
                  Order Now
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link to="/about">
                <Button variant="outline" size="xl" className="w-full sm:w-auto glass">
                  Our Story
                </Button>
              </Link>
            </div>

            {/* Trust Badges */}
            <div 
              className="flex flex-wrap items-center justify-center lg:justify-start gap-6 mt-12 animate-fade-up" 
              style={{ animationDelay: '0.4s' }}
            >
              <div className="flex items-center gap-2 text-sm">
                <div className="p-2 rounded-full bg-primary/10">
                  <Star className="h-4 w-4 text-primary fill-primary" />
                </div>
                <span className="text-muted-foreground">4.9 Rating</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="p-2 rounded-full bg-primary/10">
                  <Clock className="h-4 w-4 text-primary" />
                </div>
                <span className="text-muted-foreground">15 min Delivery</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="p-2 rounded-full bg-primary/10">
                  <Truck className="h-4 w-4 text-primary" />
                </div>
                <span className="text-muted-foreground">Free Delivery ₹500+</span>
              </div>
            </div>
          </div>

          {/* Hero Image with Parallax */}
          <div 
            className="relative animate-fade-up" 
            style={{ animationDelay: '0.2s', transform: `translateY(${scrollY * -0.15}px)` }}
          >
            <div className="relative w-full max-w-xl mx-auto group">
              {/* Animated Glow Effect */}
              <div 
                className="absolute inset-0 bg-gradient-hero rounded-full blur-3xl opacity-25 animate-pulse-soft scale-110 group-hover:opacity-40 transition-opacity duration-500" 
                style={{ transform: `translateY(${scrollY * 0.05}px) scale(1.1)` }}
              />
              
              {/* Rotating Ring with Parallax */}
              <div 
                className="absolute -inset-4 border-2 border-dashed border-primary/20 rounded-full animate-spin-slow pointer-events-none" 
                style={{ transform: `translateY(${scrollY * -0.08}px) rotate(${scrollY * 0.1}deg)` }}
              />
              
              {/* Main Image with Parallax-like Float */}
              {/* Main Pizza Image */}
              <div className="relative w-full aspect-square flex items-center justify-center animate-float-slow bg-transparent">
                {/* Warm orange radial glow behind pizza */}
                <div 
                  className="absolute inset-0 rounded-full opacity-60 blur-3xl pointer-events-none"
                  style={{
                    background: 'radial-gradient(circle at center, rgba(255, 140, 50, 0.5) 0%, rgba(255, 100, 30, 0.3) 30%, rgba(255, 80, 20, 0.15) 50%, transparent 70%)'
                  }}
                />
                <img
                  src={heroPizza}
                  alt="Delicious pizza slice with melting cheese"
                  className="relative z-10 w-full h-full object-contain transition-transform duration-700 hover:scale-110"
                  style={{
                    filter: 'drop-shadow(0 25px 50px rgba(0, 0, 0, 0.3)) drop-shadow(0 10px 20px rgba(255, 120, 40, 0.2))'
                  }}
                />
              </div>
              
              {/* Floating Cards with Enhanced Parallax */}
              <div 
                className="absolute -left-6 top-1/4 glass-strong p-4 rounded-2xl shadow-elevated animate-float hover-scale cursor-pointer"
                style={{ animationDelay: '1s', transform: `translateY(${scrollY * -0.2}px) translateX(${scrollY * -0.05}px)` }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl overflow-hidden">
                    <img src={pizzaIcon} alt="Pizza" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground text-sm">Pizza Special</p>
                    <p className="text-primary font-bold text-lg">₹399</p>
                  </div>
                </div>
              </div>
              
              <div 
                className="absolute -right-4 bottom-1/4 glass-strong p-4 rounded-2xl shadow-elevated animate-float hover-scale cursor-pointer"
                style={{ animationDelay: '1.5s', transform: `translateY(${scrollY * -0.25}px) translateX(${scrollY * 0.05}px)` }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl overflow-hidden">
                    <img src={burgerIcon} alt="Burger" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground text-sm">Gourmet Burger</p>
                    <p className="text-primary font-bold text-lg">₹299</p>
                  </div>
                </div>
              </div>

              {/* Rating Badge with Parallax */}
              <div 
                className="absolute -right-2 top-8 glass-strong px-4 py-2 rounded-full shadow-elevated animate-float"
                style={{ animationDelay: '2s', transform: `translateY(${scrollY * -0.18}px)` }}
              >
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                  ))}
                  <span className="ml-1 font-semibold text-sm">4.9</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Wave with Parallax */}
      <div 
        className="absolute bottom-0 left-0 right-0"
        style={{ transform: `translateY(${scrollY * 0.2}px)` }}
      >
        <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
          <path 
            d="M0 120L48 110C96 100 192 80 288 70C384 60 480 60 576 65C672 70 768 80 864 85C960 90 1056 90 1152 85C1248 80 1344 70 1392 65L1440 60V120H1392C1344 120 1248 120 1152 120C1056 120 960 120 864 120C768 120 672 120 576 120C480 120 384 120 288 120C192 120 96 120 48 120H0Z" 
            fill="hsl(var(--background))"
          />
        </svg>
      </div>
    </section>
  );
}
