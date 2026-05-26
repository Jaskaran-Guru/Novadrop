"use client";

import { useState, useEffect } from "react";
import { useCart } from "@/lib/store/cart";
import { formatPrice } from "@/lib/utils";
import { trackEvent } from "@/lib/utm";
import { ShoppingCart, Plus, Minus, Zap, Star, Check, Loader2, Heart, ThumbsUp, MessageSquare } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { toggleWishlistItem, checkIsInWishlist, submitProductReview, voteReviewHelpful } from "@/app/products/actions";

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  comparePrice: number | null;
  images: string[];
  category: string;
  inventory: number;
  variants: { id: string; name: string; value: string; price: number | null }[];
  reviews?: any[];
}

interface ProductDetailProps {
  product: Product;
  relatedProducts?: any[];
}

export function ProductDetail({ product, relatedProducts = [] }: ProductDetailProps) {
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [added, setAdded] = useState(false);
  const [buying, setBuying] = useState(false);
  
  // Wishlist
  const [inWishlist, setInWishlist] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  // Reviews
  const [reviews, setReviews] = useState<any[]>(product.reviews || []);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: "" });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewMsg, setReviewMsg] = useState("");

  // Recently Viewed
  const [recentlyViewed, setRecentlyViewed] = useState<any[]>([]);

  useEffect(() => {
    // Check wishlist status
    checkIsInWishlist(product.id).then(setInWishlist);

    // Save to recently viewed
    const stored = JSON.parse(localStorage.getItem("recently-viewed") || "[]");
    const filtered = stored.filter((p: any) => p.id !== product.id);
    const updated = [{
      id: product.id,
      name: product.name,
      slug: product.slug,
      price: product.price,
      images: product.images,
      category: product.category
    }, ...filtered].slice(0, 4);
    localStorage.setItem("recently-viewed", JSON.stringify(updated));

    // Load recently viewed for UI (excluding current product)
    setRecentlyViewed(updated.filter((p: any) => p.id !== product.id));
  }, [product]);

  const handleBuyNow = async () => {
    setBuying(true);
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: [{
            id: `${product.id}-${selectedVariant || "default"}`,
            productId: product.id,
            name: product.name,
            price: product.price,
            image: product.images[0] || "",
            quantity,
            variant: selectedVariant || undefined,
          }],
          customerEmail: "guest@example.com",
          customerName: "Guest User",
        }),
      });

      const data = await response.json();
      if (data.url) {
        // Direct mock success redirection in checkout API
        window.location.href = data.url;
      }
    } catch (error) {
      console.error("Buy now failed:", error);
    } finally {
      setBuying(false);
    }
  };

  const handleAddToCart = () => {
    addItem({
      id: `${product.id}-${selectedVariant || "default"}`,
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.images[0] || "",
      quantity,
      variant: selectedVariant || undefined,
    });

    trackEvent("add_to_cart", {
      productId: product.id,
      value: product.price * quantity,
    });

    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleToggleWishlist = async () => {
    setWishlistLoading(true);
    const res = await toggleWishlistItem(product.id);
    if (res.success) {
      setInWishlist(res.inWishlist || false);
    } else {
      alert(res.error || "Please login to use wishlist.");
    }
    setWishlistLoading(false);
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingReview(true);
    setReviewMsg("");

    const res = await submitProductReview(product.id, reviewForm.rating, reviewForm.comment);
    if (res.success && res.review) {
      setReviews([res.review, ...reviews]);
      setReviewForm({ rating: 5, comment: "" });
      setReviewMsg("Review submitted successfully! Checked for purchase verification.");
    } else {
      setReviewMsg("Failed to submit review.");
    }
    setSubmittingReview(false);
  };

  const handleHelpfulClick = async (reviewId: string) => {
    const res = await voteReviewHelpful(reviewId);
    if (res.success) {
      setReviews(reviews.map(r => r.id === reviewId ? { ...r, helpfulCount: r.helpfulCount + 1 } : r));
    }
  };

  const discount = product.comparePrice
    ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
    : null;

  // Compute rating average
  const ratingAvg = reviews.length > 0 
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  return (
    <div className="space-y-16">
      
      {/* Product Main Container */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Left Column - Gallery */}
        <div className="space-y-4">
          <div className="aspect-square glass rounded-2xl overflow-hidden relative">
            {product.images[selectedImage] ? (
              <Image src={product.images[selectedImage]} alt={product.name} fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover animate-fade-in" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Zap className="w-20 h-20 text-purple-400/20" />
              </div>
            )}
            {discount && (
              <div className="absolute top-4 left-4 bg-red-500 text-white text-xs font-black tracking-widest px-3 py-1 rounded-lg uppercase">
                Sale -{discount}%
              </div>
            )}
          </div>
          {product.images.length > 1 && (
            <div className="flex gap-3">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-all shrink-0 ${
                    i === selectedImage ? "border-purple-500" : "border-transparent glass"
                  }`}
                >
                  <Image src={img} alt="" width={64} height={64} className="object-cover w-full h-full" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column - Info */}
        <div className="space-y-6 pt-2">
          <div>
            <p className="text-xs text-purple-400 uppercase tracking-widest font-black mb-2">{product.category}</p>
            <h1 className="text-3xl font-black text-white leading-tight">{product.name}</h1>
            
            {/* Rating summary */}
            <div className="flex items-center gap-2 mt-3">
              <div className="flex items-center gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`w-4 h-4 ${ratingAvg && Number(ratingAvg) > i ? "fill-amber-400 text-amber-400" : "text-gray-700"}`} />
                ))}
              </div>
              <span className="text-xs text-gray-500 font-bold">
                {ratingAvg ? `${ratingAvg}/5 (${reviews.length} reviews)` : "No ratings yet"}
              </span>
            </div>

            <div className="flex items-baseline gap-4 mt-4">
              <span className="text-4xl font-black gradient-text">₹{product.price}</span>
              {product.comparePrice && (
                <span className="text-xl text-gray-500 line-through">₹{product.comparePrice}</span>
              )}
            </div>
          </div>

          <p className="text-gray-400 text-sm leading-relaxed border-t border-white/5 pt-4">{product.description}</p>

          {/* Variants */}
          {product.variants.length > 0 && (
            <div className="border-t border-white/5 pt-4">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Select Option</p>
              <div className="flex flex-wrap gap-2">
                {product.variants.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => setSelectedVariant(v.value)}
                    className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase transition-all ${
                      selectedVariant === v.value
                        ? "bg-purple-600 text-white border border-purple-500"
                        : "glass text-gray-400 hover:text-white border border-transparent"
                    }`}
                  >
                    {v.value}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity selector */}
          <div className="flex items-center gap-4 border-t border-white/5 pt-4">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Quantity</p>
            <div className="flex items-center glass rounded-xl border border-white/5">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="p-3 hover:text-purple-400 transition-colors"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="px-4 font-bold text-sm">{quantity}</span>
              <button
                onClick={() => setQuantity(Math.min(product.inventory, quantity + 1))}
                className="p-3 hover:text-purple-400 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
            <span className="text-xs text-gray-500 font-bold">{product.inventory} in stock</span>
          </div>

          {/* Actions */}
          <div className="flex gap-3 border-t border-white/5 pt-6">
            <button
              onClick={handleAddToCart}
              disabled={product.inventory === 0 || added}
              className={`flex-grow flex items-center justify-center gap-2 font-bold py-4 rounded-xl transition-all duration-200 border ${
                added
                  ? "bg-green-600 border-green-500 text-white"
                  : product.inventory === 0
                  ? "bg-gray-700 border-gray-600 text-gray-500 cursor-not-allowed"
                  : "bg-white/5 border-white/10 hover:bg-white/10 text-white"
              }`}
            >
              {added ? (
                <><Check className="w-4 h-4" /> Added!</>
              ) : (
                <><ShoppingCart className="w-4 h-4" /> Add to Cart</>
              )}
            </button>

            {/* Wishlist toggle */}
            <button
              onClick={handleToggleWishlist}
              disabled={wishlistLoading}
              className={`px-4 rounded-xl border transition-all flex items-center justify-center ${
                inWishlist 
                  ? "bg-pink-600/10 border-pink-500/30 text-pink-500" 
                  : "glass border-white/10 text-gray-400 hover:text-white"
              }`}
            >
              <Heart className={`w-5 h-5 ${inWishlist ? "fill-pink-500" : ""}`} />
            </button>
          </div>

          <button
            onClick={handleBuyNow}
            disabled={product.inventory === 0 || buying}
            className="w-full flex items-center justify-center gap-2 font-black py-4 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white shadow-lg shadow-purple-500/20 transition-all hover-lift pulse-glow disabled:opacity-50"
          >
            {buying ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Placing Order...</>
            ) : (
              <><Zap className="w-4 h-4 fill-white" /> Instantly Place Order</>
            )}
          </button>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="border-t border-white/5 pt-12">
        <h2 className="text-2xl font-black mb-8 flex items-center gap-2">
          <MessageSquare className="text-purple-400 w-6 h-6" /> Customer Reviews
        </h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Review form */}
          <div className="lg:col-span-1 glass rounded-3xl p-6 border border-white/5 h-fit">
            <h3 className="font-bold text-md mb-4 text-white">Write a Review</h3>
            {reviewMsg && (
              <div className="bg-purple-950/20 border border-purple-500/30 text-purple-300 rounded-xl p-3 text-xs mb-4">
                {reviewMsg}
              </div>
            )}
            <form onSubmit={handleReviewSubmit} className="space-y-4">
              <div>
                <label className="block text-xs text-gray-400 font-bold uppercase mb-2">Rating</label>
                <div className="flex gap-1.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                      className="p-1 transition-transform hover:scale-110"
                    >
                      <Star className={`w-6 h-6 ${reviewForm.rating >= star ? "fill-amber-400 text-amber-400" : "text-gray-700"}`} />
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-400 font-bold uppercase mb-2">Review Comment</label>
                <textarea
                  rows={4}
                  required
                  value={reviewForm.comment}
                  onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                  placeholder="Share your experience with this product..."
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-purple-500 resize-none"
                />
              </div>
              <button
                type="submit"
                disabled={submittingReview}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 rounded-xl transition-all"
              >
                {submittingReview ? "Submitting..." : "Submit Review"}
              </button>
            </form>
          </div>

          {/* Reviews list */}
          <div className="lg:col-span-2 space-y-4">
            {reviews.length === 0 ? (
              <div className="glass rounded-2xl p-12 text-center text-gray-500 border border-white/5">
                No reviews yet. Be the first to share your feedback!
              </div>
            ) : (
              reviews.map((rev) => (
                <div key={rev.id} className="glass rounded-2xl p-6 border border-white/5 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-bold text-sm text-white">{rev.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex gap-0.5">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`w-3.5 h-3.5 ${rev.rating > i ? "fill-amber-400 text-amber-400" : "text-gray-800"}`} />
                          ))}
                        </div>
                        <span className="text-[10px] text-gray-500">
                          {new Date(rev.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    {rev.verified && (
                      <span className="bg-green-500/20 border border-green-500/30 text-green-400 text-[9px] uppercase font-black px-2 py-0.5 rounded-lg">
                        Verified Purchase
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-300 leading-relaxed">{rev.comment}</p>
                  
                  <button
                    onClick={() => handleHelpfulClick(rev.id)}
                    className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-white transition-colors pt-2"
                  >
                    <ThumbsUp className="w-3.5 h-3.5" /> Helpful ({rev.helpfulCount})
                  </button>
                </div>
              ))
            )}
          </div>

        </div>
      </div>

      {/* AI Recommendations / Related Products */}
      {relatedProducts.length > 0 && (
        <div className="border-t border-white/5 pt-12">
          <h2 className="text-xl font-black mb-6 uppercase tracking-wider text-white">Recommended Products</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {relatedProducts.map((p) => (
              <Link key={p.id} href={`/products/${p.slug}`}>
                <div className="glass rounded-2xl overflow-hidden hover-lift border border-white/5 h-full flex flex-col group">
                  <div className="aspect-square bg-purple-900/10 relative overflow-hidden shrink-0">
                    {p.images?.[0] ? (
                      <Image src={p.images[0]} alt="" fill sizes="160px" className="object-cover group-hover:scale-105 transition-transform duration-300" />
                    ) : (
                      <Zap className="w-8 h-8 text-purple-400/20 absolute inset-0 m-auto" />
                    )}
                  </div>
                  <div className="p-3 flex-grow flex flex-col justify-between">
                    <p className="text-[9px] font-bold text-purple-400 uppercase tracking-widest">{p.category}</p>
                    <h3 className="text-xs font-bold text-white line-clamp-2 mt-1 flex-grow">{p.name}</h3>
                    <p className="text-xs font-black gradient-text mt-2">₹{p.price}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Recently Viewed Products */}
      {recentlyViewed.length > 0 && (
        <div className="border-t border-white/5 pt-12">
          <h2 className="text-xl font-black mb-6 uppercase tracking-wider text-white">Recently Viewed</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {recentlyViewed.map((p) => (
              <Link key={p.id} href={`/products/${p.slug}`}>
                <div className="glass rounded-2xl overflow-hidden hover-lift border border-white/5 h-full flex flex-col group">
                  <div className="aspect-square bg-purple-900/10 relative overflow-hidden shrink-0">
                    {p.images?.[0] ? (
                      <Image src={p.images[0]} alt="" fill sizes="160px" className="object-cover group-hover:scale-105 transition-transform duration-300" />
                    ) : (
                      <Zap className="w-8 h-8 text-purple-400/20 absolute inset-0 m-auto" />
                    )}
                  </div>
                  <div className="p-3 flex-grow flex flex-col justify-between">
                    <p className="text-[9px] font-bold text-purple-400 uppercase tracking-widest">{p.category}</p>
                    <h3 className="text-xs font-bold text-white line-clamp-2 mt-1 flex-grow">{p.name}</h3>
                    <p className="text-xs font-black gradient-text mt-2">₹{p.price}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
