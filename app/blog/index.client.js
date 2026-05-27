"use client";
import { useMemo, useState, useEffect } from 'react';
import Link from 'next/link';
import { useLocale } from '../../components/IntlProvider.client';

export default function BlogIndex() {
  const { t, locale } = useLocale();
  const [search, setSearch] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [localBlogs, setLocalBlogs] = useState([]);
  useEffect(() => {
    console.log('Fetching blogs.json for locale:', locale);
    fetch('/blogs.json')
    .then((r) => r.json())
    .then((data) => {
        const normalized = data.map((b) => ({
        ...b,
        slug: b.id || b.slug,
        content: Object.fromEntries(
            // Object.entries(b.content || {}).map(([k, v]) => [k, v ? v.replace(/\n/g, '<br>') : ''])
            Object.entries(b.content || {}).map(([k, v]) => [k, v ? v : ''])
        ),
        title: b.title || {},
        summary: b.summary || {},
        }));
        console.log(normalized)
        setLocalBlogs(normalized);
    })
  }, [locale]);

  const filteredBlogs = useMemo(() => {
    const source = localBlogs;
    return source.filter((post) => {
      if (!post.title?.[locale] || !post.content?.[locale]) return false;
      const matchesSearch =
        (post.title[locale] || '').toLowerCase().includes(search.toLowerCase()) ||
        (post.summary?.[locale] || '').toLowerCase().includes(search.toLowerCase()) ||
        (post.content[locale] || '').toLowerCase().includes(search.toLowerCase());
      const matchesTag = selectedTag ? post.tags?.includes(selectedTag) : true;
      return matchesSearch && matchesTag;
    });
  }, [search, selectedTag, locale, localBlogs]);

  const allTags = Array.from(new Set((localBlogs).flatMap((b) => b.tags || [])));

  return (
    <div className="space-y-8">
      <div className="flex gap-2 mb-4 items-center">
        <input
          type="text"
          placeholder="搜尋/搜索/SEARCH..."
          className="border px-2 py-1 text-sm w-64"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="border px-2 py-1 text-sm"
          value={selectedTag}
          onChange={(e) => setSelectedTag(e.target.value)}
        >
          <option value="">全部標籤/ALL TAGS</option>
          {allTags.map((tag) => (
            <option key={tag} value={tag}>{tag}</option>
          ))}
        </select>
      </div>
      <div className="flex flex-col gap-2">
        {filteredBlogs.map((post) => (
          <Link href={`/blog/${locale}/${post.slug}`} key={post.slug} className="flex border border-line bg-paper shadow-panel">
            <div className="flex flex-col items-center justify-center min-w-[80px] bg-panel border-r border-line p-2 text-center">
              {post.tags?.[0] && (
                <span className={`inline-block px-2 py-1 text-xs font-bold uppercase tracking-wider bg-secondary text-ink`}>
                  {post.tags[0]}
                </span>
              )}
            </div>
            <div className="flex-1 flex gap-4 p-4 items-center">
              {post.img && post.img[locale] && (
                <div className="h-[4rem] w-[6rem] flex-shrink-0 border border-line bg-white flex items-center justify-center overflow-hidden">
                  <img src={post.img[locale]} alt="cover" className="object-cover w-full h-full" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-lg font-semibold text-primary hover:underline truncate">
                    {post.title[locale]}
                  </p>
                </div>
                <div className="text-sm text-gray-500 truncate text-wrap">
                  {post.summary[locale] || (post.content[locale] || '').slice(0, 100) + '...'}
                </div>
              </div>
            </div>
            <div className="flex flex-col items-center justify-center min-w-[80px] border-l border-line p-2 text-center">
                <span className="inline-block px-2 py-1 text-xs font-bold uppercase tracking-wider">
                    {typeof post.date === 'string' ? post.date : new Date(post.date).toLocaleDateString()}
                </span>
              {post.author && (
                <span className="inline-block px-2 py-1 text-xs font-bold uppercase tracking-wider">
                  {post.author}
                </span>
              )}
            </div>
            <div className="flex flex-col items-center justify-center min-w-[80px] p-2 text-center bg-panel">
              <span className="inline-block px-2 py-1 text-xs font-bold uppercase tracking-wider">
                {post.views ? `${post.views} views` : 'No views'}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
