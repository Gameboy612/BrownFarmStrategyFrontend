import dynamic from 'next/dynamic';
const BlogIndexClient = dynamic(() => import('./index.client'), { ssr: false });

import { getAllBlogs } from '../../lib/blog';

export async function getStaticProps() {
  const blogs = getAllBlogs();
  return { props: { blogs } };
}

export default function BlogIndex(props) {
  return <BlogIndexClient {...props} />;
}
