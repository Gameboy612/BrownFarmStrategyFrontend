import { redirect } from 'next/navigation';

export default function Page() {
  // Always redirect to default language
  redirect('/blog/zh-Hant');
}
