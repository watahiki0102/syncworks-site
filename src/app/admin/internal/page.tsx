import { redirect } from 'next/navigation';

export default function InternalDashboardPage() {
  // お問い合わせ画面に直接リダイレクト
  redirect('/admin/internal/contacts?internal=1');
}
