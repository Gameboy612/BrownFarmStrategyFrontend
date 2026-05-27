import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getAllBlogs } from '../../../../lib/blog-async';
import { PageFrame } from '../../../../components/PageFrame';

export async function generateStaticParams() {
  // Supported languages
  const langs = ['zh-Hant', 'en', 'ja'];
  const all = [];
  for (const lang of langs) {
    const blogs = await getAllBlogs(lang);
    for (const blog of blogs) {
      all.push({ lang, slug: blog.slug });
    }
  }
  return all;
}


export default async function Page({ params }) {
  const { lang, slug } = params;
  const blogs = await getAllBlogs(lang);
  const blog = blogs.find((b) => b.slug === slug);
  if (!blog || !blog.title[lang] || !blog.content[lang]) return notFound();

  return (
    <PageFrame currentPath={`/blog/${lang}/${slug}`}> 
      <div className="max-w-2xl mx-auto py-8 px-4">
        <Link href={`/blog`} className="text-primary hover:underline">← Back to Blog</Link>
        <h1 className="text-3xl font-bold mt-4 mb-2">{blog.title[lang]}</h1>
        <div className="mb-2 text-xs text-clay">{typeof blog.date === 'string' ? blog.date : new Date(blog.date).toLocaleDateString()}</div>
        <div className="mb-4 flex flex-wrap gap-2">
          {blog.tags?.map((tag) => (
            <span key={tag} className="border border-bronze bg-bronze/10 px-2 py-1 text-xs uppercase tracking-wider text-bronze">{tag}</span>
          ))}
        </div>
        <p className="text-sm text-ink/80 mb-2">{blog.summary[lang]}</p>
        <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: blog.html[lang] || '' }} />
      </div>
    </PageFrame>
  );
}
