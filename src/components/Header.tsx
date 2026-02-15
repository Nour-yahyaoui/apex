// components/Header.tsx
import { Package, ShoppingCart } from 'lucide-react';

interface HeaderProps {
  cartCount: number;
  onCartClick?: () => void;
}

export default function Header({ cartCount, onCartClick }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 px-4 py-2.5">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Package className="w-5 h-5 text-gray-700" />
          <h1 className="text-lg font-semibold text-gray-800">Shop</h1>
        </div>
        
        <button 
          onClick={onCartClick}
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
    </header>
  );
}