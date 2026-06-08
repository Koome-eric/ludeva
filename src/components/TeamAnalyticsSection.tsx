import { prisma } from '@/lib/prisma';

// Force dynamic rendering so the server always fetches latest analytics
export const dynamic = 'force-dynamic';
import { BarChart3, Calendar, RefreshCw } from 'lucide-react';

type Props = {
  /** Pass this from the page if you want SSR. Otherwise the component fetches itself. */
  data?: {
    label: string;
    fileName: string;
    headers: string[];
    rows: string[][];
    createdAt: string | Date;
  } | null;
};

// Server component — data is fetched at request time so the page always shows the latest.
async function getLatestAnalytics() {
  try {
    const latest = await prisma.teamAnalytics.findFirst({
      orderBy: { createdAt: 'desc' },
      select: {
        label: true,
        fileName: true,
        headers: true,
        rows: true,
        createdAt: true,
      },
    });

    if (!latest) return null;

    return {
      ...latest,
      rows: JSON.parse(latest.rows) as string[][],
    };
  } catch {
    return null;
  }
}

export default async function TeamAnalyticsSection({ data: propData }: Props) {
  const data = propData ?? (await getLatestAnalytics());

  if (!data) return null; // Show nothing if no analytics have been uploaded yet

  const formatDate = (iso: string | Date) =>
    new Date(iso).toLocaleDateString('en-KE', {
      day: 'numeric', month: 'long', year: 'numeric',
    });

  return (
    <section className="py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">

        {/* Section Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-medium mb-4">
            <BarChart3 className="w-4 h-4" />
            Live Data
          </div>
          <h2 className="text-3xl font-bold mb-2">Team Analytics</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Up-to-date performance data across all Ludeva Teams Global tiers.
          </p>
        </div>

        {/* Meta row */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4 px-1">
          <div>
            <p className="font-semibold text-sm text-gray-800 dark:text-white">{data.label}</p>
            <p className="text-xs text-muted-foreground">{data.fileName}</p>
          </div>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" /> Updated {formatDate(data.createdAt)}
            </span>
            <span className="flex items-center gap-1">
              <RefreshCw className="w-3 h-3" /> {data.rows.length} records
            </span>
          </div>
        </div>

        {/* Table */}
        <div className="rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="bg-primary text-primary-foreground">
                  {data.headers.map((h, i) => (
                    <th
                      key={i}
                      className="px-5 py-3.5 font-semibold whitespace-nowrap border-r border-primary/30 last:border-r-0"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.rows.map((row, ri) => (
                  <tr
                    key={ri}
                    className={`border-b border-gray-100 dark:border-gray-800 transition-colors hover:bg-primary/5 ${
                      ri % 2 === 0 ? '' : 'bg-gray-50/50 dark:bg-gray-900/30'
                    }`}
                  >
                    {data.headers.map((_, ci) => (
                      <td
                        key={ci}
                        className="px-5 py-3 text-gray-700 dark:text-gray-300 whitespace-nowrap border-r border-gray-100 dark:border-gray-800 last:border-r-0"
                      >
                        {row[ci] ?? '—'}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {data.rows.length === 0 && (
            <div className="text-center py-10 text-muted-foreground text-sm">
              No data rows found in this file.
            </div>
          )}
        </div>

        <p className="text-xs text-muted-foreground text-center mt-4">
          Data is updated by Ludeva administrators. Contact support for queries about specific figures.
        </p>
      </div>
    </section>
  );
}
