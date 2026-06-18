'use client';

import { useState, useMemo } from 'react';
import Button from '@/components/ui/Button';

interface Variant {
  id: string;
  name: string;
  sku: string;
  price: number | string | null;
  stock: number;
  options: Record<string, string>;
}

interface AddToCartSectionProps {
  productId: string;
  variants: Variant[];
  defaultStock: number;
  basePrice?: number;
}

export default function AddToCartSection({ productId, variants, defaultStock, basePrice }: AddToCartSectionProps) {
  // Extract all option keys and their unique values
  const optionKeys = useMemo(() => {
    if (variants.length === 0) return [];
    const keys = new Set<string>();
    variants.forEach(v => {
      if (v.options) Object.keys(v.options).forEach(k => keys.add(k));
    });
    return Array.from(keys);
  }, [variants]);

  // Initialize selected options from first variant
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>(() => {
    if (variants.length === 0) return {};
    const first = variants[0];
    const opts: Record<string, string> = {};
    optionKeys.forEach(k => { opts[k] = (first.options as Record<string, string>)?.[k] || ''; });
    return opts;
  });
  const [quantity, setQuantity] = useState(1);

  // Find the matching variant based on all selected options
  const current = useMemo(() => {
    return variants.find(v => {
      const opts = v.options as Record<string, string>;
      return optionKeys.every(k => opts[k] === selectedOptions[k]);
    });
  }, [variants, selectedOptions, optionKeys]);

  // Get unique values per option key
  const optionValues = useMemo(() => {
    const map: Record<string, string[]> = {};
    optionKeys.forEach(key => {
      const vals = new Set<string>();
      variants.forEach(v => {
        const val = (v.options as Record<string, string>)?.[key];
        if (val) vals.add(val);
      });
      map[key] = Array.from(vals);
    });
    return map;
  }, [variants, optionKeys]);

  // Check if a specific option value is available given other selections
  const isOptionAvailable = (key: string, value: string) => {
    return variants.some(v => {
      const opts = v.options as Record<string, string>;
      if (opts[key] !== value) return false;
      return optionKeys.every(k => k === key || !selectedOptions[k] || opts[k] === selectedOptions[k]);
    });
  };

  const stock = current?.stock ?? defaultStock;
  const displayPrice = current?.price ? Number(current.price) : basePrice;

  const stockStatus = stock > 10
    ? { text: 'In Stock', color: 'text-green-600' }
    : stock > 0
    ? { text: `Only ${stock} left in stock - order soon.`, color: 'text-orange-600' }
    : { text: 'Currently unavailable', color: 'text-red-600' };

  const handleSelectOption = (key: string, value: string) => {
    const next = { ...selectedOptions, [key]: value };
    // Try to find an exact match; if not, find closest
    const exactMatch = variants.find(v => {
      const opts = v.options as Record<string, string>;
      return optionKeys.every(k => opts[k] === next[k]);
    });
    if (exactMatch) {
      setSelectedOptions(next);
    } else {
      // Find a variant that at least matches the new key
      const partial = variants.find(v => (v.options as Record<string, string>)?.[key] === value);
      if (partial) {
        const newOpts: Record<string, string> = {};
        optionKeys.forEach(k => { newOpts[k] = (partial.options as Record<string, string>)?.[k] || ''; });
        setSelectedOptions(newOpts);
      }
    }
    setQuantity(1);
  };

  const handleAddToCart = async () => {
    console.log('Add to cart:', { productId, variantId: current?.id, quantity });
  };

  const handleBuyNow = async () => {
    console.log('Buy now:', { productId, variantId: current?.id, quantity });
  };

  return (
    <div className="space-y-4">
      {/* Variant option matrix */}
      {optionKeys.map(key => {
        const values = optionValues[key] || [];

        if (key.toLowerCase() === 'color') {
          return (
            <div key={key}>
              <span className="text-sm font-medium">{key}: <span className="font-normal">{selectedOptions[key]}</span></span>
              <div className="flex gap-2 mt-1 flex-wrap">
                {values.map(val => {
                  const isSelected = selectedOptions[key] === val;
                  const available = isOptionAvailable(key, val);
                  return (
                    <button
                      key={val}
                      onClick={() => handleSelectOption(key, val)}
                      disabled={!available}
                      className={`w-8 h-8 rounded-full border-2 transition-all ${
                        isSelected ? 'border-amazon-orange ring-2 ring-amazon-orange' : 'border-gray-300'
                      } ${!available ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer hover:scale-110'}`}
                      style={{ backgroundColor: val.toLowerCase() }}
                      title={val}
                    />
                  );
                })}
              </div>
            </div>
          );
        }

        return (
          <div key={key}>
            <span className="text-sm font-medium">{key}: </span>
            <div className="flex gap-2 mt-1 flex-wrap">
              {values.map(val => {
                const isSelected = selectedOptions[key] === val;
                const available = isOptionAvailable(key, val);
                // Find variant price for this option
                const variantForPrice = variants.find(v => (v.options as Record<string, string>)?.[key] === val);
                const varPrice = variantForPrice?.price ? Number(variantForPrice.price) : null;

                return (
                  <button
                    key={val}
                    onClick={() => handleSelectOption(key, val)}
                    disabled={!available}
                    className={`px-3 py-2 border rounded-lg text-sm transition-all ${
                      isSelected
                        ? 'border-amazon-orange bg-orange-50 ring-1 ring-amazon-orange font-semibold'
                        : 'border-gray-300 hover:border-gray-400'
                    } ${!available ? 'opacity-40 cursor-not-allowed line-through' : 'cursor-pointer'}`}
                  >
                    <span>{val}</span>
                    {varPrice && (
                      <span className="block text-xs text-gray-500">${varPrice.toFixed(2)}</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* Selected variant info */}
      {current && (
        <div className="bg-gray-50 rounded-lg p-3 text-sm space-y-1">
          {displayPrice && (
            <p className="text-lg font-bold text-red-700">${displayPrice.toFixed(2)}</p>
          )}
          <p className="text-gray-500">SKU: {current.sku}</p>
        </div>
      )}

      {/* Stock */}
      <p className={`font-medium ${stockStatus.color}`}>{stockStatus.text}</p>

      {/* Quantity */}
      {stock > 0 && (
        <>
          <div className="flex items-center gap-2">
            <label className="text-sm">Qty:</label>
            <select
              value={quantity}
              onChange={e => setQuantity(Number(e.target.value))}
              className="border rounded px-2 py-1 text-sm"
            >
              {Array.from({ length: Math.min(10, stock) }, (_, i) => i + 1).map(n => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </div>

          <Button
            onClick={handleAddToCart}
            className="w-full bg-amazon-orange hover:bg-amazon-orange/90 text-white font-bold py-3 rounded-full text-base"
          >
            Add to Cart
          </Button>

          <Button
            onClick={handleBuyNow}
            className="w-full bg-amazon-yellow hover:bg-amazon-yellow/90 text-amazon-dark font-bold py-3 rounded-full text-base"
          >
            Buy Now
          </Button>
        </>
      )}
    </div>
  );
}
