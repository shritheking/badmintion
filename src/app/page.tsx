import Link from "next/link";
import { CalendarDays, MapPin, Trophy, Users, Phone, ArrowRight, CheckCircle2 } from "lucide-react";
import Image from "next/image";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Navigation */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4 md:px-6 mx-auto max-w-7xl">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl tracking-tight">
            <Trophy className="h-6 w-6 text-primary" />
            <span>SMASH<span className="text-primary">PRO</span></span>
          </Link>
          <nav className="hidden md:flex gap-6">
            <Link href="#about" className="text-sm font-medium hover:text-primary transition-colors">Tournament</Link>
            <Link href="#categories" className="text-sm font-medium hover:text-primary transition-colors">Categories</Link>
            <Link href="#venue" className="text-sm font-medium hover:text-primary transition-colors">Venue</Link>
          </nav>
          <Link href="/register" className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90">
            REGISTER NOW
          </Link>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-slate-950 text-white py-20 md:py-32">
          <div className="absolute inset-0 z-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center" />
          <div className="container relative z-10 mx-auto px-4 md:px-6 max-w-7xl flex flex-col items-center text-center space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tighter uppercase">
                Badminton <span className="text-primary">Tournament</span>
              </h1>
              <p className="text-xl md:text-2xl font-medium text-gray-300">
                Compete. Play. Conquer.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 items-center text-sm md:text-base text-gray-200">
              <div className="flex items-center gap-2">
                <CalendarDays className="h-5 w-5 text-primary" />
                <span>Sunday, September 20th</span>
              </div>
              <span className="hidden sm:inline text-gray-500">•</span>
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                <span>Road, Vattalagundu, Bangalapatti</span>
              </div>
            </div>

            <div className="flex flex-col w-full sm:w-auto sm:flex-row gap-4 pt-4">
              <Link href="/register" className="inline-flex h-12 w-full sm:w-auto items-center justify-center rounded-md bg-primary px-8 text-base font-medium text-primary-foreground shadow hover:bg-primary/90 transition-all group">
                REGISTER NOW
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link href="#venue" className="inline-flex h-12 w-full sm:w-auto items-center justify-center rounded-md border border-gray-600 bg-transparent px-8 text-base font-medium text-white shadow-sm hover:bg-white/10 hover:text-white transition-all">
                VIEW VENUE
              </Link>
            </div>
          </div>
        </section>

        {/* Tournament Highlights */}
        <section id="about" className="py-16 md:py-24 bg-slate-50">
          <div className="container mx-auto px-4 md:px-6 max-w-7xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Tournament Details</h2>
              <p className="mt-4 text-muted-foreground">Everything you need to know about the upcoming championship.</p>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {[
                { icon: CalendarDays, title: "Date", desc: "Sunday, September 20th" },
                { icon: MapPin, title: "Venue", desc: "Bangalapatti, Tamil Nadu" },
                { icon: Trophy, title: "Prize", desc: "Exciting Cash Prizes & Trophies" },
                { icon: Phone, title: "Contact", desc: "+91 XXXXX XXXXX" },
              ].map((item, i) => (
                <div key={i} className="flex flex-col items-center text-center p-6 bg-white rounded-xl shadow-sm border">
                  <div className="p-3 bg-primary/10 rounded-full mb-4">
                    <item.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg">{item.title}</h3>
                  <p className="text-muted-foreground mt-2">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Categories Section */}
        <section id="categories" className="py-16 md:py-24">
          <div className="container mx-auto px-4 md:px-6 max-w-7xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Categories</h2>
              <p className="mt-4 text-muted-foreground">Choose your category and show your skills on the court.</p>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[
                { name: "Men's Singles", fee: "₹500", type: "Singles" },
                { name: "Men's Doubles", fee: "₹800", type: "Doubles" },
              ].map((cat, i) => (
                <div key={i} className="group relative overflow-hidden rounded-xl border bg-white p-6 shadow-sm transition-all hover:shadow-md">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold">{cat.name}</h3>
                    <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                      {cat.type}
                    </span>
                  </div>
                  <div className="space-y-3 mt-6">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <span>Knockout Format</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <span>Yonex Mavis 350 Shuttles</span>
                    </div>
                  </div>
                  <div className="mt-6 flex items-center justify-between border-t pt-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Entry Fee</p>
                      <p className="text-lg font-bold text-primary">{cat.fee}</p>
                    </div>
                    <Link href="/register" className="text-sm font-medium text-primary group-hover:underline">
                      Register →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Venue Section */}
        <section id="venue" className="py-16 md:py-24 bg-slate-50">
          <div className="container mx-auto px-4 md:px-6 max-w-7xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl uppercase">Our Badminton Court</h2>
              <p className="mt-4 text-muted-foreground">Premium wooden courts with professional lighting.</p>
            </div>
            
            {/* Gallery */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
              <div className="h-64 md:h-96 bg-slate-200 rounded-xl overflow-hidden relative group shadow-sm">
                <Image src="/venue/bad1.jpeg" alt="Badminton Court 1" fill className="object-cover transition-transform group-hover:scale-105" /> 
              </div>
              <div className="h-64 md:h-96 bg-slate-200 rounded-xl overflow-hidden relative group shadow-sm">
                <Image src="/venue/bad2.jpeg" alt="Badminton Court 2" fill className="object-cover transition-transform group-hover:scale-105" /> 
              </div>
            </div>

            {/* Map & Address */}
            <div className="grid md:grid-cols-2 gap-8 items-center bg-white p-6 md:p-8 rounded-2xl border shadow-sm">
              <div className="space-y-6">
                <div>
                  <h3 className="text-2xl font-bold mb-2">Location</h3>
                  <p className="text-muted-foreground flex items-start gap-2">
                    <MapPin className="h-5 w-5 mt-0.5 text-primary flex-shrink-0" />
                    <span>Road, Vattalagundu, Bangalapatti,<br/>Tamil Nadu 624202</span>
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <a href="https://www.google.com/maps?um=1&ie=UTF-8&fb=1&gl=in&sa=X&geocode=KZPjwl8ATwc7MeJZo39BJxTS&daddr=road,+Vattalagundu,+Bangalapatti,+Tamil+Nadu+624202" target="_blank" rel="noopener noreferrer" className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90">
                    VIEW ON GOOGLE MAPS
                  </a>
                </div>
              </div>
              <div className="h-64 rounded-xl overflow-hidden border shadow-inner relative">
                <iframe 
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15705.808006272535!2d77.73456345!3d10.15858635!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3b073df016d96ff9%3A0xb35c3bcce84a0d8f!2sBangalapatti%2C%20Tamil%20Nadu%20624202!5e0!3m2!1sen!2sin!4v1715426189679!5m2!1sen!2sin" 
                  width="100%" 
                  height="100%" 
                  style={{ border: 0 }} 
                  allowFullScreen={true} 
                  loading="lazy" 
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Venue Map"
                  className="absolute inset-0"
                />
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-primary text-primary-foreground text-center">
          <div className="container mx-auto px-4 max-w-3xl space-y-6">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight">Ready to Smash?</h2>
            <p className="text-lg text-primary-foreground/80">Secure your spot in the tournament before slots fill up.</p>
            <Link href="/register" className="inline-flex h-12 items-center justify-center rounded-md bg-white px-8 text-base font-bold text-primary shadow hover:bg-gray-100 transition-colors mt-4">
              REGISTER NOW
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-slate-950 text-slate-300 py-12">
        <div className="container mx-auto px-4 md:px-6 max-w-7xl grid gap-8 md:grid-cols-3">
          <div>
            <Link href="/" className="flex items-center gap-2 font-bold text-xl tracking-tight text-white mb-4">
              <Trophy className="h-6 w-6 text-primary" />
              <span>SMASH<span className="text-primary">PRO</span></span>
            </Link>
            <p className="text-sm text-slate-400 max-w-xs">
              Badminton Tournament. Compete. Play. Conquer. Join the most exciting badminton event of the year.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/" className="hover:text-primary transition-colors">Home</Link></li>
              <li><Link href="#about" className="hover:text-primary transition-colors">Tournament</Link></li>
              <li><Link href="#categories" className="hover:text-primary transition-colors">Categories</Link></li>
              <li><Link href="#venue" className="hover:text-primary transition-colors">Venue</Link></li>
              <li><Link href="/register" className="hover:text-primary transition-colors">Register</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-4">Venue</h4>
            <address className="not-italic text-sm space-y-2 text-slate-400">
              <p>Road, Vattalagundu,</p>
              <p>Bangalapatti, Tamil Nadu 624202</p>
              <a href="https://www.google.com/maps?um=1&ie=UTF-8&fb=1&gl=in&sa=X&geocode=KZPjwl8ATwc7MeJZo39BJxTS&daddr=road,+Vattalagundu,+Bangalapatti,+Tamil+Nadu+624202" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-primary hover:underline mt-2">
                <MapPin className="h-4 w-4" /> Google Maps
              </a>
            </address>
          </div>
        </div>
        <div className="container mx-auto px-4 md:px-6 max-w-7xl mt-12 pt-8 border-t border-slate-800 text-sm text-center md:text-left text-slate-500 flex flex-col md:flex-row justify-between items-center gap-4">
          <p>© 2026 Badminton Tournament. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
