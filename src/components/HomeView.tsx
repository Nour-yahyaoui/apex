import { 
  Truck, Shield, RefreshCw, HeadphonesIcon, 
  Clock, TrendingUp, Tag, ChevronRight 
} from "lucide-react";
import type { Product } from "../lib/db";
import { ProductCard } from "./ProductCard";

interface HomeViewProps {
  products: Product[];
  categories: string[];
  onProductAdd: (product: Product) => void;
  onProductView: (product: Product) => void;
  onNavigateToProducts: () => void;
  onCategorySelect: (category: string) => void;
}

export function HomeView({ 
  products, 
  categories, 
  onProductAdd, 
  onProductView,
  onNavigateToProducts,
  onCategorySelect 
}: HomeViewProps) {
  const featuredProducts = products.slice(0, 4);
  const popularProducts = products.slice(4, 8);

  const HeroSection = () => (
    <section className="flex items-center justify-between gap-10 flex-wrap py-16 px-6 md:px-12 lg:px-20 bg-white">
      <div className="flex-1 min-w-[280px]">
        <img
          src="/image.png"
          alt="Shopping illustration"
          className="w-full max-w-[500px] mx-auto"
        />
      </div>
      <div className="flex-1 min-w-[280px]">
        <h2 className="text-2xl md:text-3xl font-bold text-[#1a5fb4] mb-5">
          Faites vos achats en toute simplicité sur Shop.tn
        </h2>
        <p className="text-base text-gray-600 leading-relaxed mb-8">
          <strong>Shop.tn</strong> est la plateforme de shopping en ligne leader
          en Tunisie. Découvrez des milliers de produits aux meilleurs prix, des
          promotions exclusives et une livraison rapide dans tout le pays. Votre
          satisfaction est notre priorité.
        </p>
        <button
          onClick={onNavigateToProducts}
          className="bg-[#5ed46a] text-white border-none py-3.5 px-7 rounded-full text-base font-semibold cursor-pointer hover:bg-[#4cb856] transition-colors shadow-md"
        >
          Découvrir nos produits
        </button>
      </div>
    </section>
  );

  return (
    <div className="space-y-12 pb-8">
      <HeroSection />

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl hover:shadow-md transition-all">
            <Truck className="w-5 h-5 text-[#0e71b4] flex-shrink-0" />
            <div>
              <h3 className="font-medium text-sm text-gray-900">Livraison gratuite</h3>
              <p className="text-xs text-gray-500">Dès 50 TND d'achat</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl hover:shadow-md transition-all">
            <Shield className="w-5 h-5 text-[#0e71b4] flex-shrink-0" />
            <div>
              <h3 className="font-medium text-sm text-gray-900">Paiement sécurisé</h3>
              <p className="text-xs text-gray-500">100% sécurisé</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl hover:shadow-md transition-all">
            <RefreshCw className="w-5 h-5 text-[#0e71b4] flex-shrink-0" />
            <div>
              <h3 className="font-medium text-sm text-gray-900">Retours gratuits</h3>
              <p className="text-xs text-gray-500">Sous 30 jours</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl hover:shadow-md transition-all">
            <HeadphonesIcon className="w-5 h-5 text-[#0e71b4] flex-shrink-0" />
            <div>
              <h3 className="font-medium text-sm text-gray-900">Service client</h3>
              <p className="text-xs text-gray-500">24/7 à votre écoute</p>
            </div>
          </div>
        </div>
      </div>

      {/* Categories Section */}
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Nos catégories</h2>
          <button
            onClick={onNavigateToProducts}
            className="text-sm text-gray-500 hover:text-[#0e71b4] flex items-center gap-1"
          >
            Voir tout <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {categories.slice(0, 4).map((category) => {
            const count = products.filter((p) => p.category === category).length;
            return (
              <button
                key={category}
                onClick={() => {
                  onCategorySelect(category);
                  onNavigateToProducts();
                }}
                className="group bg-white border border-gray-200 rounded-xl p-5 text-left hover:shadow-lg transition-all hover:-translate-y-1"
              >
                <div className="text-3xl mb-3 opacity-30 group-hover:opacity-50">📦</div>
                <h3 className="font-medium text-gray-900 mb-1">{category}</h3>
                <p className="text-xs text-gray-500">{count} articles</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Featured Products */}
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center gap-2 mb-6">
          <Clock className="w-5 h-5 text-[#0e71b4]" />
          <h2 className="text-2xl font-bold text-gray-900">Nouveautés</h2>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {featuredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onAddToCart={onProductAdd}
              onViewDetails={onProductView}
            />
          ))}
        </div>
      </div>

      {/* Popular Products */}
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center gap-2 mb-6">
          <TrendingUp className="w-5 h-5 text-[#0e71b4]" />
          <h2 className="text-2xl font-bold text-gray-900">Meilleures ventes</h2>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {popularProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onAddToCart={onProductAdd}
              onViewDetails={onProductView}
            />
          ))}
        </div>
      </div>

      {/* Promo Banner */}
      <div className="max-w-7xl mx-auto px-6">
        <div className="bg-gradient-to-r from-[#ff5851] to-[#ff8a7f] rounded-2xl overflow-hidden">
          <div className="px-6 py-8 text-center text-white">
            <Tag className="w-8 h-8 mx-auto mb-3" />
            <h3 className="text-xl font-semibold mb-2">Promo du mois</h3>
            <p className="text-white/90 text-sm mb-4">
              -20% sur une sélection de produits avec le code SHOP20
            </p>
            <button className="px-6 py-2 bg-white text-[#ff5851] rounded-full text-sm font-medium hover:bg-gray-100 transition-colors">
              J'en profite
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}