import fs from 'fs';
import path from 'path';

const BLOGS_PATH = path.join(process.cwd(), 'data', 'blogs.json');

export function getAllBlogs() {
  const file = fs.readFileSync(BLOGS_PATH, 'utf-8');
  const blogs = JSON.parse(file);
  // Add slug for routing
  return blogs.map((blog) => ({
    ...blog,
    slug: blog.id,
  }));
}
