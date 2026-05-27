import fs from 'fs';
import path from 'path';

import { remark } from 'remark';
import html from 'remark-html';
import remarkGfm from 'remark-gfm';

const BLOGS_PATH = path.join(process.cwd(), 'public', 'blogs.json');

export async function getAllBlogs(lang) {
    const file = fs.readFileSync(BLOGS_PATH, 'utf-8');
    const blogs = JSON.parse(file);
    // Convert markdown to HTML for each blog, for all languages
    const blogsWithHtml = await Promise.all(
        blogs.map(async (blog) => {
            const htmlByLang = {};
            for (const l of Object.keys(blog.content)) {
                let htmlStr = (await remark().use(remarkGfm).use(html).process(blog.content[l] || '')).toString();
                htmlStr = htmlStr.replace(/\n/g, '<br>');
                htmlByLang[l] = htmlStr;
            }
            return {
                ...blog,
        slug: blog.id,
        html: htmlByLang,
    };
})
);
// If lang is specified, filter out blogs that don't have that language
  if (lang) {
    return blogsWithHtml.filter((b) => b.content[lang]);
  }
  return blogsWithHtml;
}
