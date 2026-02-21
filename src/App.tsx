import React, { useState, useEffect, useRef } from "react";
import { getProducts, createOrder, type Product } from "./lib/db";
import {
  ShoppingCart,
  X,
  Package,
  ArrowLeft,
  Trash2,
  Plus,
  Minus,
  ChevronLeft,
  ChevronRight,
  Filter,
  Sliders,
  Search,
  Check,
  Phone,
} from "lucide-react";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { HomeView } from "./components/HomeView";
import { ProductCard, ProductSkeleton } from "./components/ProductCard";

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
  const [isNavigating, setIsNavigating] = useState(false);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Refs for scrolling
  const productsSectionRef = useRef<HTMLDivElement>(null);

  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<{ min: number; max: number }>({
    min: 0,
    max: 1000,
  });
  const [selectedPriceRange, setSelectedPriceRange] = useState<{
    min: number;
    max: number;
  }>({ min: 0, max: 1000 });
  const [inStockOnly, setInStockOnly] = useState(false);
  const [selectedRatings, setSelectedRatings] = useState<number[]>([]);
  const [sortBy, setSortBy] = useState<
    "default" | "price-asc" | "price-desc" | "name-asc" | "name-desc"
  >("default");

  // Order form state
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerLocation, setCustomerLocation] = useState("");

  // Stock validation error
  const [stockError, setStockError] = useState<string | null>(null);

  useEffect(() => {
    getProducts().then((data) => {
      setProducts(data);

      // Extract unique categories
      const uniqueCategories = Array.from(
        new Set(data.map((p) => p.category).filter(Boolean)),
      ) as string[];
      setCategories(uniqueCategories);

      // Calculate price range from products
      const prices = data.map((p) => p.sell_price);
      const minPrice = Math.min(...prices);
      const maxPrice = Math.max(...prices);
      setPriceRange({ min: minPrice, max: maxPrice });
      setSelectedPriceRange({ min: minPrice, max: maxPrice });

      setLoading(false);
    });
  }, []);

  // Filter and sort products
  useEffect(() => {
    let result = [...products];

    // Apply category filter
    if (selectedCategory.length > 0) {
      result = result.filter(
        (p) => p.category && selectedCategory.includes(p.category),
      );
    }

    // Apply price range filter
    result = result.filter(
      (p) =>
        p.sell_price >= selectedPriceRange.min &&
        p.sell_price <= selectedPriceRange.max,
    );

    // Apply stock filter
    if (inStockOnly) {
      result = result.filter((p) => p.stock > 0);
    }

    // Apply search filter
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          (p.description && p.description.toLowerCase().includes(query)) ||
          (p.category && p.category.toLowerCase().includes(query)),
      );
    }

    // Apply sorting
    switch (sortBy) {
      case "price-asc":
        result.sort((a, b) => a.sell_price - b.sell_price);
        break;
      case "price-desc":
        result.sort((a, b) => b.sell_price - a.sell_price);
        break;
      case "name-asc":
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "name-desc":
        result.sort((a, b) => b.name.localeCompare(a.name));
        break;
      default:
        // Default sorting (by id or whatever)
        break;
    }

    setFilteredProducts(result);
  }, [
    products,
    selectedCategory,
    selectedPriceRange,
    inStockOnly,
    searchQuery,
    sortBy,
  ]);

  // Clear stock error when cart changes
  useEffect(() => {
    setStockError(null);
  }, [cart]);

  // Scroll to top when switching to products tab
  useEffect(() => {
    if (activeTab === "products" && productsSectionRef.current) {
      setTimeout(() => {
        productsSectionRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 100);
    }
  }, [activeTab]);

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const addToCart = (product: Product) => {
    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.product.id === product.id);
      const currentQuantity = existing ? existing.quantity : 0;

      if (currentQuantity + 1 > product.stock) {
        setStockError(
          `Désolé, seulement ${product.stock} article(s) disponible(s) pour "${product.name}"`,
        );
        return prevCart;
      }

      setStockError(null);

      if (existing) {
        return prevCart.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
      }
      return [...prevCart, { product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: number) => {
    setCart((prevCart) =>
      prevCart.filter((item) => item.product.id !== productId),
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
          `Désolé, seulement ${item.product.stock} article(s) disponible(s) pour "${item.product.name}"`,
        );
        return prevCart;
      }

      setStockError(null);

      return prevCart.map((item) =>
        item.product.id === productId
          ? { ...item, quantity: newQuantity }
          : item,
      );
    });
  };

  const getCartTotal = () => {
    return cart.reduce(
      (sum, item) => sum + item.product.sell_price * item.quantity,
      0,
    );
  };

  const validateStock = (): boolean => {
    for (const item of cart) {
      if (item.quantity > item.product.stock) {
        setStockError(
          `Désolé, seulement ${item.product.stock} article(s) disponible(s) pour "${item.product.name}"`,
        );
        return false;
      }
    }
    return true;
  };

  const placeAllOrders = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;

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
          item.quantity,
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
    setSelectedCategory([]);
    setSelectedPriceRange(priceRange);
    setInStockOnly(false);
    setSelectedRatings([]);
    setSortBy("default");
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category],
    );
  };

  const navigateProduct = (direction: "prev" | "next") => {
    if (!selectedProduct) return;
    const currentIndex = filteredProducts.findIndex(
      (p) => p.id === selectedProduct.id,
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

  const handleNavigateToProducts = () => {
    setIsNavigating(true);
    setActiveTab("products");

    setTimeout(() => {
      setIsNavigating(false);
    }, 1000);
  };

  const handleCategorySelect = (category: string) => {
    setSelectedCategory([category]);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-gray-300 border-t-[#0e71b4]"></div>
          <p className="mt-2 text-xs text-gray-500">
            Chargement des produits...
          </p>
        </div>
      </div>
    );
  }

  // Filters Sidebar Component
  const FiltersSidebar = () => (
    <aside className="w-64 flex-shrink-0 hidden lg:block">
      <div className="sticky top-20 bg-white border border-gray-200 rounded-xl p-5 max-h-[calc(100vh-6rem)] overflow-y-auto">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900 flex items-center gap-1">
            <Sliders className="w-4 h-4" />
            Filtres
          </h3>
          {(selectedCategory.length > 0 ||
            selectedPriceRange.min !== priceRange.min ||
            selectedPriceRange.max !== priceRange.max ||
            inStockOnly ||
            selectedRatings.length > 0) && (
            <button
              onClick={clearFilters}
              className="text-xs text-[#0e71b4] hover:underline"
            >
              Réinitialiser
            </button>
          )}
        </div>

        {/* Search Filter */}
        <div className="mb-5">
          <label className="text-xs font-medium text-gray-700 mb-2 block">
            Recherche
          </label>
          <div className="relative">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <input
              type="text"
              placeholder="Nom du produit..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-2 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:border-[#0e71b4]"
            />
          </div>
        </div>

        {/* Categories Filter */}
        <div className="mb-5">
          <label className="text-xs font-medium text-gray-700 mb-2 block">
            Catégories
          </label>
          <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
            {categories.map((category) => (
              <label
                key={category}
                className="flex items-center gap-2 cursor-pointer group px-1 py-1.5 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <input
                  type="checkbox"
                  checked={selectedCategory.includes(category)}
                  onChange={() => handleCategoryChange(category)}
                  className="rounded border-gray-300 text-[#0e71b4] focus:ring-[#0e71b4] focus:ring-offset-0 transition-colors"
                />
                <span className="flex-1 text-xs text-gray-600 group-hover:text-gray-900 font-medium truncate">
                  {category}
                </span>
                <span className="text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full">
                  {products.filter((p) => p.category === category).length}
                </span>
              </label>
            ))}
          </div>
          <div className="flex items-center gap-2 mt-3 pt-2 border-t border-gray-100">
            <button
              onClick={() => setSelectedCategory([])}
              className="text-xs text-gray-500 hover:text-[#0e71b4] transition-colors"
            >
              Tout effacer
            </button>
          </div>
        </div>

        {/* In Stock Only Filter */}
        <div className="mb-5">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={inStockOnly}
              onChange={(e) => setInStockOnly(e.target.checked)}
              className="rounded border-gray-300 text-[#0e71b4] focus:ring-[#0e71b4] focus:ring-offset-0"
            />
            <span className="text-xs font-medium text-gray-700">
              En stock uniquement
            </span>
          </label>
        </div>

        {/* Active Filters Summary */}
        {(selectedCategory.length > 0 ||
          selectedPriceRange.min !== priceRange.min ||
          selectedPriceRange.max !== priceRange.max ||
          inStockOnly ||
          selectedRatings.length > 0) && (
          <div className="mt-4 pt-3 border-t border-gray-100">
            <p className="text-xs text-gray-500 mb-2">Filtres actifs:</p>
            <div className="flex flex-wrap gap-1">
              {selectedCategory.map((cat) => (
                <span
                  key={cat}
                  className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-[#0e71b4] text-xs rounded"
                >
                  {cat}
                  <button
                    onClick={() => handleCategoryChange(cat)}
                    className="hover:text-blue-700"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
              {(selectedPriceRange.min !== priceRange.min ||
                selectedPriceRange.max !== priceRange.max) && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-[#0e71b4] text-xs rounded">
                  {selectedPriceRange.min} - {selectedPriceRange.max} TND
                  <button
                    onClick={() => setSelectedPriceRange(priceRange)}
                    className="hover:text-blue-700"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {inStockOnly && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-[#0e71b4] text-xs rounded">
                  En stock
                  <button
                    onClick={() => setInStockOnly(false)}
                    className="hover:text-blue-700"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </aside>
  );

  // Mobile Filters Drawer
  const MobileFiltersDrawer = () => (
    <>
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setMobileFiltersOpen(false)}
          />
          <div className="absolute right-0 top-0 bottom-0 w-80 bg-white shadow-xl overflow-y-auto">
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900 flex items-center gap-1">
                  <Sliders className="w-4 h-4" />
                  Filtres
                </h3>
                <button onClick={() => setMobileFiltersOpen(false)}>
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="space-y-5">
                {/* Search Filter */}
                <div>
                  <label className="text-xs font-medium text-gray-700 mb-2 block">
                    Recherche
                  </label>
                  <div className="relative">
                    <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Nom du produit..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-8 pr-2 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:border-[#0e71b4]"
                    />
                  </div>
                </div>

                {/* Categories Filter */}
                <div>
                  <label className="text-xs font-medium text-gray-700 mb-2 block">
                    Catégories
                  </label>
                  <div className="space-y-2">
                    {categories.map((category) => (
                      <label
                        key={category}
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={selectedCategory.includes(category)}
                          onChange={() => handleCategoryChange(category)}
                          className="rounded border-gray-300 text-[#0e71b4] focus:ring-[#0e71b4]"
                        />
                        <span className="text-sm text-gray-600">
                          {category}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* In Stock Only */}
                <div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={inStockOnly}
                      onChange={(e) => setInStockOnly(e.target.checked)}
                      className="rounded border-gray-300 text-[#0e71b4] focus:ring-[#0e71b4]"
                    />
                    <span className="text-sm text-gray-700">
                      En stock uniquement
                    </span>
                  </label>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-3">
                  <button
                    onClick={clearFilters}
                    className="flex-1 px-3 py-2 text-xs border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50"
                  >
                    Réinitialiser
                  </button>
                  <button
                    onClick={() => setMobileFiltersOpen(false)}
                    className="flex-1 px-3 py-2 text-xs bg-[#0e71b4] text-white rounded-lg hover:bg-[#1192e8]"
                  >
                    Appliquer
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );

  // Product Details Modal
  if (selectedProduct) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex flex-col">
        <Header
          activeTab={activeTab}
          cartCount={cartCount}
          mobileMenuOpen={mobileMenuOpen}
          onTabChange={setActiveTab}
          onCartClick={() => setShowCart(true)}
          onMobileMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)}
        />

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
                filteredProducts.findIndex(
                  (p) => p.id === selectedProduct.id,
                ) === 0
              }
              className={`p-1.5 border border-gray-200 rounded ${
                filteredProducts.findIndex(
                  (p) => p.id === selectedProduct.id,
                ) === 0
                  ? "text-gray-300 cursor-not-allowed"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs text-gray-500">
              {filteredProducts.findIndex((p) => p.id === selectedProduct.id) +
                1}{" "}
              sur {filteredProducts.length}
            </span>
            <button
              onClick={() => navigateProduct("next")}
              disabled={
                filteredProducts.findIndex(
                  (p) => p.id === selectedProduct.id,
                ) ===
                filteredProducts.length - 1
              }
              className={`p-1.5 border border-gray-200 rounded ${
                filteredProducts.findIndex(
                  (p) => p.id === selectedProduct.id,
                ) ===
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
                      {selectedProduct.sell_price}{" "}
                      <span className="text-sm font-normal">TND</span>
                    </p>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500">
                      Stock disponible
                    </span>
                    <p
                      className={`font-medium ${
                        selectedProduct.stock > 0
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {selectedProduct.stock > 0
                        ? `${selectedProduct.stock} articles`
                        : "Épuisé"}
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
        <Header
          activeTab={activeTab}
          cartCount={cartCount}
          mobileMenuOpen={mobileMenuOpen}
          onTabChange={setActiveTab}
          onCartClick={() => setShowCart(false)}
          onMobileMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)}
        />

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
            <div className="mb-4 p-4 bg-gradient-to-r from-[#27ae60] to-[#2ecc71] border border-green-200 rounded-lg shadow-lg animate-slide-down">
              <div className="flex items-start gap-3">
                <div className="bg-white rounded-full p-1">
                  <Check className="w-5 h-5 text-[#27ae60]" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-white text-base mb-1">
                    Commande confirmée avec succès! 🎉
                  </h3>
                  <p className="text-white/90 text-sm mb-2">
                    Merci pour votre achat,{" "}
                    <span className="font-semibold">{customerName}</span>!
                  </p>
                  <p className="text-white/90 text-sm flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5" />
                    Un conseiller vous contactera dans les plus brefs délais au{" "}
                    <span className="font-semibold">{customerPhone}</span>
                  </p>
                  <p className="text-white/80 text-xs mt-2 border-t border-white/20 pt-2">
                    ⏱️ Délai de livraison estimé : 24h - 48h
                  </p>
                </div>
                <button
                  onClick={() => {
                    setOrderSuccess(false);
                    setCart([]);
                    setShowCart(false);
                    setCustomerName("");
                    setCustomerPhone("");
                    setCustomerLocation("");
                    setStockError(null);
                  }}
                  className="text-white/70 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
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
              <p className="text-sm text-gray-500 mb-4">
                Votre panier est vide
              </p>
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
                          {item.product.image_url ? (
                            <img
                              src={item.product.image_url}
                              alt={item.product.name}
                              className="w-full h-full object-cover rounded-lg"
                            />
                          ) : (
                            <Package className="w-8 h-8 text-gray-400" />
                          )}
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
                                  updateQuantity(
                                    item.product.id,
                                    item.quantity - 1,
                                  )
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
                                  updateQuantity(
                                    item.product.id,
                                    item.quantity + 1,
                                  )
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
                              {(
                                item.product.sell_price * item.quantity
                              ).toFixed(2)}{" "}
                              TND
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
                    <span className="font-medium">
                      {getCartTotal().toFixed(2)} TND
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Livraison</span>
                    <span className="text-green-600">Gratuite</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">TVA (19%)</span>
                    <span className="font-medium">
                      {(getCartTotal() * 0.19).toFixed(2)} TND
                    </span>
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
                    disabled={cart.some(
                      (item) => item.quantity > item.product.stock,
                    )}
                    className={`w-full py-3 rounded-lg font-medium transition-colors ${
                      cart.some((item) => item.quantity > item.product.stock)
                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                        : "bg-[#27ae60] text-white hover:bg-[#219150]"
                    }`}
                  >
                    Confirmer la commande ({cart.length} article
                    {cart.length > 1 ? "s" : ""})
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
      <Header
        activeTab={activeTab}
        cartCount={cartCount}
        mobileMenuOpen={mobileMenuOpen}
        onTabChange={(tab) => {
          if (tab === "products") {
            handleNavigateToProducts();
          } else {
            setActiveTab(tab);
          }
        }}
        onCartClick={() => setShowCart(true)}
        onMobileMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)}
      />
      <MobileFiltersDrawer />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6">
        {activeTab === "home" ? (
          <HomeView
            products={products}
            categories={categories}
            onProductAdd={addToCart}
            onProductView={setSelectedProduct}
            onNavigateToProducts={handleNavigateToProducts}
            onCategorySelect={handleCategorySelect}
          />
        ) : (
          <>
            <div ref={productsSectionRef} className="scroll-mt-20">
              {/* Header with title, filter toggle, and sort */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                  <h2 className="text-2xl font-bold text-gray-800">
                    Tous nos produits
                  </h2>
                  <span className="text-sm text-gray-500">
                    {filteredProducts.length} article
                    {filteredProducts.length > 1 ? "s" : ""}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  {/* Mobile filter button */}
                  <button
                    onClick={() => setMobileFiltersOpen(true)}
                    className="lg:hidden flex items-center gap-1 px-3 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    <Filter className="w-4 h-4" />
                    Filtres
                    {(selectedCategory.length > 0 || inStockOnly) && (
                      <span className="ml-1 w-5 h-5 bg-[#0e71b4] text-white text-xs rounded-full flex items-center justify-center">
                        {selectedCategory.length + (inStockOnly ? 1 : 0)}
                      </span>
                    )}
                  </button>

                  {/* Sort dropdown */}
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                    className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#0e71b4] bg-white"
                  >
                    <option value="default">Trier par</option>
                    <option value="price-asc">Prix croissant</option>
                    <option value="price-desc">Prix décroissant</option>
                    <option value="name-asc">Nom (A-Z)</option>
                    <option value="name-desc">Nom (Z-A)</option>
                  </select>
                </div>
              </div>

              {/* Main content with sidebar and product grid */}
              <div className="flex gap-6">
                {/* Filters Sidebar - Desktop only */}
                <FiltersSidebar />

                {/* Product Grid */}
                <div className="flex-1">
                  {isNavigating ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-3">
                      {[...Array(15)].map((_, index) => (
                        <ProductSkeleton key={index} />
                      ))}
                    </div>
                  ) : filteredProducts.length === 0 ? (
                    <div className="text-center py-12 bg-white border border-gray-200 rounded-2xl">
                      <Package className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                      <p className="text-sm text-gray-500 mb-2">
                        Aucun produit trouvé
                      </p>
                      <button
                        onClick={clearFilters}
                        className="text-sm text-[#0e71b4] hover:underline"
                      >
                        Effacer les filtres
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-3">
                      {filteredProducts.map((product) => (
                        <ProductCard
                          key={product.id}
                          product={product}
                          onAddToCart={addToCart}
                          onViewDetails={setSelectedProduct}
                          variant="compact"
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default Store;
