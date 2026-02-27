import { Link } from '@tanstack/react-router';
import { ShoppingBag, Wrench, ArrowRight, Star, Users, Shield } from 'lucide-react';

export default function HomePage() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-secondary/10">
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium">
                <Star className="w-4 h-4 fill-current" />
                Student-Powered Marketplace
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-foreground leading-tight">
                Buy, Sell &amp; Hire
                <span className="text-primary block">Within Campus</span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-md">
                The trusted student hub for textbooks, electronics, and peer services. 
                Connect with fellow students safely and easily.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  to="/marketplace"
                  className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-xl font-semibold hover:opacity-90 transition-opacity shadow-md"
                >
                  Browse Marketplace
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/services"
                  className="inline-flex items-center gap-2 border-2 border-primary text-primary px-6 py-3 rounded-xl font-semibold hover:bg-primary/5 transition-colors"
                >
                  Find Services
                </Link>
              </div>
            </div>
            <div className="hidden md:block">
              <img
                src="/assets/generated/student-hub-hero.dim_1200x400.png"
                alt="Student Hub"
                className="w-full rounded-2xl shadow-2xl object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Category Cards */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-3">What are you looking for?</h2>
          <p className="text-muted-foreground">Browse our two main categories</p>
        </div>
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Marketplace Card */}
          <Link to="/marketplace" className="group block">
            <div className="bg-card border border-border rounded-2xl p-8 hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1">
              <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                <ShoppingBag className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-3">Marketplace</h3>
              <p className="text-muted-foreground mb-6">
                Buy and sell textbooks, electronics, stationery, and more from fellow students at great prices.
              </p>
              <div className="flex items-center gap-2 text-primary font-semibold">
                Browse listings
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </Link>

          {/* Service Hub Card */}
          <Link to="/services" className="group block">
            <div className="bg-card border border-border rounded-2xl p-8 hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1">
              <div className="w-14 h-14 bg-secondary/20 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-secondary/30 transition-colors">
                <Wrench className="w-7 h-7 text-secondary-foreground" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-3">Service Hub</h3>
              <p className="text-muted-foreground mb-6">
                Find tutors, designers, coders, and other skilled students ready to help you succeed.
              </p>
              <div className="flex items-center gap-2 text-foreground font-semibold">
                Find helpers
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </Link>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-muted/30 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-3">How It Works</h2>
            <p className="text-muted-foreground">Simple, safe, and student-friendly</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <Users className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-foreground">1. Sign Up</h3>
              <p className="text-muted-foreground">
                Create your account with Internet Identity for secure, anonymous authentication.
              </p>
            </div>
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <ShoppingBag className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-foreground">2. List or Browse</h3>
              <p className="text-muted-foreground">
                Post your items or services, or browse what other students are offering.
              </p>
            </div>
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <Shield className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-foreground">3. Connect Safely</h3>
              <p className="text-muted-foreground">
                Arrange meetups on campus and confirm exchanges through our secure tracker.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Earn CTA */}
      <section className="container mx-auto px-4 py-16">
        <div className="bg-gradient-to-r from-primary to-primary/80 rounded-3xl p-10 text-center text-primary-foreground">
          <h2 className="text-3xl font-bold mb-4">Got skills? Earn extra cash!</h2>
          <p className="text-primary-foreground/80 mb-8 max-w-xl mx-auto">
            Offer tutoring, design, coding, or any other service to your fellow students and start earning today.
          </p>
          <Link
            to="/services/create"
            className="inline-flex items-center gap-2 bg-primary-foreground text-primary px-8 py-3 rounded-xl font-bold hover:opacity-90 transition-opacity shadow-lg"
          >
            Offer a Service
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </main>
  );
}
