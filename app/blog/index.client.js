"use client";
import { useMemo, useState } from 'react';
import Link from 'next/link';

export default function BlogIndex({ blogs, lang: initialLang }) {
  const [search, setSearch] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [lang, setLang] = useState(initialLang || 'zh-Hant');

  const filteredBlogs = useMemo(() => {
    return blogs.filter((post) => {
      // Only show blogs with this language
      if (!post.title[lang] || !post.summary[lang] || !post.content[lang]) return false;
      const matchesSearch =
        post.title[lang].toLowerCase().includes(search.toLowerCase()) ||
        post.summary[lang].toLowerCase().includes(search.toLowerCase()) ||
        post.content[lang].toLowerCase().includes(search.toLowerCase());
      const matchesTag = selectedTag ? post.tags?.includes(selectedTag) : true;
      return matchesSearch && matchesTag;
    });
  }, [blogs, search, selectedTag, lang]);

  const allTags = Array.from(new Set(blogs.flatMap((b) => b.tags)));

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Blog</h1>
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
        <select
          className="border px-2 py-1 text-sm ml-2"
          value={lang}
          onChange={(e) => setLang(e.target.value)}
        >
          <option value="zh-Hant">繁體中文</option>
          <option value="en">English</option>
          <option value="ja">日本語</option>
        </select>
      </div>
      <div className="flex flex-col gap-2">
        {filteredBlogs.map((post) => (
          <Link href={`/blog/${lang}/${post.slug}`} key={post.slug} className="flex border border-line bg-paper shadow-panel">
            {/* Left column: tag(s) */}
            <div className="flex flex-col items-center justify-center min-w-[80px] bg-panel border-r border-line p-2 text-center">
              {post.tags?.[0] && (
                <span className={`inline-block px-2 py-1 text-xs font-bold uppercase tracking-wider bg-secondary text-ink`}>
                  {post.tags[0]}
                </span>
              )}
            </div>
            {/* Main content */}
            <div className="flex-1 flex gap-4 p-4 items-center">
              {/* Thumbnail if available */}
              {post.coverImage && (
                <div className="w-28 h-16 flex-shrink-0 border border-line bg-white flex items-center justify-center overflow-hidden">
                  <img src={post.coverImage} alt="cover" className="object-cover w-full h-full" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  {/* Badges for tags */}
                  <Link href={`/blog/${lang}/${post.slug}`} className="text-lg font-semibold text-primary hover:underline truncate">
                    {post.title[lang]}
                  </Link>
                </div>
                <div className="text-sm text-ink/80 truncate">
                  {post.summary[lang]}
                </div>
              </div>
            </div>
            {/* Right column: author and date */}
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
            {/* Info column: view count*/}
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
