import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { ScrollReveal, ScrollRevealGroup } from '@/components/ScrollReveal';
import { ChefHat, Heart, Leaf, Users, Clock, Award, MapPin, Phone, Mail, Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
const AboutPage = () => {
  const stats = [
    { number: "10+", label: "Years of Excellence" },
    { number: "50K+", label: "Happy Customers" },
    { number: "200+", label: "Menu Items" },
    { number: "15", label: "Expert Chefs" },
  ];

  const values = [
    {
      icon: Leaf,
      title: "Fresh Ingredients",
      description: "We source only the finest, freshest ingredients from local farms and trusted suppliers."
    },
    {
      icon: Heart,
      title: "Made with Love",
      description: "Every dish is crafted with passion and care, ensuring an unforgettable dining experience."
    },
    {
      icon: Users,
      title: "Community First",
      description: "We're more than a restaurant - we're a gathering place for friends and family."
    },
    {
      icon: Award,
      title: "Quality Assured",
      description: "Our commitment to excellence has earned us recognition and loyal customers."
    }
  ];

  const team = [
    {
      name: "Chef Rajesh Sharma",
      role: "Head Chef",
      image: "/images/chef-rajesh.png",
      description: "25 years of authentic Indian cuisine mastery"
    },
    {
      name: "Priya Patel",
      role: "Pastry Chef",
      image: "/images/chef-priya.png",
      description: "Expert in traditional Indian sweets & fusion desserts"
    },
    {
      name: "Vikram Singh",
      role: "Sous Chef",
      image: "/images/chef-vikram.png",
      description: "Spice specialist & regional cuisine expert"
    }
  ];

  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1500));

    toast({
      title: "Message Sent! 🎉",
      description: "Thank you for reaching out. We'll get back to you within 24 hours.",
    });

    setFormData({ name: '', email: '', subject: '', message: '' });
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-20">
        {/* Hero Section */}
        <section className="relative py-24 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-secondary/20 to-accent/10" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,hsl(var(--primary)/0.15),transparent_50%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,hsl(var(--accent)/0.15),transparent_50%)]" />

          <div className="container mx-auto px-4 relative z-10">
            <ScrollReveal variant="fade-up">
              <div className="text-center max-w-4xl mx-auto">
                <span className="inline-block px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium mb-6">
                  Est. 2014
                </span>
                <h1 className="font-heading text-5xl sm:text-6xl lg:text-7xl font-bold text-foreground mb-6">
                  About <span className="text-gradient">FlavorHub</span>
                </h1>
                <p className="text-muted-foreground text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed">
                  Where passion meets flavor, and every meal tells a story. We've been serving
                  delicious moments since 2014.
                </p>
              </div>
            </ScrollReveal>

            {/* Stats */}
            <ScrollReveal variant="fade-up" delay={200}>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16 max-w-4xl mx-auto">
                {stats.map((stat, index) => (
                  <div
                    key={stat.label}
                    className="text-center p-6 rounded-2xl bg-card/50 backdrop-blur-sm border border-border/50 shadow-soft hover:shadow-elevated transition-all duration-300 hover:-translate-y-1"
                  >
                    <span className="block text-4xl font-bold font-heading text-primary mb-2">
                      {stat.number}
                    </span>
                    <span className="text-sm text-muted-foreground">{stat.label}</span>
                  </div>
                ))}
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* Our Story */}
        <section className="py-24 bg-secondary/30">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <ScrollReveal variant="fade-right">
                <div className="relative">
                  <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 to-accent/20 rounded-3xl blur-2xl" />
                  <video
                    src="/Vid/Video Project.mp4"
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="relative rounded-3xl shadow-elevated w-full aspect-[4/3] object-cover"
                  />
                  <div className="absolute -bottom-8 -right-8 bg-card p-6 rounded-2xl shadow-elevated border border-border/50">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <ChefHat className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <span className="block text-2xl font-bold font-heading text-foreground">10+</span>
                        <span className="text-sm text-muted-foreground">Years of Excellence</span>
                      </div>
                    </div>
                  </div>
                </div>
              </ScrollReveal>

              <ScrollReveal variant="fade-left">
                <div>
                  <span className="inline-block px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium mb-6">
                    Our Journey
                  </span>
                  <h2 className="font-heading text-4xl lg:text-5xl font-bold text-foreground mb-6">
                    The <span className="text-gradient">FlavorHub</span> Story
                  </h2>
                  <div className="space-y-4 text-muted-foreground leading-relaxed">
                    <p>
                      FlavorHub was born from a simple idea: everyone deserves access to delicious,
                      quality food without the hassle. What started as a small kitchen dream has
                      grown into a beloved destination for food lovers everywhere.
                    </p>
                    <p>
                      Our team of passionate chefs combines traditional recipes with modern
                      techniques to create dishes that not only satisfy your hunger but also
                      delight your senses. We source ingredients from local farms and trusted
                      suppliers to ensure every bite is fresh and flavorful.
                    </p>
                    <p>
                      We believe that great food brings people together, and we're committed
                      to making every meal a memorable experience. From our kitchen to your table,
                      we put love and care into everything we do.
                    </p>
                  </div>
                  <div className="flex gap-4 mt-8">
                    <Button asChild variant="default" size="lg" className="rounded-full">
                      <Link to="/menu">Explore Menu</Link>
                    </Button>
                    <Button asChild variant="outline" size="lg" className="rounded-full">
                      <Link to="/auth">Join Us</Link>
                    </Button>
                  </div>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="py-24">
          <div className="container mx-auto px-4">
            <ScrollReveal variant="fade-up">
              <div className="text-center max-w-3xl mx-auto mb-16">
                <span className="inline-block px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium mb-6">
                  What Drives Us
                </span>
                <h2 className="font-heading text-4xl lg:text-5xl font-bold text-foreground mb-6">
                  Our Core <span className="text-gradient">Values</span>
                </h2>
                <p className="text-muted-foreground text-lg">
                  These principles guide everything we do, from sourcing ingredients to serving our guests.
                </p>
              </div>
            </ScrollReveal>

            <ScrollRevealGroup
              className="grid md:grid-cols-2 lg:grid-cols-4 gap-8"
              staggerDelay={100}
              variant="fade-up"
            >
              {values.map((value) => (
                <div
                  key={value.title}
                  className="group text-center p-8 bg-card rounded-3xl shadow-soft border border-border/50 hover:shadow-elevated hover:-translate-y-2 transition-all duration-300"
                >
                  <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 group-hover:scale-110 transition-all duration-300">
                    <value.icon className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="font-heading text-xl font-semibold text-foreground mb-3">
                    {value.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{value.description}</p>
                </div>
              ))}
            </ScrollRevealGroup>
          </div>
        </section>

        {/* Cuisine Spotlight */}
        <section className="py-24 bg-gradient-to-br from-orange-500/5 via-red-500/5 to-yellow-500/5">
          <div className="container mx-auto px-4">
            <ScrollReveal variant="fade-up">
              <div className="text-center max-w-3xl mx-auto mb-12">
                <span className="inline-block px-4 py-2 bg-orange-500/10 text-orange-600 dark:text-orange-400 rounded-full text-sm font-medium mb-6">
                  Explore Our Cuisines
                </span>
                <h2 className="font-heading text-4xl lg:text-5xl font-bold text-foreground mb-6">
                  Cuisine <span className="text-gradient bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">Spotlight</span>
                </h2>
                <p className="text-muted-foreground text-lg">
                  Discover the diverse culinary traditions we bring to your table.
                </p>
              </div>
            </ScrollReveal>

            <ScrollReveal variant="zoom-in">
              <Link
                to="/about/indian"
                className="group block max-w-4xl mx-auto bg-card rounded-3xl overflow-hidden shadow-soft hover:shadow-elevated transition-all duration-300 border border-border/50"
              >
                <div className="grid md:grid-cols-2">
                  <div className="aspect-[4/3] md:aspect-auto overflow-hidden">
                    <img
                      src="https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=600&q=80"
                      alt="Indian Cuisine"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-8 flex flex-col justify-center">
                    <span className="inline-block w-fit px-3 py-1 bg-orange-500/10 text-orange-600 dark:text-orange-400 rounded-full text-xs font-medium mb-4">
                      🇮🇳 Featured
                    </span>
                    <h3 className="font-heading text-2xl font-bold text-foreground mb-3">
                      Indian Cuisine
                    </h3>
                    <p className="text-muted-foreground mb-6">
                      Experience the rich flavors and aromatic spices of India. From creamy curries to sizzling tandoori dishes.
                    </p>
                    <Button className="w-fit rounded-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600">
                      Explore Indian Cuisine →
                    </Button>
                  </div>
                </div>
              </Link>
            </ScrollReveal>
          </div>
        </section>

        {/* Team Section */}
        <section className="py-24 bg-secondary/30">
          <div className="container mx-auto px-4">
            <ScrollReveal variant="fade-up">
              <div className="text-center max-w-3xl mx-auto mb-16">
                <span className="inline-block px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium mb-6">
                  Meet The Team
                </span>
                <h2 className="font-heading text-4xl lg:text-5xl font-bold text-foreground mb-6">
                  Our Culinary <span className="text-gradient">Masters</span>
                </h2>
                <p className="text-muted-foreground text-lg">
                  The talented individuals behind every delicious dish at FlavorHub.
                </p>
              </div>
            </ScrollReveal>

            <ScrollRevealGroup
              className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto"
              staggerDelay={150}
              variant="zoom-in"
            >
              {team.map((member) => (
                <div
                  key={member.name}
                  className="group relative bg-card rounded-3xl overflow-hidden shadow-soft hover:shadow-elevated transition-all duration-300"
                >
                  <div className="aspect-[3/4] overflow-hidden">
                    <img
                      src={member.image}
                      alt={member.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                    <h3 className="font-heading text-xl font-semibold mb-1">{member.name}</h3>
                    <p className="text-primary font-medium text-sm mb-2">{member.role}</p>
                    <p className="text-white/70 text-sm">{member.description}</p>
                  </div>
                </div>
              ))}
            </ScrollRevealGroup>
          </div>
        </section>

        {/* Contact Info */}
        <section className="py-24">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <ScrollReveal variant="fade-right">
                <div>
                  <span className="inline-block px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium mb-6">
                    Get In Touch
                  </span>
                  <h2 className="font-heading text-4xl lg:text-5xl font-bold text-foreground mb-6">
                    Visit Us <span className="text-gradient">Today</span>
                  </h2>
                  <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
                    We'd love to welcome you to FlavorHub. Whether you're stopping by for a quick bite
                    or a special celebration, our doors are always open.
                  </p>

                  <div className="space-y-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <MapPin className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-foreground mb-1">Location</h4>
                        <p className="text-muted-foreground">123 Flavor Street, Food District<br />Culinary City, FC 12345</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Clock className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-foreground mb-1">Hours</h4>
                        <p className="text-muted-foreground">Mon - Fri: 10:00 AM - 10:00 PM<br />Sat - Sun: 9:00 AM - 11:00 PM</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Phone className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-foreground mb-1">Phone</h4>
                        <p className="text-muted-foreground">+1 (555) 123-4567</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Mail className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-foreground mb-1">Email</h4>
                        <p className="text-muted-foreground">hello@flavorhub.com</p>
                      </div>
                    </div>
                  </div>
                </div>
              </ScrollReveal>

              <ScrollReveal variant="fade-left">
                <div className="relative">
                  <div className="absolute -inset-4 bg-gradient-to-r from-accent/20 to-primary/20 rounded-3xl blur-2xl" />
                  <form
                    onSubmit={handleSubmit}
                    className="relative bg-card rounded-3xl shadow-elevated p-8 border border-border/50"
                  >
                    <h3 className="font-heading text-2xl font-bold text-foreground mb-6">
                      Send Us a Message
                    </h3>

                    <div className="space-y-5">
                      <div className="grid sm:grid-cols-2 gap-5">
                        <div className="space-y-2">
                          <Label htmlFor="name">Your Name</Label>
                          <Input
                            id="name"
                            name="name"
                            placeholder="John Doe"
                            value={formData.name}
                            onChange={handleInputChange}
                            required
                            className="rounded-xl"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">Email Address</Label>
                          <Input
                            id="email"
                            name="email"
                            type="email"
                            placeholder="john@example.com"
                            value={formData.email}
                            onChange={handleInputChange}
                            required
                            className="rounded-xl"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="subject">Subject</Label>
                        <Input
                          id="subject"
                          name="subject"
                          placeholder="How can we help you?"
                          value={formData.subject}
                          onChange={handleInputChange}
                          required
                          className="rounded-xl"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="message">Message</Label>
                        <Textarea
                          id="message"
                          name="message"
                          placeholder="Tell us more about your inquiry..."
                          value={formData.message}
                          onChange={handleInputChange}
                          required
                          rows={5}
                          className="rounded-xl resize-none"
                        />
                      </div>

                      <Button
                        type="submit"
                        size="lg"
                        className="w-full rounded-xl"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Sending...
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4 mr-2" />
                            Send Message
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10">
          <div className="container mx-auto px-4">
            <ScrollReveal variant="zoom-in">
              <div className="text-center max-w-3xl mx-auto">
                <h2 className="font-heading text-4xl lg:text-5xl font-bold text-foreground mb-6">
                  Ready to Experience <span className="text-gradient">FlavorHub</span>?
                </h2>
                <p className="text-muted-foreground text-lg mb-8">
                  Join thousands of happy customers and discover your new favorite dishes today.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button asChild size="lg" className="rounded-full px-8">
                    <Link to="/menu">Order Now</Link>
                  </Button>
                  <Button asChild variant="outline" size="lg" className="rounded-full px-8">
                    <Link to="/auth">Create Account</Link>
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

export default AboutPage;
