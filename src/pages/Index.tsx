import { useEffect, useState } from "react";
import {
  ChefHat, Flame, Phone, MapPin, Clock, Star, Sparkles, Truck,
  UtensilsCrossed, Coffee, Soup, Wheat, ArrowRight, Plus, MessageCircle,
  Home as HomeIcon, Menu as MenuIcon, Heart, Moon, Sun, Instagram, Facebook, Twitter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import heroDosa from "@/assets/hero-dosa.jpg";
import catDosa from "@/assets/cat-dosa.jpg";
import catRice from "@/assets/cat-rice.jpg";
import catIdli from "@/assets/cat-idli.jpg";
import catBeverage from "@/assets/cat-beverage.jpg";
import logoTruck from "@/assets/logo-truck.png";

type Item = { name: string; desc: string; price: number; tag?: "best" | "new" | "spicy" };
type Category = { id: string; title: string; icon: typeof ChefHat; image: string; items: Item[] };

const MENU: Category[] = [
  {
    id: "dosa", title: "Dosa Specials", icon: UtensilsCrossed, image: catDosa,
    items: [
      { name: "Plain Dosa", desc: "Crispy golden classic with chutney trio", price: 50 },
      { name: "Masala Dosa", desc: "Spiced potato filling, sambar & chutney", price: 80, tag: "best" },
      { name: "Onion Dosa", desc: "Fresh onions roasted into the crust", price: 70 },
      { name: "Butter Dosa", desc: "Generous butter, melt-in-mouth crispy", price: 90 },
      { name: "Ghee Roast", desc: "Pure ghee, paper-thin, ultra crispy", price: 100 },
      { name: "Set Dosa", desc: "Three soft fluffy dosas, sambar combo", price: 70 },
      { name: "Mysore Masala", desc: "Spicy red chutney + masala filling", price: 110, tag: "spicy" },
    ],
  },
  {
    id: "rice", title: "Rice Bowls", icon: Soup, image: catRice,
    items: [
      { name: "Veg Fried Rice", desc: "Wok-tossed with crunchy garden veggies", price: 90 },
      { name: "Egg Fried Rice", desc: "Fluffy egg ribbons & smoky flavor", price: 110 },
      { name: "Chicken Fried Rice", desc: "Tender chicken, soy & spice", price: 140, tag: "best" },
      { name: "Gobi Rice", desc: "Crispy cauliflower, masala rice", price: 100 },
      { name: "Jeera Rice", desc: "Cumin-tempered fragrant basmati", price: 80 },
      { name: "Lemon Rice", desc: "Tangy, zesty South-Indian classic", price: 70 },
    ],
  },
  {
    id: "tiffin", title: "Idli, Vada & Tiffin", icon: Wheat, image: catIdli,
    items: [
      { name: "Idli", desc: "Steamed pillow-soft rice cakes", price: 40 },
      { name: "Vada", desc: "Crisp lentil donuts, hot sambar", price: 40 },
      { name: "Idli Vada Combo", desc: "Two idlis + one vada + chutneys", price: 70, tag: "best" },
      { name: "Khara Bath", desc: "Spicy semolina with veggies", price: 60 },
      { name: "Kesari Bath", desc: "Sweet saffron semolina dessert", price: 60 },
      { name: "Pongal", desc: "Rice & lentil comfort with ghee", price: 70 },
    ],
  },
  {
    id: "drinks", title: "Beverages", icon: Coffee, image: catBeverage,
    items: [
      { name: "Tea", desc: "Strong filter masala chai", price: 20 },
      { name: "Coffee", desc: "Aromatic South-Indian filter coffee", price: 25, tag: "best" },
      { name: "Badam Milk", desc: "Almond, saffron & cardamom milk", price: 40 },
      { name: "Soft Drinks", desc: "Chilled cans, your favourite brand", price: 30 },
    ],
  },
];

const FLOATING_EMOJIS = ["🍛", "🥘", "🌶️", "☕", "🥞", "🍚"];

const Index = () => {
  const [dark, setDark] = useState(false);
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 900);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  // Animated counter
  useEffect(() => {
    if (loading) return;
    let n = 0;
    const target = 12480;
    const id = setInterval(() => {
      n += Math.ceil(target / 60);
      if (n >= target) { n = target; clearInterval(id); }
      setOrders(n);
    }, 25);
    return () => clearInterval(id);
  }, [loading]);

  const addToCart = (item: Item) => {
    toast.success(`${item.name} added`, { description: `₹${item.price} · Tap WhatsApp to confirm your order` });
  };

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  if (loading) {
    return (
      <div className="fixed inset-0 grid place-items-center bg-background z-50">
        <div className="flex flex-col items-center gap-4">
          <img src={logoTruck} alt="Akshay Fast Food food truck logo" className="w-28 h-28 animate-glow-pulse" />
          <div className="gradient-text text-2xl font-bold tracking-wide">AKSHAY FAST FOOD</div>
          <div className="h-1 w-40 bg-muted rounded-full overflow-hidden">
            <div className="h-full w-1/2 warm-bg animate-marquee" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24 md:pb-0">
      {/* Top nav */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-background/70 border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <button onClick={() => scrollTo("hero")} className="flex items-center gap-2 group">
            <img src={logoTruck} alt="" className="w-9 h-9 group-hover:rotate-6 transition-transform" />
            <span className="font-bold tracking-tight text-sm sm:text-base">
              <span className="gradient-text">AKSHAY</span> FAST FOOD
            </span>
          </button>
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            <button onClick={() => scrollTo("menu")} className="hover:text-primary transition-colors">Menu</button>
            <button onClick={() => scrollTo("special")} className="hover:text-primary transition-colors">Specials</button>
            <button onClick={() => scrollTo("reviews")} className="hover:text-primary transition-colors">Reviews</button>
            <button onClick={() => scrollTo("contact")} className="hover:text-primary transition-colors">Contact</button>
          </nav>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => setDark(d => !d)} aria-label="Toggle theme">
              {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            <Button onClick={() => scrollTo("menu")} className="warm-bg text-primary-foreground hover:opacity-95 shadow-[var(--shadow-glow)] hidden sm:inline-flex">
              Order Now
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section id="hero" className="relative overflow-hidden">
        {/* Floating emojis */}
        {FLOATING_EMOJIS.map((e, i) => (
          <span
            key={i}
            className="absolute text-3xl md:text-4xl opacity-50 pointer-events-none animate-float select-none"
            style={{
              top: `${10 + (i * 13) % 70}%`,
              left: `${(i * 17 + 5) % 90}%`,
              animationDelay: `${i * 0.7}s`,
            }}
          >{e}</span>
        ))}

        <div className="max-w-7xl mx-auto px-4 pt-10 md:pt-16 pb-12 md:pb-20 grid md:grid-cols-2 gap-10 items-center relative">
          <div className="text-center md:text-left animate-fade-in">
            <Badge className="warm-bg text-primary-foreground border-0 mb-5 shadow-[var(--shadow-soft)]">
              <Flame className="h-3 w-3 mr-1" /> Now serving fresh, daily
            </Badge>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-tight">
              <span className="block">Welcome to</span>
              <span className="gradient-text animate-shine bg-[linear-gradient(110deg,hsl(var(--primary)),45%,hsl(var(--primary-glow)),55%,hsl(var(--primary)))] bg-clip-text">
                AKSHAY FAST FOOD
              </span>
            </h1>
            <p className="mt-4 text-lg md:text-xl text-muted-foreground">
              Fresh <span className="text-primary">•</span> Hot <span className="text-primary">•</span> Tasty Street Food
            </p>
            <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto md:mx-0">
              South-Indian classics & fast bites cooked with love, served opposite Christ University.
            </p>
            <div className="mt-7 flex flex-wrap gap-3 justify-center md:justify-start">
              <Button size="lg" onClick={() => scrollTo("menu")} className="warm-bg text-primary-foreground hover:opacity-95 shadow-[var(--shadow-glow)] hover-lift">
                <UtensilsCrossed className="h-4 w-4 mr-2" /> View Menu
              </Button>
              <Button size="lg" variant="outline" onClick={() => scrollTo("contact")} className="backdrop-blur bg-background/60 hover-lift">
                <Phone className="h-4 w-4 mr-2" /> Order Now
              </Button>
            </div>

            <div className="mt-8 flex gap-6 justify-center md:justify-start text-sm">
              <div><div className="text-2xl font-bold gradient-text">{orders.toLocaleString()}+</div><div className="text-muted-foreground">Orders served</div></div>
              <div><div className="text-2xl font-bold gradient-text">4.8★</div><div className="text-muted-foreground">Customer rating</div></div>
              <div><div className="text-2xl font-bold gradient-text">25+</div><div className="text-muted-foreground">Menu items</div></div>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-8 warm-bg blur-3xl opacity-30 rounded-full" />
            <div className="relative glass-card p-3 hover-lift">
              <img
                src={heroDosa}
                alt="Crispy masala dosa with chutneys and sambar on banana leaf"
                width={1536} height={1024}
                className="rounded-[calc(var(--radius)-0.5rem)] w-full h-auto object-cover"
              />
              <div className="absolute -bottom-5 -left-5 glass-card px-4 py-3 flex items-center gap-3 shadow-[var(--shadow-glow)]">
                <img src={logoTruck} alt="" className="w-10 h-10" />
                <div>
                  <div className="text-xs text-muted-foreground">Today's Special</div>
                  <div className="text-sm font-bold">Mysore Masala Dosa</div>
                </div>
              </div>
              <Badge className="absolute -top-3 right-4 bg-accent text-accent-foreground shadow-md">
                <Star className="h-3 w-3 mr-1 fill-current" /> Bestseller
              </Badge>
            </div>
          </div>
        </div>

        {/* Daily special marquee */}
        <div id="special" className="warm-bg text-primary-foreground py-3 overflow-hidden border-y border-primary/20">
          <div className="flex gap-12 whitespace-nowrap animate-marquee font-semibold text-sm sm:text-base">
            {[...Array(2)].map((_, k) => (
              <div key={k} className="flex gap-12 shrink-0">
                <span>🔥 Today's Special: Mysore Masala Dosa @ ₹110</span>
                <span>⭐ Chef Recommends: Ghee Roast</span>
                <span>👑 Most Ordered: Chicken Fried Rice</span>
                <span>☕ Free chai with orders above ₹200</span>
                <span>🥞 Combo: Idli + Vada + Coffee @ ₹90</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured cards */}
      <section className="max-w-7xl mx-auto px-4 py-12 md:py-16">
        <div className="grid sm:grid-cols-3 gap-4">
          {[
            { icon: Flame, title: "Today's Special", text: "Mysore Masala Dosa with spicy red chutney", tint: "from-primary/20 to-accent/20" },
            { icon: ChefHat, title: "Chef Recommends", text: "Ghee Roast — paper thin, golden crispy", tint: "from-warning/20 to-primary/20" },
            { icon: Star, title: "Most Ordered", text: "Chicken Fried Rice — wok-fired flavor", tint: "from-accent/20 to-primary/20" },
          ].map((c, i) => (
            <div key={i} className={`glass-card p-5 hover-lift bg-gradient-to-br ${c.tint}`}>
              <div className="w-10 h-10 rounded-xl warm-bg grid place-items-center mb-3 shadow-[var(--shadow-soft)]">
                <c.icon className="h-5 w-5 text-primary-foreground" />
              </div>
              <h3 className="font-bold text-lg">{c.title}</h3>
              <p className="text-sm text-muted-foreground mt-1">{c.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Menu */}
      <section id="menu" className="max-w-7xl mx-auto px-4 py-8 md:py-12 space-y-16">
        <div className="text-center max-w-2xl mx-auto">
          <Badge variant="outline" className="mb-3">Our Menu</Badge>
          <h2 className="text-3xl md:text-5xl font-extrabold">Crafted with <span className="gradient-text">love</span>, served hot</h2>
          <p className="text-muted-foreground mt-3">Tap any item to add it to your order. We'll confirm on WhatsApp.</p>
        </div>

        {MENU.map((cat) => (
          <div key={cat.id} className="space-y-6">
            <div className="flex items-end justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-4">
                <div className="relative shrink-0">
                  <img src={cat.image} alt={cat.title} width={768} height={768} loading="lazy"
                    className="w-20 h-20 md:w-24 md:h-24 object-cover rounded-2xl shadow-[var(--shadow-card)]" />
                  <div className="absolute -bottom-2 -right-2 w-9 h-9 rounded-xl warm-bg grid place-items-center shadow-md">
                    <cat.icon className="h-4 w-4 text-primary-foreground" />
                  </div>
                </div>
                <div>
                  <h3 className="text-2xl md:text-3xl font-bold">{cat.title}</h3>
                  <p className="text-sm text-muted-foreground">{cat.items.length} delicious choices</p>
                </div>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {cat.items.map((item) => (
                <article key={item.name} className="glass-card p-4 hover-lift flex gap-4 group">
                  <img src={cat.image} alt={item.name} width={768} height={768} loading="lazy"
                    className="w-20 h-20 rounded-xl object-cover shrink-0 group-hover:scale-105 transition-transform" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-bold leading-tight">{item.name}</h4>
                      {item.tag === "best" && <Badge className="bg-accent text-accent-foreground text-[10px] shrink-0">Best</Badge>}
                      {item.tag === "spicy" && <Badge className="bg-destructive text-destructive-foreground text-[10px] shrink-0">🌶 Spicy</Badge>}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{item.desc}</p>
                    <div className="flex items-center justify-between mt-3">
                      <span className="font-bold text-primary">₹{item.price}</span>
                      <Button size="sm" onClick={() => addToCart(item)}
                        className="warm-bg text-primary-foreground hover:opacity-95 h-8 px-3 rounded-full shadow-[var(--shadow-soft)]">
                        <Plus className="h-3 w-3 mr-1" /> Add
                      </Button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        ))}
      </section>

      {/* Street food experience */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="glass-card p-8 md:p-12 bg-gradient-to-br from-primary/10 via-accent/10 to-warning/10">
          <div className="grid md:grid-cols-3 gap-6 text-center">
            {[
              { n: "12K+", l: "Happy Customers" },
              { n: "25+", l: "Signature Dishes" },
              { n: "5★", l: "Hygiene Rating" },
            ].map((s) => (
              <div key={s.l}>
                <div className="text-4xl md:text-5xl font-extrabold gradient-text">{s.n}</div>
                <div className="text-sm text-muted-foreground mt-1">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Reviews */}
      <section id="reviews" className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <Badge variant="outline" className="mb-3">Loved by students</Badge>
          <h2 className="text-3xl md:text-4xl font-extrabold">What our customers say</h2>
        </div>
        <div className="overflow-hidden">
          <div className="flex gap-4 animate-marquee" style={{ width: "max-content" }}>
            {[...Array(2)].flatMap((_, k) =>
              [
                { n: "Priya R.", t: "Christ University", q: "The masala dosa is heaven! Best chai in the area, hands down." },
                { n: "Arjun K.", t: "Engineering Student", q: "Chicken fried rice + filter coffee = my exam survival kit 🔥" },
                { n: "Meera S.", t: "Daily customer", q: "Hygienic, fast, and Akshay anna is always smiling. 5 stars!" },
                { n: "Rohit M.", t: "First-year", q: "Affordable for students and tastes like home. Love the vada combo." },
              ].map((r, i) => (
                <div key={`${k}-${i}`} className="glass-card p-5 w-72 shrink-0">
                  <div className="flex text-warning mb-2">{Array.from({ length: 5 }).map((_, i) => <Star key={i} className="h-4 w-4 fill-current" />)}</div>
                  <p className="text-sm">"{r.q}"</p>
                  <div className="mt-3 text-sm font-semibold">{r.n}</div>
                  <div className="text-xs text-muted-foreground">{r.t}</div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="max-w-7xl mx-auto px-4 py-12 md:py-16">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="glass-card p-6 md:p-8 space-y-5">
            <div>
              <Badge variant="outline" className="mb-3">Visit us</Badge>
              <h2 className="text-3xl md:text-4xl font-extrabold">Come say <span className="gradient-text">hi</span></h2>
              <p className="text-muted-foreground mt-2">We're cooking fresh, all day. Drop by or order ahead.</p>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl warm-bg grid place-items-center shrink-0">
                  <ChefHat className="h-4 w-4 text-primary-foreground" />
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Owner</div>
                  <div className="font-semibold">Akshay</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl warm-bg grid place-items-center shrink-0">
                  <Phone className="h-4 w-4 text-primary-foreground" />
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Phone</div>
                  <a href="tel:+91XXXXXXXXXX" className="font-semibold hover:text-primary">+91 XXXXX XXXXX</a>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl warm-bg grid place-items-center shrink-0">
                  <MapPin className="h-4 w-4 text-primary-foreground" />
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Address</div>
                  <div className="font-semibold">Opposite to Christ University,<br/>Andhralli Main Road, Bangalore</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl warm-bg grid place-items-center shrink-0">
                  <Clock className="h-4 w-4 text-primary-foreground" />
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Open hours</div>
                  <div className="font-semibold">7:00 AM – 10:30 PM · Daily</div>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 pt-2">
              <Button asChild className="warm-bg text-primary-foreground hover:opacity-95 hover-lift">
                <a href="tel:+91XXXXXXXXXX"><Phone className="h-4 w-4 mr-2" /> Call now</a>
              </Button>
              <Button asChild variant="outline" className="hover-lift">
                <a href="https://wa.me/91XXXXXXXXXX" target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="h-4 w-4 mr-2" /> WhatsApp
                </a>
              </Button>
            </div>
          </div>

          <div className="glass-card p-3 overflow-hidden">
            <iframe
              title="Akshay Fast Food location"
              src="https://www.google.com/maps?q=Christ+University+Bangalore&output=embed"
              className="w-full h-full min-h-[360px] rounded-[calc(var(--radius)-0.5rem)] border-0"
              loading="lazy"
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative mt-8 warm-bg text-primary-foreground overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          {FLOATING_EMOJIS.map((e, i) => (
            <span key={i} className="absolute text-5xl animate-float"
              style={{ top: `${(i * 23) % 80}%`, left: `${(i * 19 + 10) % 90}%`, animationDelay: `${i * 0.5}s` }}>{e}</span>
          ))}
        </div>
        <div className="relative max-w-7xl mx-auto px-4 py-12 grid md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <img src={logoTruck} alt="" className="w-10 h-10" />
              <span className="font-extrabold text-lg">AKSHAY FAST FOOD</span>
            </div>
            <p className="text-sm text-primary-foreground/90">Thank you for visiting us. Fresh, hot, and tasty — every single bite.</p>
          </div>
          <div>
            <h4 className="font-bold mb-3">Quick links</h4>
            <ul className="space-y-2 text-sm">
              <li><button onClick={() => scrollTo("menu")} className="hover:underline">Menu</button></li>
              <li><button onClick={() => scrollTo("special")} className="hover:underline">Today's Special</button></li>
              <li><button onClick={() => scrollTo("reviews")} className="hover:underline">Reviews</button></li>
              <li><button onClick={() => scrollTo("contact")} className="hover:underline">Contact</button></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-3">Follow us</h4>
            <div className="flex gap-3">
              {[Instagram, Facebook, Twitter].map((Icon, i) => (
                <a key={i} href="#" className="w-10 h-10 rounded-full bg-white/15 hover:bg-white/25 grid place-items-center transition-colors" aria-label="social link">
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
            <p className="text-xs mt-6 text-primary-foreground/80">© {new Date().getFullYear()} Akshay Fast Food. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Floating WhatsApp button */}
      <a href="https://wa.me/91XXXXXXXXXX" target="_blank" rel="noopener noreferrer"
         className="fixed bottom-24 md:bottom-6 right-5 z-40 w-14 h-14 rounded-full bg-[#25D366] text-white grid place-items-center shadow-[var(--shadow-glow)] hover:scale-110 transition-transform animate-glow-pulse"
         aria-label="Order on WhatsApp">
        <MessageCircle className="h-6 w-6" />
      </a>

      {/* Sticky mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 backdrop-blur-xl bg-background/85 border-t border-border">
        <div className="grid grid-cols-4 text-xs">
          {[
            { i: HomeIcon, l: "Home", id: "hero" },
            { i: MenuIcon, l: "Menu", id: "menu" },
            { i: Heart, l: "Special", id: "special" },
            { i: Phone, l: "Contact", id: "contact" },
          ].map(({ i: Icon, l, id }) => (
            <button key={l} onClick={() => scrollTo(id)} className="flex flex-col items-center gap-1 py-3 hover:text-primary transition-colors">
              <Icon className="h-5 w-5" />
              <span className="font-medium">{l}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
};

export default Index;
