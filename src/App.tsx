import { useEffect, useState } from "react";
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
  Home,
  Grid,
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
        new Set(data.map((p) => p.category).filter(Boolean)),
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
          (p.category && p.category.toLowerCase().includes(query)),
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
        setStockError(`Sorry, only ${product.stock} item(s) available for "${product.name}"`);
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
        setStockError(`Sorry, only ${item.product.stock} item(s) available for "${item.product.name}"`);
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
        setStockError(`Sorry, only ${item.product.stock} item(s) available for "${item.product.name}"`);
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
      alert("Order failed. Please try again.");
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

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-gray-300 border-t-gray-600"></div>
          <p className="mt-2 text-xs text-gray-500">Loading products...</p>
        </div>
      </div>
    );
  }

  // Header Component
  const Header = () => (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 px-4 py-2.5">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Package className="w-5 h-5 text-gray-700" />
          <h1 className="text-lg font-semibold text-gray-800">Shop</h1>
        </div>

        <button
          onClick={() => setShowCart(!showCart)}
          className="relative p-1.5"
        >
          <ShoppingCart className="w-5 h-5 text-gray-700" />
          {cartCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-gray-800 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
              {cartCount}
            </span>
          )}
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto flex items-center gap-4 mt-2 border-t border-gray-100 pt-2">
        <button
          onClick={() => setActiveTab("home")}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded transition-colors ${
            activeTab === "home"
              ? "bg-gray-800 text-white"
              : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          <Home className="w-3.5 h-3.5" />
          Home
        </button>
        <button
          onClick={() => setActiveTab("products")}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded transition-colors ${
            activeTab === "products"
              ? "bg-gray-800 text-white"
              : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          <Grid className="w-3.5 h-3.5" />
          Products
        </button>
      </div>
    </header>
  );

  // Footer Component
  const Footer = () => (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
              About
            </h3>
            <p className="text-xs text-gray-500">Your trusted online store.</p>
          </div>
          <div>
            <h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
              Links
            </h3>
            <ul className="space-y-1">
              <li>
                <button className="text-xs text-gray-500 hover:text-gray-700">
                  Privacy
                </button>
              </li>
              <li>
                <button className="text-xs text-gray-500 hover:text-gray-700">
                  Terms
                </button>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
              Contact
            </h3>
            <p className="text-xs text-gray-500">support@shop.com</p>
          </div>
        </div>
        <div className="text-center mt-3 pt-3 border-t border-gray-100 text-xs text-gray-400">
          © 2026 Shop. All rights reserved.
        </div>
      </div>
    </footer>
  );

  // Home View Component
  const HomeView = () => (
    <div className="space-y-6">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-700 text-white rounded-lg p-6">
        <h2 className="text-xl font-bold mb-2">Welcome to Our Shop</h2>
        <p className="text-sm text-gray-200 mb-4">
          Discover amazing products at great prices
        </p>
        <button
          onClick={() => setActiveTab("products")}
          className="bg-white text-gray-900 px-4 py-2 rounded text-sm font-medium hover:bg-gray-100 transition-colors"
        >
          Shop Now
        </button>
      </div>

      {/* Featured Categories */}
      <div>
        <h3 className="text-sm font-semibold mb-3">Featured Categories</h3>
        <div className="grid grid-cols-2 gap-2">
          {categories.slice(0, 4).map((category) => (
            <button
              key={category}
              onClick={() => {
                setSelectedCategory(category);
                setActiveTab("products");
              }}
              className="border border-gray-200 rounded p-3 text-center hover:border-gray-400 transition-colors"
            >
              <span className="text-xs font-medium text-gray-800">
                {category}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Featured Products */}
      <div>
        <h3 className="text-sm font-semibold mb-3">Featured Products</h3>
        <div className="space-y-2">
          {products.slice(0, 3).map((product) => (
            <div
              key={product.id}
              className="border border-gray-200 rounded p-3 flex items-center gap-3"
            >
              <div className="w-16 h-16 bg-gray-50 rounded overflow-hidden flex-shrink-0">
                {product.image_url ? (
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Package className="w-6 h-6 m-5 text-gray-300" />
                )}
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-medium text-gray-900">
                  {product.name}
                </h4>
                <p className="text-xs text-gray-500 mt-1">
                  ${product.sell_price}
                </p>
              </div>
              <button
                onClick={() => setSelectedProduct(product)}
                className="text-xs text-gray-600 border border-gray-200 rounded px-2 py-1 hover:bg-gray-50"
              >
                View
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // Product Details Modal
  if (selectedProduct) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <Header />

        <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-4">
          <button
            onClick={() => setSelectedProduct(null)}
            className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 mb-4"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to products
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
              of {filteredProducts.length}
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

          <div className="border border-gray-200 rounded overflow-hidden">
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
            <div className="p-4">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-1">
                    {selectedProduct.name}
                  </h2>
                  {selectedProduct.category && (
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                      {selectedProduct.category}
                    </span>
                  )}
                </div>
                <span
                  className={`text-xs px-2 py-1 rounded ${
                    selectedProduct.stock > 0
                      ? "bg-green-50 text-green-600"
                      : "bg-red-50 text-red-500"
                  }`}
                >
                  {selectedProduct.stock > 0 ? "In stock" : "Out of stock"}
                </span>
              </div>

              {selectedProduct.description && (
                <p className="text-sm text-gray-600 mb-4">
                  {selectedProduct.description}
                </p>
              )}

              <div className="border-t border-gray-100 pt-4 mb-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-xs text-gray-500">Price</span>
                    <p className="text-2xl font-bold text-gray-900">
                      ${selectedProduct.sell_price}
                    </p>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500">Stock Status</span>
                    <p
                      className={`font-medium ${
                        selectedProduct.stock > 0
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {selectedProduct.stock > 0 ? "In Stock" : "Out of Stock"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    addToCart(selectedProduct);
                    setSelectedProduct(null);
                  }}
                  disabled={selectedProduct.stock === 0}
                  className={`flex-1 py-3 rounded font-medium transition-colors ${
                    selectedProduct.stock > 0
                      ? "bg-gray-800 text-white hover:bg-gray-700"
                      : "bg-gray-100 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  Add to Cart
                </button>
                <button
                  onClick={() => setSelectedProduct(null)}
                  className="px-4 py-3 border border-gray-200 rounded font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Close
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
      <div className="min-h-screen bg-white flex flex-col">
        <Header />

        <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-4">
          <button
            onClick={() => setShowCart(false)}
            className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 mb-4"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to products
          </button>

          <h2 className="text-lg font-semibold mb-3 text-gray-800">
            Shopping Cart ({cartCount} items)
          </h2>

          {orderSuccess && (
            <div className="mb-3 p-2 bg-green-50 border border-green-200 rounded text-xs text-green-600">
              All orders placed successfully!
            </div>
          )}

          {stockError && (
            <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-600">
              {stockError}
            </div>
          )}

          {cart.length === 0 ? (
            <div className="text-center py-8 border border-gray-200 rounded">
              <ShoppingCart className="w-8 h-8 mx-auto text-gray-300 mb-2" />
              <p className="text-xs text-gray-400">Your cart is empty</p>
              <button
                onClick={() => setShowCart(false)}
                className="mt-3 px-4 py-1.5 bg-gray-800 text-white text-xs rounded hover:bg-gray-700"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            <>
              {/* Mobile Cart Items */}
              <div className="space-y-2 md:hidden">
                {cart.map((item) => {
                  const maxStock = item.product.stock;
                  return (
                    <div
                      key={item.product.id}
                      className="border border-gray-200 rounded p-3"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="text-sm font-medium text-gray-800">
                            {item.product.name}
                          </h3>
                          <p className="text-xs text-gray-500">
                            ${item.product.sell_price} each
                          </p>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.product.id)}
                          className="text-gray-400 hover:text-red-500"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2 border border-gray-200 rounded">
                          <button
                            onClick={() =>
                              updateQuantity(item.product.id, item.quantity - 1)
                            }
                            className="p-1 hover:bg-gray-50"
                          >
                            <Minus className="w-3 h-3 text-gray-600" />
                          </button>
                          <span className="w-6 text-center text-xs">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateQuantity(item.product.id, item.quantity + 1)
                            }
                            disabled={item.quantity >= maxStock}
                            className={`p-1 ${
                              item.quantity >= maxStock
                                ? "text-gray-300 cursor-not-allowed"
                                : "hover:bg-gray-50 text-gray-600"
                            }`}
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                        <span className="text-sm font-medium">
                          ${(item.product.sell_price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  );
                })}

                <div className="border border-gray-200 rounded p-3 bg-gray-50">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-medium text-gray-600">
                      Total:
                    </span>
                    <span className="text-base font-semibold text-gray-900">
                      ${getCartTotal().toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Desktop Cart Table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full border border-gray-200 text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="border-b border-gray-200 p-2 text-left text-xs font-medium text-gray-500">
                        Product
                      </th>
                      <th className="border-b border-gray-200 p-2 text-left text-xs font-medium text-gray-500">
                        Price
                      </th>
                      <th className="border-b border-gray-200 p-2 text-left text-xs font-medium text-gray-500">
                        Quantity
                      </th>
                      <th className="border-b border-gray-200 p-2 text-left text-xs font-medium text-gray-500">
                        Subtotal
                      </th>
                      <th className="border-b border-gray-200 p-2 text-left text-xs font-medium text-gray-500"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {cart.map((item) => {
                      const maxStock = item.product.stock;
                      return (
                        <tr
                          key={item.product.id}
                          className="border-b border-gray-100"
                        >
                          <td className="p-2 text-sm text-gray-800">
                            {item.product.name}
                          </td>
                          <td className="p-2 text-sm">
                            ${item.product.sell_price}
                          </td>
                          <td className="p-2">
                            <div className="flex items-center gap-1 border border-gray-200 rounded w-fit">
                              <button
                                onClick={() =>
                                  updateQuantity(
                                    item.product.id,
                                    item.quantity - 1,
                                  )
                                }
                                className="p-0.5 hover:bg-gray-50"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="w-6 text-center text-xs">
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
                                className={`p-0.5 ${
                                  item.quantity >= maxStock
                                    ? "text-gray-300 cursor-not-allowed"
                                    : "hover:bg-gray-50"
                                }`}
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                          </td>
                          <td className="p-2 text-sm font-medium">
                            $
                            {(item.product.sell_price * item.quantity).toFixed(2)}
                          </td>
                          <td className="p-2">
                            <button
                              onClick={() => removeFromCart(item.product.id)}
                              className="text-gray-400 hover:text-red-500"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                    <tr className="bg-gray-50">
                      <td
                        colSpan={3}
                        className="p-2 text-right text-xs font-medium text-gray-600"
                      >
                        Total:
                      </td>
                      <td className="p-2 text-sm font-bold text-gray-900">
                        ${getCartTotal().toFixed(2)}
                      </td>
                      <td></td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="border-t border-gray-200 my-4"></div>

              {/* Customer Information Form */}
              <div className="max-w-md mx-auto">
                <h3 className="text-sm font-semibold mb-3 text-gray-800">
                  Customer Details
                </h3>
                <form onSubmit={placeAllOrders} className="space-y-3">
                  <input
                    type="text"
                    placeholder="Your name"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    required
                    className="w-full p-2 border border-gray-200 rounded text-sm focus:outline-none focus:border-gray-400"
                  />
                  <input
                    type="tel"
                    placeholder="Phone number"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    required
                    className="w-full p-2 border border-gray-200 rounded text-sm focus:outline-none focus:border-gray-400"
                  />
                  <input
                    type="text"
                    placeholder="Location"
                    value={customerLocation}
                    onChange={(e) => setCustomerLocation(e.target.value)}
                    required
                    className="w-full p-2 border border-gray-200 rounded text-sm focus:outline-none focus:border-gray-400"
                  />
                  <button
                    type="submit"
                    disabled={cart.some(item => item.quantity > item.product.stock)}
                    className={`w-full py-2.5 text-sm font-medium rounded transition-colors ${
                      cart.some(item => item.quantity > item.product.stock)
                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                        : "bg-gray-800 text-white hover:bg-gray-700"
                    }`}
                  >
                    Place Order ({cart.length} items)
                  </button>
                </form>
              </div>
            </>
          )}
        </main>

        <Footer />
      </div>
    );
  }

  // Products view
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-4">
        {activeTab === "home" ? (
          <HomeView />
        ) : (
          <>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-800">Products</h2>
            </div>

            {/* Search and Filter Section */}
            <div className="mb-4 space-y-2">
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-4 py-2 border border-gray-200 rounded text-sm focus:outline-none focus:border-gray-400"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Filter Toggle for Mobile */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="md:hidden flex items-center gap-1 text-xs text-gray-600 border border-gray-200 rounded px-3 py-1.5"
              >
                <Filter className="w-3.5 h-3.5" />
                Filters
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform ${showFilters ? "rotate-180" : ""}`}
                />
              </button>

              {/* Filter Options */}
              <div
                className={`${showFilters ? "block" : "hidden"} md:block space-y-2 md:space-y-0 md:flex md:items-center md:gap-2`}
              >
                {/* Category Filter */}
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full md:w-auto px-3 py-2 border border-gray-200 rounded text-sm focus:outline-none focus:border-gray-400"
                >
                  <option value="all">All Categories</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>

                {/* Clear Filters Button */}
                {(searchQuery || selectedCategory !== "all") && (
                  <button
                    onClick={clearFilters}
                    className="text-xs text-gray-500 hover:text-gray-700 px-3 py-2 border border-gray-200 rounded"
                  >
                    Clear Filters
                  </button>
                )}
              </div>

              {/* Results Summary */}
              <div className="flex justify-between items-center text-xs text-gray-500">
                <span>{filteredProducts.length} products found</span>
                {(searchQuery || selectedCategory !== "all") && (
                  <span className="text-gray-400">
                    {filteredProducts.length === 0
                      ? "Try adjusting your filters"
                      : ""}
                  </span>
                )}
              </div>
            </div>

            {/* Product Grid - Mobile: 1 column, Desktop: multiple columns */}
            {filteredProducts.length === 0 ? (
              <div className="text-center py-8 border border-gray-200 rounded">
                <Package className="w-8 h-8 mx-auto text-gray-300 mb-2" />
                <p className="text-xs text-gray-400">No products found</p>
                <button
                  onClick={clearFilters}
                  className="mt-2 text-xs text-gray-500 hover:text-gray-700 underline"
                >
                  Clear filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {filteredProducts.map((product) => (
                  <div
                    key={product.id}
                    className="border border-gray-200 rounded overflow-hidden hover:shadow-sm transition-shadow"
                  >
                    <div className="aspect-square bg-gray-50 flex items-center justify-center relative group">
                      {product.image_url ? (
                        <img
                          src={product.image_url}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Package className="w-8 h-8 text-gray-300" />
                      )}

                      {/* View Details Overlay */}
                      <button
                        onClick={() => setSelectedProduct(product)}
                        className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100"
                      >
                        <span className="bg-white text-gray-800 text-xs px-3 py-1.5 rounded border border-gray-200 shadow-sm">
                          <Eye className="w-3.5 h-3.5 inline mr-1" />
                          View Details
                        </span>
                      </button>
                    </div>

                    <div className="p-3">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium text-sm text-gray-800 line-clamp-1">
                          {product.name}
                        </h3>
                        <button
                          onClick={() => setSelectedProduct(product)}
                          className="text-gray-400 hover:text-gray-600"
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
                        <span className="text-lg font-bold text-gray-900">
                          ${product.sell_price}
                        </span>
                        <span
                          className={`text-xs px-2 py-1 rounded ${
                            product.stock > 0
                              ? "bg-green-50 text-green-600"
                              : "bg-red-50 text-red-500"
                          }`}
                        >
                          {product.stock > 0 ? "In stock" : "Out of stock"}
                        </span>
                      </div>

                      <button
                        onClick={() => addToCart(product)}
                        disabled={product.stock === 0}
                        className={`w-full py-2 text-sm rounded font-medium transition-colors ${
                          product.stock > 0
                            ? "bg-gray-800 text-white hover:bg-gray-700"
                            : "bg-gray-100 text-gray-400 cursor-not-allowed"
                        }`}
                      >
                        Add to Cart
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

function App() {
  return <Store />;
}

export default App;