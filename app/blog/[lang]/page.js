import dynamic from 'next/dynamic';
const BlogIndexClient = dynamic(() => import('../index.client'), { ssr: false });
import { getAllBlogs } from '../../../lib/blog-async';
import { PageFrame } from '../../../components/PageFrame';

export async function generateStaticParams() {
  // Supported languages
  return [
    { lang: 'zh-Hant' },
    { lang: 'en' },
    { lang: 'ja' }
  ];
}

export default async function Page({ params }) {
  const lang = params.lang;
  const blogs = await getAllBlogs(lang);
  return (
    <PageFrame currentPath={`/blog/${lang}`}>
      <BlogIndexClient blogs={blogs} lang={lang} />
    </PageFrame>
  );
}
