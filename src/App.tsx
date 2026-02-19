import React, { useState, useEffect } from "react";
import { getProducts, createOrder, type Product } from "./lib/db";
import {
  ShoppingCart,
  X,
  Plus,
  Minus,
  Package,
  ArrowLeft,
  Trash2,
  Search,
  Filter,
  ChevronDown,
  Eye,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Clock,
  Truck,
  Shield,
  RefreshCw,
  HeadphonesIcon,
  Tag,
  Menu,
} from "lucide-react";

interface CartItem {
  product: Product;
  quantity: number;
}

function Store() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [activeTab, setActiveTab] = useState<"home" | "products">("home");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [categories, setCategories] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  // Order form state
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerLocation, setCustomerLocation] = useState("");

  // Stock validation error
  const [stockError, setStockError] = useState<string | null>(null);

  useEffect(() => {
    getProducts().then((data) => {
      setProducts(data);
      setFilteredProducts(data);

      // Extract unique categories
      const uniqueCategories = Array.from(
        new Set(data.map((p) => p.category).filter(Boolean))
      ) as string[];
      setCategories(uniqueCategories);

      setLoading(false);
    });
  }, []);

  // Filter products when search or category changes
  useEffect(() => {
    let result = products;

    // Apply category filter
    if (selectedCategory !== "all") {
      result = result.filter((p) => p.category === selectedCategory);
    }

    // Apply search filter
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          (p.description && p.description.toLowerCase().includes(query)) ||
          (p.category && p.category.toLowerCase().includes(query))
      );
    }

    setFilteredProducts(result);
  }, [searchQuery, selectedCategory, products]);

  // Clear stock error when cart changes
  useEffect(() => {
    setStockError(null);
  }, [cart]);

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const addToCart = (product: Product) => {
    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.product.id === product.id);
      const currentQuantity = existing ? existing.quantity : 0;

      // Check if adding one more would exceed stock
      if (currentQuantity + 1 > product.stock) {
        setStockError(
          `Désolé, seulement ${product.stock} article(s) disponible(s) pour "${product.name}"`
        );
        return prevCart;
      }

      setStockError(null);

      if (existing) {
        return prevCart.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prevCart, { product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: number) => {
    setCart((prevCart) =>
      prevCart.filter((item) => item.product.id !== productId)
    );
    setStockError(null);
  };

  const updateQuantity = (productId: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setCart((prevCart) => {
      const item = prevCart.find((item) => item.product.id === productId);
      if (item && newQuantity > item.product.stock) {
        setStockError(
          `Désolé, seulement ${item.product.stock} article(s) disponible(s) pour "${item.product.name}"`
        );
        return prevCart;
      }

      setStockError(null);

      return prevCart.map((item) =>
        item.product.id === productId
          ? { ...item, quantity: newQuantity }
          : item
      );
    });
  };

  const getCartTotal = () => {
    return cart.reduce(
      (sum, item) => sum + item.product.sell_price * item.quantity,
      0
    );
  };

  const validateStock = (): boolean => {
    for (const item of cart) {
      if (item.quantity > item.product.stock) {
        setStockError(
          `Désolé, seulement ${item.product.stock} article(s) disponible(s) pour "${item.product.name}"`
        );
        return false;
      }
    }
    return true;
  };

  const placeAllOrders = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;

    // Validate stock before placing orders
    if (!validateStock()) {
      return;
    }

    try {
      for (const item of cart) {
        await createOrder(
          item.product.id,
          item.product.name,
          item.product.buy_price,
          item.product.sell_price,
          customerName,
          customerPhone,
          customerLocation,
          item.quantity
        );
      }

      setOrderSuccess(true);
      setTimeout(() => {
        setOrderSuccess(false);
        setCart([]);
        setShowCart(false);
        setCustomerName("");
        setCustomerPhone("");
        setCustomerLocation("");
        setStockError(null);
      }, 3000);
    } catch (error) {
      alert("Échec de la commande. Veuillez réessayer.");
    }
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("all");
  };

  // Navigate between products in details view
  const navigateProduct = (direction: "prev" | "next") => {
    if (!selectedProduct) return;
    const currentIndex = filteredProducts.findIndex(
      (p) => p.id === selectedProduct.id
    );
    if (direction === "prev" && currentIndex > 0) {
      setSelectedProduct(filteredProducts[currentIndex - 1]);
    } else if (
      direction === "next" &&
      currentIndex < filteredProducts.length - 1
    ) {
      setSelectedProduct(filteredProducts[currentIndex + 1]);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-gray-300 border-t-[#0e71b4]"></div>
          <p className="mt-2 text-xs text-gray-500">Chargement des produits...</p>
        </div>
      </div>
    );
  }

  // Header Component
  const Header = () => (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 px-4 md:px-6 py-3">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <Package className="w-6 h-6 text-[#0e71b4]" />
            <h1 className="text-xl font-bold text-[#0e71b4]">Shop.tn</h1>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            <button
              onClick={() => {
                setActiveTab("home");
                setMobileMenuOpen(false);
              }}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                activeTab === "home"
                  ? "bg-[#0e71b4] text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              Accueil
            </button>
            <button
              onClick={() => {
                setActiveTab("products");
                setMobileMenuOpen(false);
              }}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                activeTab === "products"
                  ? "bg-[#0e71b4] text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              Boutique
            </button>
           
          </nav>

          {/* Right side - Cart & Mobile menu button */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowCart(!showCart)}
              className="relative p-2 bg-[#ff5851] text-white rounded-full hover:bg-[#e04a44] transition-colors"
            >
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-white text-[#ff5851] text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-md">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-3 pt-3 border-t border-gray-100">
            <nav className="flex flex-col space-y-1">
              <button
                onClick={() => {
                  setActiveTab("home");
                  setMobileMenuOpen(false);
                }}
                className={`px-4 py-3 text-sm font-medium rounded-lg transition-colors text-left ${
                  activeTab === "home"
                    ? "bg-[#0e71b4] text-white"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                Accueil
              </button>
              <button
                onClick={() => {
                  setActiveTab("products");
                  setMobileMenuOpen(false);
                }}
                className={`px-4 py-3 text-sm font-medium rounded-lg transition-colors text-left ${
                  activeTab === "products"
                    ? "bg-[#0e71b4] text-white"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                Boutique
              </button>
              <a
                href="#"
                className="px-4 py-3 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors block"
              >
                Nouveautés
              </a>
              <a
                href="#"
                className="px-4 py-3 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors block"
              >
                Promotions
              </a>
            </nav>
          </div>
        )}
      </div>
    </header>
  );

  // Footer Component
  const Footer = () => (
    <footer className="bg-[#0e71b4] text-white mt-auto rounded-t-[40px]">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 text-2xl font-bold mb-4">
              <Package className="w-6 h-6" />
              <span>Shop.tn</span>
            </div>
            <p className="text-sm text-white/80 mb-4">
              Votre destination shopping en Tunisie. Des milliers de produits aux meilleurs prix, livraison rapide partout dans le pays.
            </p>
            <div className="flex gap-3">
              <a href="#" className="text-white hover:text-white/80 text-xl">
                <i className="fab fa-facebook"></i>
              </a>
              <a href="#" className="text-white hover:text-white/80 text-xl">
                <i className="fab fa-instagram"></i>
              </a>
              <a href="#" className="text-white hover:text-white/80 text-xl">
                <i className="fab fa-linkedin"></i>
              </a>
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-4">LIENS UTILES</h4>
            <ul className="space-y-2 text-sm text-white/80">
              <li><a href="#" className="hover:text-white">À propos de Shop.tn</a></li>
              <li><a href="#" className="hover:text-white">Conditions de vente</a></li>
              <li><a href="#" className="hover:text-white">Livraison et retours</a></li>
              <li><a href="#" className="hover:text-white">Paiement sécurisé</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">CATÉGORIES</h4>
            <ul className="space-y-2 text-sm text-white/80">
              <li><a href="#" className="hover:text-white">Électronique</a></li>
              <li><a href="#" className="hover:text-white">Mode & Accessoires</a></li>
              <li><a href="#" className="hover:text-white">Maison & Jardin</a></li>
              <li><a href="#" className="hover:text-white">Sports & Loisirs</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">CONTACT</h4>
            <ul className="space-y-2 text-sm text-white/80">
              <li><i className="fas fa-envelope mr-2"></i> service@shop.tn</li>
              <li><i className="fas fa-map-marker-alt mr-2"></i> Tunis, Tunisie</li>
            </ul>
          </div>
        </div>
        <div className="text-center mt-12 pt-8 border-t border-white/20 text-sm text-white/70">
          Shop.tn © 2026 - Tous droits réservés
        </div>
      </div>
    </footer>
  );

  // Hero Section with your Shop.tn content
  const HeroSection = () => (
    <section className="flex items-center justify-between gap-10 flex-wrap py-16 px-6 md:px-12 lg:px-20 bg-white">
      {/* Left side - Illustration */}
      <div className="flex-1 min-w-[280px]">
        <img
          src="/image.png"
          alt="Shopping illustration"
          className="w-full max-w-[500px] mx-auto"
        />
      </div>

      {/* Right side - Content */}
      <div className="flex-1 min-w-[280px]">
        <h2 className="text-2xl md:text-3xl font-bold text-[#1a5fb4] mb-5">
          Faites vos achats en toute simplicité sur Shop.tn
        </h2>

        <p className="text-base text-gray-600 leading-relaxed mb-8">
          <strong>Shop.tn</strong> est la plateforme de shopping en ligne leader en Tunisie. 
          Découvrez des milliers de produits aux meilleurs prix, des promotions exclusives 
          et une livraison rapide dans tout le pays. Votre satisfaction est notre priorité.
        </p>

        <button className="bg-[#5ed46a] text-white border-none py-3.5 px-7 rounded-full text-base font-semibold cursor-pointer hover:bg-[#4cb856] transition-colors shadow-md">
          Découvrir nos produits
        </button>
      </div>
    </section>
  );

  // Home View with Shop.tn content
  const HomeView = () => {
    const featuredProducts = products.slice(0, 4);
    const popularProducts = products.slice(4, 8);

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
              onClick={() => setActiveTab("products")}
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
                    setSelectedCategory(category);
                    setActiveTab("products");
                  }}
                  className="group bg-white border border-gray-200 rounded-xl p-5 text-left hover:shadow-lg transition-all hover:-translate-y-1"
                >
                  <div className="text-3xl mb-3 opacity-30 group-hover:opacity-50">
                    📦
                  </div>
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
                onAddToCart={addToCart}
                onViewDetails={setSelectedProduct}
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
                onAddToCart={addToCart}
                onViewDetails={setSelectedProduct}
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
  };

  // Product Card Component
  const ProductCard = ({
    product,
    onAddToCart,
    onViewDetails,
  }: {
    product: Product;
    onAddToCart: (product: Product) => void;
    onViewDetails: (product: Product) => void;
  }) => (
    <div className="group bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-all hover:-translate-y-1">
      <div className="aspect-square bg-gray-50 relative">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package className="w-10 h-10 text-gray-300" />
          </div>
        )}
        <button
          onClick={() => onViewDetails(product)}
          className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
        >
          <span className="bg-white text-gray-900 text-xs px-3 py-2 rounded-lg shadow-lg flex items-center gap-1">
            <Eye className="w-3.5 h-3.5" />
            Aperçu
          </span>
        </button>
      </div>
      <div className="p-3">
        <h3 className="font-medium text-sm text-gray-900 mb-1 line-clamp-1">
          {product.name}
        </h3>
        <p className="text-xs text-gray-500 mb-2">{product.category || "Non catégorisé"}</p>
        <div className="flex items-center justify-between">
          <span className="text-base font-bold text-gray-900">
            {product.sell_price} TND
          </span>
          <button
            onClick={() => onAddToCart(product)}
            disabled={product.stock === 0}
            className={`px-3 py-1 text-xs rounded-lg font-medium transition-colors ${
              product.stock > 0
                ? "bg-[#0e71b4] text-white hover:bg-[#1192e8]"
                : "bg-gray-100 text-gray-400 cursor-not-allowed"
            }`}
          >
            {product.stock > 0 ? "Ajouter" : "Rupture"}
          </button>
        </div>
      </div>
    </div>
  );

  // Product Details Modal
  if (selectedProduct) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex flex-col">
        <Header />

        <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-6">
          <button
            onClick={() => setSelectedProduct(null)}
            className="flex items-center gap-1 text-xs text-gray-500 hover:text-[#0e71b4] mb-4"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Retour à la boutique
          </button>

          {/* Navigation between products */}
          <div className="flex justify-between items-center mb-4">
            <button
              onClick={() => navigateProduct("prev")}
              disabled={
                filteredProducts.findIndex((p) => p.id === selectedProduct.id) === 0
              }
              className={`p-1.5 border border-gray-200 rounded ${
                filteredProducts.findIndex((p) => p.id === selectedProduct.id) === 0
                  ? "text-gray-300 cursor-not-allowed"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs text-gray-500">
              {filteredProducts.findIndex((p) => p.id === selectedProduct.id) + 1} sur{" "}
              {filteredProducts.length}
            </span>
            <button
              onClick={() => navigateProduct("next")}
              disabled={
                filteredProducts.findIndex((p) => p.id === selectedProduct.id) ===
                filteredProducts.length - 1
              }
              className={`p-1.5 border border-gray-200 rounded ${
                filteredProducts.findIndex((p) => p.id === selectedProduct.id) ===
                filteredProducts.length - 1
                  ? "text-gray-300 cursor-not-allowed"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
            {/* Product Image */}
            <div className="aspect-video bg-gray-50 flex items-center justify-center p-8">
              {selectedProduct.image_url ? (
                <img
                  src={selectedProduct.image_url}
                  alt={selectedProduct.name}
                  className="max-w-full max-h-full object-contain"
                />
              ) : (
                <Package className="w-16 h-16 text-gray-300" />
              )}
            </div>

            {/* Product Details */}
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    {selectedProduct.name}
                  </h2>
                  {selectedProduct.category && (
                    <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                      {selectedProduct.category}
                    </span>
                  )}
                </div>
                <span
                  className={`text-xs px-3 py-1 rounded-full ${
                    selectedProduct.stock > 0
                      ? "bg-green-50 text-green-600"
                      : "bg-red-50 text-red-500"
                  }`}
                >
                  {selectedProduct.stock > 0 ? "En stock" : "Rupture"}
                </span>
              </div>

              {selectedProduct.description && (
                <p className="text-sm text-gray-600 mb-6">
                  {selectedProduct.description}
                </p>
              )}

              <div className="border-t border-gray-100 pt-6 mb-6">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-xs text-gray-500">Prix</span>
                    <p className="text-3xl font-bold text-[#0e71b4]">
                      {selectedProduct.sell_price} <span className="text-sm font-normal">TND</span>
                    </p>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500">Stock disponible</span>
                    <p
                      className={`font-medium ${
                        selectedProduct.stock > 0 ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {selectedProduct.stock > 0 ? `${selectedProduct.stock} articles` : "Épuisé"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    addToCart(selectedProduct);
                    setSelectedProduct(null);
                  }}
                  disabled={selectedProduct.stock === 0}
                  className={`flex-1 py-3 rounded-full font-medium transition-colors ${
                    selectedProduct.stock > 0
                      ? "bg-[#0e71b4] text-white hover:bg-[#1192e8]"
                      : "bg-gray-100 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  <i className="fas fa-cart-plus mr-2"></i>
                  Ajouter au panier
                </button>
                <button
                  onClick={() => setSelectedProduct(null)}
                  className="px-6 py-3 border border-gray-200 rounded-full font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    );
  }

  // Checkout view
  if (showCart) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex flex-col">
        <Header />

        <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6">
          <button
            onClick={() => setShowCart(false)}
            className="flex items-center gap-1 text-xs text-gray-500 hover:text-[#0e71b4] mb-4"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Continuer mes achats
          </button>

          <h2 className="text-2xl font-bold mb-4 text-gray-800 flex items-center gap-2">
            <ShoppingCart className="w-6 h-6 text-[#0e71b4]" />
            Mon panier ({cartCount} article{cartCount > 1 ? "s" : ""})
          </h2>

          {orderSuccess && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-600">
              <i className="fas fa-check-circle mr-2"></i>
              Commande confirmée ! Merci pour votre achat.
            </div>
          )}

          {stockError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
              <i className="fas fa-exclamation-circle mr-2"></i>
              {stockError}
            </div>
          )}

          {cart.length === 0 ? (
            <div className="text-center py-12 bg-white border border-gray-200 rounded-2xl">
              <ShoppingCart className="w-16 h-16 mx-auto text-gray-300 mb-3" />
              <p className="text-sm text-gray-500 mb-4">Votre panier est vide</p>
              <button
                onClick={() => setShowCart(false)}
                className="px-6 py-2 bg-[#0e71b4] text-white text-sm rounded-full hover:bg-[#1192e8] transition-colors"
              >
                Découvrir nos produits
              </button>
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-6">
              {/* Cart Items */}
              <div className="md:col-span-2 space-y-3">
                {cart.map((item) => {
                  const maxStock = item.product.stock;
                  return (
                    <div
                      key={item.product.id}
                      className="bg-white border border-gray-200 rounded-xl p-4"
                    >
                      <div className="flex gap-4">
                        <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center">
                          <Package className="w-8 h-8 text-gray-400" />
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-medium text-gray-800">
                                {item.product.name}
                              </h3>
                              <p className="text-xs text-gray-500 mt-1">
                                {item.product.sell_price} TND / unité
                              </p>
                            </div>
                            <button
                              onClick={() => removeFromCart(item.product.id)}
                              className="text-gray-400 hover:text-red-500 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                          <div className="flex justify-between items-center mt-3">
                            <div className="flex items-center gap-2 border border-gray-200 rounded-lg">
                              <button
                                onClick={() =>
                                  updateQuantity(item.product.id, item.quantity - 1)
                                }
                                className="p-1.5 hover:bg-gray-50 text-gray-600"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="w-8 text-center text-sm">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() =>
                                  updateQuantity(item.product.id, item.quantity + 1)
                                }
                                disabled={item.quantity >= maxStock}
                                className={`p-1.5 ${
                                  item.quantity >= maxStock
                                    ? "text-gray-300 cursor-not-allowed"
                                    : "hover:bg-gray-50 text-gray-600"
                                }`}
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                            <span className="font-semibold text-[#0e71b4]">
                              {(item.product.sell_price * item.quantity).toFixed(2)} TND
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Order Summary */}
              <div className="bg-white border border-gray-200 rounded-xl p-6 h-fit">
                <h3 className="font-semibold text-lg mb-4">Récapitulatif</h3>
                
                <div className="space-y-3 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Sous-total</span>
                    <span className="font-medium">{getCartTotal().toFixed(2)} TND</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Livraison</span>
                    <span className="text-green-600">Gratuite</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">TVA (19%)</span>
                    <span className="font-medium">{(getCartTotal() * 0.19).toFixed(2)} TND</span>
                  </div>
                  <div className="border-t border-gray-100 pt-3 flex justify-between font-bold">
                    <span>Total TTC</span>
                    <span className="text-[#0e71b4] text-xl">
                      {(getCartTotal() * 1.19).toFixed(2)} TND
                    </span>
                  </div>
                </div>

                <h4 className="font-medium mb-3">Informations de livraison</h4>
                <form onSubmit={placeAllOrders} className="space-y-3">
                  <input
                    type="text"
                    placeholder="Nom complet"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    required
                    className="w-full p-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#0e71b4]"
                  />
                  <input
                    type="tel"
                    placeholder="Téléphone"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    required
                    className="w-full p-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#0e71b4]"
                  />
                  <input
                    type="text"
                    placeholder="Adresse complète"
                    value={customerLocation}
                    onChange={(e) => setCustomerLocation(e.target.value)}
                    required
                    className="w-full p-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#0e71b4]"
                  />
                  <button
                    type="submit"
                    disabled={cart.some((item) => item.quantity > item.product.stock)}
                    className={`w-full py-3 rounded-lg font-medium transition-colors ${
                      cart.some((item) => item.quantity > item.product.stock)
                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                        : "bg-[#27ae60] text-white hover:bg-[#219150]"
                    }`}
                  >
                    Confirmer la commande ({cart.length} article{cart.length > 1 ? "s" : ""})
                  </button>
                </form>
                <p className="text-xs text-gray-400 mt-3 text-center">
                  Paiement à la livraison
                </p>
              </div>
            </div>
          )}
        </main>

        <Footer />
      </div>
    );
  }

  // Products view
  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6">
        {activeTab === "home" ? (
          <HomeView />
        ) : (
          <>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Tous nos produits</h2>
              <span className="text-sm text-gray-500">{filteredProducts.length} article{filteredProducts.length > 1 ? "s" : ""}</span>
            </div>

            {/* Search and Filter Section */}
            <div className="mb-6 space-y-3">
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher un produit..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#0e71b4]"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Filter Toggle for Mobile */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="md:hidden flex items-center gap-1 text-xs text-gray-600 border border-gray-200 rounded-lg px-3 py-2"
              >
                <Filter className="w-3.5 h-3.5" />
                Filtres
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform ${
                    showFilters ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* Filter Options */}
              <div
                className={`${
                  showFilters ? "block" : "hidden"
                } md:block space-y-2 md:space-y-0 md:flex md:items-center md:gap-3`}
              >
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full md:w-auto px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#0e71b4]"
                >
                  <option value="all">Toutes les catégories</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>

                {(searchQuery || selectedCategory !== "all") && (
                  <button
                    onClick={clearFilters}
                    className="text-xs text-gray-500 hover:text-[#0e71b4] px-3 py-2 border border-gray-200 rounded-lg"
                  >
                    Effacer les filtres
                  </button>
                )}
              </div>
            </div>

            {/* Product Grid */}
            {filteredProducts.length === 0 ? (
              <div className="text-center py-12 bg-white border border-gray-200 rounded-2xl">
                <Package className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                <p className="text-sm text-gray-500 mb-2">Aucun produit trouvé</p>
                <button
                  onClick={clearFilters}
                  className="text-sm text-[#0e71b4] hover:underline"
                >
                  Effacer les filtres
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredProducts.map((product) => (
                  <div
                    key={product.id}
                    className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-all"
                  >
                    <div className="aspect-square bg-gray-50 flex items-center justify-center relative group">
                      {product.image_url ? (
                        <img
                          src={product.image_url}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Package className="w-10 h-10 text-gray-300" />
                      )}

                      {/* View Details Overlay */}
                      <button
                        onClick={() => setSelectedProduct(product)}
                        className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100"
                      >
                        <span className="bg-white text-gray-800 text-xs px-4 py-2 rounded-lg shadow-lg flex items-center gap-1">
                          <Eye className="w-3.5 h-3.5" />
                          Détails
                        </span>
                      </button>
                    </div>

                    <div className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium text-gray-800 line-clamp-1">
                          {product.name}
                        </h3>
                        <button
                          onClick={() => setSelectedProduct(product)}
                          className="text-gray-400 hover:text-[#0e71b4]"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>

                      {product.category && (
                        <span className="text-xs text-gray-400 mb-2 block">
                          {product.category}
                        </span>
                      )}

                      <div className="flex items-center justify-between mb-3">
                        <span className="text-lg font-bold text-[#0e71b4]">
                          {product.sell_price} TND
                        </span>
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${
                            product.stock > 0
                              ? "bg-green-50 text-green-600"
                              : "bg-red-50 text-red-500"
                          }`}
                        >
                          {product.stock > 0 ? "En stock" : "Rupture"}
                        </span>
                      </div>

                      <button
                        onClick={() => addToCart(product)}
                        disabled={product.stock === 0}
                        className={`w-full py-2 text-sm rounded-lg font-medium transition-colors flex items-center justify-center gap-1 ${
                          product.stock > 0
                            ? "bg-[#0e71b4] text-white hover:bg-[#1192e8]"
                            : "bg-gray-100 text-gray-400 cursor-not-allowed"
                        }`}
                      >
                        <ShoppingCart className="w-4 h-4" />
                        Ajouter au panier
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default Store;