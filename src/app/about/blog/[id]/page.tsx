import { blogs } from '@/lib/blogs';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, ArrowUpRight, Clock, Tag, User } from 'lucide-react';
import PublicHeader from "@/components/PublicHeader";
import PublicFooter from "@/components/PublicFooter";

const categoryColours: Record<string, string> = {
  'Investing Basics':   'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  'Market Insights':    'bg-blue-100   text-blue-700   dark:bg-blue-900/40   dark:text-blue-300',
  'Real Estate':        'bg-amber-100  text-amber-700  dark:bg-amber-900/40  dark:text-amber-300',
  'Teams Global':       'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300',
  'Compliance':         'bg-rose-100   text-rose-700   dark:bg-rose-900/40   dark:text-rose-300',
  'Financial Planning': 'bg-teal-100   text-teal-700   dark:bg-teal-900/40   dark:text-teal-300',
};

export function generateStaticParams() {
  return blogs.map((b) => ({ id: b.id }));
}

export function generateMetadata({ params }: { params: { id: string } }) {
  const blog = blogs.find((b) => b.id === params.id);
  if (!blog) return {};
  return {
    title: `${blog.title} | Ludeva Blog`,
    description: blog.excerpt,
  };
}

export default function BlogPost({ params }: { params: { id: string } }) {
  const blog = blogs.find((b) => b.id === params.id);
  if (!blog) return notFound();

  const related = blogs.filter((b) => b.id !== blog.id).slice(0, 3);
  const categoryColour = categoryColours[blog.category] ?? 'bg-gray-100 text-gray-600';

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <PublicHeader />
      
      {/* ── HERO IMAGE + TITLE ── */}
      <div className="relative w-full h-[50vh] md:h-[60vh] overflow-hidden">
        <Image
          src={blog.image}
          alt={blog.title}
          fill
          className="object-cover"
          priority
        />
        {/* Deep gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/10" />

        {/* Back link */}
        <div className="absolute top-6 left-6">
          <Link
            href="/about/blog"
            className="inline-flex items-center gap-2 text-white/80 hover:text-white text-sm font-medium bg-black/30 backdrop-blur-sm px-4 py-2 rounded-full transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> All articles
          </Link>
        </div>

        {/* Title block */}
        <div className="absolute bottom-0 left-0 right-0 px-6 pb-10 md:px-12 md:pb-14 max-w-4xl">
          <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full mb-4 ${categoryColour}`}>
            <Tag className="w-3 h-3" /> {blog.category}
          </span>
          <h1 className="text-2xl md:text-4xl lg:text-5xl font-extrabold text-white leading-tight tracking-tight">
            {blog.title}
          </h1>
          <p className="mt-3 text-white/70 text-base md:text-lg max-w-2xl hidden md:block">
            {blog.subtitle}
          </p>
        </div>
      </div>

      {/* ── ARTICLE BODY ── */}
      <div className="container max-w-4xl mx-auto px-4 md:px-6 py-12">

        {/* Meta strip */}
        <div className="flex flex-wrap items-center gap-4 pb-8 mb-8 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center text-primary font-bold text-sm flex-shrink-0">
              {blog.author[0]}
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">{blog.author}</p>
              <p className="text-xs text-muted-foreground">{blog.authorRole}</p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs text-muted-foreground ml-auto">
            <span>{blog.date}</span>
            <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600" />
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" /> {blog.readTime}
            </span>
          </div>
        </div>

        {/* Subtitle (mobile) */}
        <p className="md:hidden text-gray-500 dark:text-gray-400 text-base italic mb-8 leading-relaxed border-l-2 border-primary pl-4">
          {blog.subtitle}
        </p>

        {/* Article HTML */}
        <article
          className="prose prose-lg dark:prose-invert max-w-none
            prose-headings:font-bold prose-headings:text-gray-900 dark:prose-headings:text-white
            prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4
            prose-p:text-gray-600 dark:prose-p:text-gray-300 prose-p:leading-relaxed prose-p:mb-5
            prose-li:text-gray-600 dark:prose-li:text-gray-300
            prose-strong:text-gray-900 dark:prose-strong:text-white
            prose-a:text-primary prose-a:no-underline hover:prose-a:underline
            [&_.lead]:text-xl [&_.lead]:text-gray-700 dark:[&_.lead]:text-gray-200 [&_.lead]:font-medium [&_.lead]:leading-relaxed [&_.lead]:border-l-4 [&_.lead]:border-primary [&_.lead]:pl-5 [&_.lead]:not-italic
          "
          dangerouslySetInnerHTML={{ __html: blog.content }}
        />

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mt-12 pt-8 border-t border-gray-100 dark:border-gray-800">
          {blog.tags.map((tag) => (
            <span
              key={tag}
              className="text-xs px-3 py-1.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 font-medium"
            >
              #{tag}
            </span>
          ))}
        </div>

        {/* Author card */}
        <div className="mt-10 p-6 rounded-2xl bg-gradient-to-br from-primary/5 to-emerald-50/30 dark:from-primary/10 dark:to-gray-900 border border-primary/10 dark:border-primary/20 flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-base flex-shrink-0">
            {blog.author[0]}
          </div>
          <div>
            <p className="font-semibold text-gray-900 dark:text-white">{blog.author}</p>
            <p className="text-sm text-muted-foreground">{blog.authorRole}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              Writing about investment strategy, financial education, and wealth-building for Kenyans at home and in the diaspora.
            </p>
          </div>
        </div>
      </div>

      {/* ── RELATED ARTICLES ── */}
      <section className="border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 py-16">
        <div className="container max-w-6xl mx-auto px-4">
          <p className="text-xs font-bold tracking-[0.2em] uppercase text-primary mb-8">More to Read</p>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {related.map((b) => (
              <Link
                key={b.id}
                href={`/about/blog/${b.id}`}
                className="group flex flex-col rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800 hover:border-primary/40 hover:shadow-lg transition-all bg-white dark:bg-gray-900"
              >
                <div className="relative h-44 overflow-hidden">
                  <Image
                    src={b.image}
                    alt={b.title}
                    fill
                    className="object-cover group-hover:scale-105 transition duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                  <div className="absolute bottom-3 left-3">
                    <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${categoryColours[b.category] ?? ''}`}>
                      {b.category}
                    </span>
                  </div>
                </div>
                <div className="p-5 flex flex-col gap-2">
                  <p className="text-xs text-muted-foreground">{b.date} · {b.readTime}</p>
                  <h3 className="text-base font-semibold text-gray-900 dark:text-white line-clamp-2 group-hover:text-primary transition-colors leading-snug">
                    {b.title}
                  </h3>
                  <span className="text-xs text-primary font-semibold flex items-center gap-1 mt-1 group-hover:gap-2 transition-all">
                    Read <ArrowUpRight className="w-3 h-3" />
                  </span>
                </div>
              </Link>
            ))}
          </div>

          <div className="text-center mt-10">
            <Link
              href="/about/blog"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-primary text-primary text-sm font-semibold hover:bg-primary hover:text-primary-foreground transition-colors"
            >
              View all articles <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
      <PublicFooter />

    </div>
  );
}
