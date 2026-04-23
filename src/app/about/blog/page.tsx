import Image from 'next/image';
import Link from 'next/link';
import { blogs } from '@/lib/blogs';
import PageHero from '@/components/PageHero';
import { ArrowUpRight, Clock, Tag } from 'lucide-react';
import PublicHeader from "@/components/PublicHeader";
import PublicFooter from "@/components/PublicFooter";

// Category accent colours — maps to Tailwind classes
const categoryColours: Record<string, string> = {
  'Investing Basics':   'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  'Market Insights':    'bg-blue-100   text-blue-700   dark:bg-blue-900/40   dark:text-blue-300',
  'Real Estate':        'bg-amber-100  text-amber-700  dark:bg-amber-900/40  dark:text-amber-300',
  'Teams Global':       'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300',
  'Compliance':         'bg-rose-100   text-rose-700   dark:bg-rose-900/40   dark:text-rose-300',
  'Financial Planning': 'bg-teal-100   text-teal-700   dark:bg-teal-900/40   dark:text-teal-300',
};

function CategoryBadge({ category }: { category: string }) {
  const colour = categoryColours[category] ?? 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300';
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${colour}`}>
      <Tag className="w-3 h-3" />
      {category}
    </span>
  );
}

export default function BlogPage() {
  const [featured, ...rest] = blogs;

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-gray-950">
      <PublicHeader />
      
      {/* ── HERO ── */}
      <PageHero
        title="Insights & Ideas"
        description="Investing knowledge, market analysis, and financial stories — written by the Ludeva team for the Kenyan investor."
        imageSrc="/images/blog/blog-hero.png"
      />

      <main className="flex-1">

        {/* ── FEATURED POST ── */}
        <section className="py-16 md:py-20 border-b border-gray-100 dark:border-gray-800">
          <div className="container max-w-6xl mx-auto px-4">

            <p className="text-xs font-bold tracking-[0.2em] uppercase text-primary mb-8">
              Featured Article
            </p>

            <Link href={`/about/blog/${featured.id}`} className="group grid md:grid-cols-2 gap-10 items-center">

              {/* Image */}
              <div className="relative h-72 md:h-96 rounded-3xl overflow-hidden shadow-xl">
                <Image
                  src={featured.image}
                  alt={featured.title}
                  fill
                  className="object-cover group-hover:scale-105 transition duration-700"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4">
                  <CategoryBadge category={featured.category} />
                </div>
              </div>

              {/* Content */}
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span>{featured.date}</span>
                  <span className="w-1 h-1 rounded-full bg-gray-400" />
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {featured.readTime}
                  </span>
                </div>

                <h2 className="text-3xl md:text-4xl font-bold leading-tight text-gray-900 dark:text-white group-hover:text-primary transition-colors">
                  {featured.title}
                </h2>

                <p className="text-gray-500 dark:text-gray-400 text-base leading-relaxed">
                  {featured.excerpt}
                </p>

                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                  <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{featured.author}</p>
                    <p className="text-xs text-muted-foreground">{featured.authorRole}</p>
                  </div>
                  <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary group-hover:gap-3 transition-all">
                    Read article <ArrowUpRight className="w-4 h-4" />
                  </span>
                </div>
              </div>
            </Link>
          </div>
        </section>

        {/* ── ALL POSTS GRID ── */}
        <section className="py-16 md:py-20">
          <div className="container max-w-6xl mx-auto px-4">

            <p className="text-xs font-bold tracking-[0.2em] uppercase text-primary mb-10">
              All Articles
            </p>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {rest.map((blog) => (
                <Link
                  key={blog.id}
                  href={`/about/blog/${blog.id}`}
                  className="group flex flex-col rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800 hover:border-primary/40 hover:shadow-xl dark:hover:shadow-primary/5 transition-all duration-300 bg-white dark:bg-gray-900"
                >
                  {/* Thumbnail */}
                  <div className="relative h-52 overflow-hidden">
                    <Image
                      src={blog.image}
                      alt={blog.title}
                      fill
                      className="object-cover group-hover:scale-105 transition duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                    <div className="absolute bottom-3 left-3">
                      <CategoryBadge category={blog.category} />
                    </div>
                  </div>

                  {/* Body */}
                  <div className="flex flex-col flex-1 p-6 gap-3">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{blog.date}</span>
                      <span className="w-1 h-1 rounded-full bg-gray-300" />
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {blog.readTime}
                      </span>
                    </div>

                    <h2 className="text-lg font-bold leading-snug text-gray-900 dark:text-white group-hover:text-primary transition-colors line-clamp-2">
                      {blog.title}
                    </h2>

                    <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3 flex-1">
                      {blog.excerpt}
                    </p>

                    {/* Author + CTA */}
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold flex-shrink-0">
                          {blog.author[0]}
                        </div>
                        <p className="text-xs font-medium text-gray-700 dark:text-gray-300 truncate max-w-[120px]">
                          {blog.author}
                        </p>
                      </div>
                      <span className="text-xs font-semibold text-primary flex items-center gap-1 group-hover:gap-2 transition-all">
                        Read <ArrowUpRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>


      </main>
      <PublicFooter />
    </div>
  );
}
