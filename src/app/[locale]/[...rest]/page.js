import { notFound } from 'next/navigation';

// هر نشانی ناشناخته زیر زبان، به صفحه ۴۰۴ می‌رود
export default function CatchAllPage() {
  notFound();
}