import { Package, ShoppingCart, Menu } from "lucide-react";

interface HeaderProps {
  activeTab: "home" | "products";
  cartCount: number;
  mobileMenuOpen: boolean;
  onTabChange: (tab: "home" | "products") => void;
  onCartClick: () => void;
  onMobileMenuToggle: () => void;
}

export function Header({
  activeTab,
  cartCount,
  mobileMenuOpen,
  onTabChange,
  onCartClick,
  onMobileMenuToggle,
}: HeaderProps) {
  return (
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
              onClick={() => onTabChange("home")}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                activeTab === "home"
                  ? "bg-[#0e71b4] text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              Accueil
            </button>
            <button
              onClick={() => onTabChange("products")}
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
              onClick={onCartClick}
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
              onClick={onMobileMenuToggle}
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
                  onTabChange("home");
                  onMobileMenuToggle();
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
                  onTabChange("products");
                  onMobileMenuToggle();
                }}
                className={`px-4 py-3 text-sm font-medium rounded-lg transition-colors text-left ${
                  activeTab === "products"
                    ? "bg-[#0e71b4] text-white"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                Boutique
              </button>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}