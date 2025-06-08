'use client';

import { useParams } from 'next/navigation';
import { Star } from 'lucide-react';

export default function VendorReviewsPage() {
  const params = useParams<{ vendorId: string }>();
  const vendorId = params.vendorId;

  // ダミーデータ
  const vendorReview = {
    vendorName: 'ABC引越し',
    totalRating: 4.3,
    reviews: [
      {
        id: 1,
        priceSatisfaction: 4,
        workQuality: 5,
        responseQuality: 4,
        comment: '価格も手頃で、スタッフの対応がとても良かったです。'
      },
      {
        id: 2,
        priceSatisfaction: 3,
        workQuality: 4,
        responseQuality: 5,
        comment: '作業は丁寧でしたが、見積もり時の説明が少し足りなかったです。'
      }
    ]
  };

  return (
    <main className="bg-gray-50 text-gray-800 min-h-screen">
      <header className="bg-white shadow">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="text-xl font-bold text-gray-800">SyncWorks</div>
          <nav className="space-x-6 text-sm text-gray-700">
            <a href="/" className="hover:text-blue-600">ホーム</a>
          </nav>
        </div>
      </header>

      <section className="py-16 max-w-4xl mx-auto">
        {/* 総合評価 */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-10">
          <h2 className="text-3xl font-bold text-center mb-4">{vendorReview.vendorName}</h2>
          <div className="flex justify-center items-center space-x-2">
            <Star className="text-yellow-500 fill-yellow-500 w-10 h-10" />
            <p className="text-4xl font-bold text-yellow-500">{vendorReview.totalRating.toFixed(1)}</p>
          </div>
          <p className="text-center text-gray-600 mt-2">総合評価</p>
        </div>

        {/* 個別レビュー */}
        <div className="space-y-6">
          {vendorReview.reviews.map((review) => (
            <div key={review.id} className="bg-white rounded-lg shadow-md p-6">
              <div className="grid grid-cols-3 gap-4 mb-4 text-center">
                <div className="bg-gray-100 rounded-md p-2">
                  <p className="text-sm text-gray-500">価格満足</p>
                  <p className="text-lg font-semibold flex items-center justify-center">
                    <Star className="text-yellow-500 fill-yellow-500 w-5 h-5 mr-1" /> {review.priceSatisfaction}
                  </p>
                </div>
                <div className="bg-gray-100 rounded-md p-2">
                  <p className="text-sm text-gray-500">作業品質</p>
                  <p className="text-lg font-semibold flex items-center justify-center">
                    <Star className="text-yellow-500 fill-yellow-500 w-5 h-5 mr-1" /> {review.workQuality}
                  </p>
                </div>
                <div className="bg-gray-100 rounded-md p-2">
                  <p className="text-sm text-gray-500">応対品質</p>
                  <p className="text-lg font-semibold flex items-center justify-center">
                    <Star className="text-yellow-500 fill-yellow-500 w-5 h-5 mr-1" /> {review.responseQuality}
                  </p>
                </div>
              </div>
              <blockquote className="border-l-4 border-blue-500 pl-4 text-gray-700 italic">
                {review.comment}
              </blockquote>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
