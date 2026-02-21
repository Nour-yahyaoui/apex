import { Package, Eye } from "lucide-react";
import type { Product } from "../lib/db";

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  onViewDetails: (product: Product) => void;
  variant?: "default" | "compact";
}

export function ProductCard({ 
  product, 
  onAddToCart, 
  onViewDetails,
  variant = "default" 
}: ProductCardProps) {
  if (variant === "compact") {
    return (
      <div className="group bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-all hover:-translate-y-0.5">
        <div className="aspect-square bg-gray-50 relative">
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Package className="w-8 h-8 text-gray-300" />
            </div>
          )}
          <button
            onClick={() => onViewDetails(product)}
            className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
          >
            <span className="bg-white text-gray-900 text-[10px] px-2 py-1 rounded shadow-lg flex items-center gap-0.5">
              <Eye className="w-3 h-3" />
              Aperçu
            </span>
          </button>
        </div>
        <div className="p-2">
          <h3 className="font-medium text-xs text-gray-900 mb-0.5 line-clamp-1">
            {product.name}
          </h3>
          <p className="text-[10px] text-gray-400 mb-1.5 line-clamp-1">
            {product.category || "Non catégorisé"}
          </p>
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-gray-900">
              {product.sell_price} <span className="text-[8px] font-normal">TND</span>
            </span>
            <button
              onClick={() => onAddToCart(product)}
              disabled={product.stock === 0}
              className={`px-2 py-0.5 text-[10px] rounded font-medium transition-colors ${
                product.stock > 0
                  ? "bg-[#0e71b4] text-white hover:bg-[#1192e8]"
                  : "bg-gray-100 text-gray-400 cursor-not-allowed"
              }`}
            >
              {product.stock > 0 ? "+" : "×"}
            </button>
          </div>
          {product.stock <= 5 && product.stock > 0 && (
            <p className="text-[8px] text-orange-500 mt-1">
              Plus que {product.stock}!
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
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
            <Package className="w-12 h-12 text-gray-300" />
          </div>
        )}
        <button
          onClick={() => onViewDetails(product)}
          className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
        >
          <span className="bg-white text-gray-900 text-xs px-3 py-1.5 rounded-lg shadow-lg flex items-center gap-1">
            <Eye className="w-3.5 h-3.5" />
            Aperçu
          </span>
        </button>
      </div>
      <div className="p-3">
        <h3 className="font-medium text-sm text-gray-900 mb-1 line-clamp-1">
          {product.name}
        </h3>
        <p className="text-xs text-gray-400 mb-2 line-clamp-1">
          {product.category || "Non catégorisé"}
        </p>
        <div className="flex items-center justify-between">
          <span className="text-base font-bold text-gray-900">
            {product.sell_price} <span className="text-xs font-normal">TND</span>
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
        {product.stock <= 5 && product.stock > 0 && (
          <p className="text-[10px] text-orange-500 mt-1">
            Plus que {product.stock} en stock!
          </p>
        )}
      </div>
    </div>
  );
}

// Loading Skeleton Component - More compact version
export function ProductSkeleton() {
  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden animate-pulse">
      <div className="aspect-square bg-gray-200"></div>
      <div className="p-2">
        <div className="h-3 bg-gray-200 rounded w-3/4 mb-1"></div>
        <div className="h-2 bg-gray-200 rounded w-1/2 mb-2"></div>
        <div className="flex justify-between items-center">
          <div className="h-4 bg-gray-200 rounded w-12"></div>
          <div className="h-5 bg-gray-200 rounded w-10"></div>
        </div>
      </div>
    </div>
  );
}