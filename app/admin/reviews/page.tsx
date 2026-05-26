export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { Star, CheckCircle2, MessageSquare } from "lucide-react";
import { ReviewActions } from "./ReviewActions";

async function getReviews() {
  try {
    return await prisma.review.findMany({
      include: {
        product: { select: { name: true } },
        user: { select: { name: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    });
  } catch {
    return [
      {
        id: "mock_r1",
        productId: "p1",
        product: { name: "Premium Wireless Earbuds Pro" },
        userId: "u1",
        user: { name: "Rahul S.", email: "rahul@example.com" },
        name: "Rahul S.",
        rating: 5,
        comment: "Absolutely love these earbuds! Crystal clear sound and amazing battery life. Worth every rupee.",
        verified: true,
        helpfulCount: 12,
        active: true,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3),
        updatedAt: new Date(),
      },
      {
        id: "mock_r2",
        productId: "p2",
        product: { name: "Minimalist Leather Wallet" },
        userId: null,
        user: null,
        name: "Anonymous User",
        rating: 2,
        comment: "Stitching came apart after two weeks. Very disappointed with the quality for this price.",
        verified: false,
        helpfulCount: 3,
        active: true,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 8),
        updatedAt: new Date(),
      },
      {
        id: "mock_r3",
        productId: "p3",
        product: { name: "Smart Fitness Tracker Band" },
        userId: "u3",
        user: { name: "Priya M.", email: "priya@example.com" },
        name: "Priya M.",
        rating: 4,
        comment: "Great tracker for the price. Accurate steps and heart rate. Sleep tracking could be better.",
        verified: true,
        helpfulCount: 7,
        active: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
        updatedAt: new Date(),
      },
      {
        id: "mock_r4",
        productId: "p1",
        product: { name: "Premium Wireless Earbuds Pro" },
        userId: "u4",
        user: { name: "Deepak R.", email: "deepak@example.com" },
        name: "Deepak R.",
        rating: 1,
        comment: "Stopped working after 3 days. Terrible experience. Requesting a full refund.",
        verified: true,
        helpfulCount: 18,
        active: true,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48),
        updatedAt: new Date(),
      },
    ];
  }
}

export default async function AdminReviewsPage() {
  const reviews = await getReviews();

  const activeCount  = reviews.filter((r: any) => r.active).length;
  const hiddenCount  = reviews.filter((r: any) => !r.active).length;
  const avgRating    =
    reviews.length > 0
      ? (reviews.reduce((s: number, r: any) => s + r.rating, 0) / reviews.length).toFixed(1)
      : "—";
  const lowRatings   = reviews.filter((r: any) => r.rating <= 2).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black mb-1">Reviews</h1>
        <p className="text-gray-500">{reviews.length} total reviews · moderate user-submitted feedback</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Avg. Rating",    value: avgRating,   sub: "out of 5",        color: "text-amber-400" },
          { label: "Published",      value: activeCount, sub: "visible reviews",  color: "text-green-400" },
          { label: "Hidden",         value: hiddenCount, sub: "not visible",      color: "text-orange-400" },
          { label: "Critical (≤2★)", value: lowRatings,  sub: "need attention",   color: "text-red-400" },
        ].map(({ label, value, sub, color }) => (
          <div key={label} className="glass rounded-2xl p-5">
            <p className={`text-3xl font-black ${color}`}>{value}</p>
            <p className="text-sm font-semibold mt-1">{label}</p>
            <p className="text-xs text-gray-500">{sub}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      {reviews.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center">
          <MessageSquare className="w-12 h-12 text-purple-400/30 mx-auto mb-4" />
          <p className="text-gray-500">No reviews yet.</p>
        </div>
      ) : (
        <div className="glass rounded-2xl overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/5">
                <th className="px-6 py-4 text-xs text-gray-500 uppercase tracking-wider">Reviewer</th>
                <th className="px-6 py-4 text-xs text-gray-500 uppercase tracking-wider">Product</th>
                <th className="px-6 py-4 text-xs text-gray-500 uppercase tracking-wider">Rating</th>
                <th className="px-6 py-4 text-xs text-gray-500 uppercase tracking-wider">Comment</th>
                <th className="px-6 py-4 text-xs text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs text-gray-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {reviews.map((review: any) => (
                <tr key={review.id} className="hover:bg-white/2 transition-colors group">
                  {/* Reviewer */}
                  <td className="px-6 py-4">
                    <p className="text-sm font-medium">{review.name}</p>
                    {review.user?.email && (
                      <p className="text-xs text-gray-500 truncate max-w-[140px]">{review.user.email}</p>
                    )}
                    {review.verified && (
                      <span className="inline-flex items-center gap-0.5 text-[10px] text-green-400 mt-0.5">
                        <CheckCircle2 className="w-2.5 h-2.5" /> Verified buyer
                      </span>
                    )}
                  </td>

                  {/* Product */}
                  <td className="px-6 py-4">
                    <p className="text-sm text-gray-300 max-w-[160px] truncate">{review.product?.name}</p>
                    {review.id.startsWith("mock_") && (
                      <span className="text-[9px] px-1.5 py-0.5 bg-purple-500/20 text-purple-400 font-bold rounded uppercase">
                        Demo
                      </span>
                    )}
                  </td>

                  {/* Rating */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3 h-3 ${
                            i < review.rating
                              ? "text-amber-400 fill-amber-400"
                              : "text-gray-700"
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-[10px] text-gray-600 mt-1">
                      {review.helpfulCount} found helpful
                    </p>
                  </td>

                  {/* Comment */}
                  <td className="px-6 py-4 max-w-[240px]">
                    <p className="text-sm text-gray-300 line-clamp-2">{review.comment}</p>
                    <p className="text-[10px] text-gray-600 mt-1">
                      {new Date(review.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric", month: "short", year: "numeric",
                      })}
                    </p>
                  </td>

                  {/* Status */}
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 rounded-lg text-xs font-bold ${
                        review.active
                          ? "bg-green-500/20 text-green-400"
                          : "bg-orange-500/20 text-orange-400"
                      }`}
                    >
                      {review.active ? "Published" : "Hidden"}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4 text-right">
                    <ReviewActions reviewId={review.id} currentActive={review.active} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
