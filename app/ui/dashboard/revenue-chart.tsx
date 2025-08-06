import { CalendarIcon } from '@heroicons/react/24/outline';
import { lusitana } from '@/app/ui/fonts';
import { fetchRevenue } from '@/app/lib/data';

function generateYAxis(data: { revenue: number }[]) {
  if (!data.length) {
    return { yAxisLabels: [], topLabel: 0 };
  }

  // Find the max revenue value
  const maxRevenue = Math.max(...data.map(d => d.revenue));

  // Round up maxRevenue to nearest 10,000 for nicer labels
  const topLabel = Math.ceil(maxRevenue / 10000) * 10000 || 10000;

  // Generate 6 evenly spaced labels (including 0)
  const labels = [];
  for (let i = 5; i >= 0; i--) {
    labels.push(`$${Math.round((topLabel * i) / 5 / 1000)}K`);
  }

  return { yAxisLabels: labels, topLabel };
}

export default async function RevenueChart() {
  const rawRevenue = await fetchRevenue();

  // Filter out entries with zero revenue for Y axis scaling
  const nonZeroRevenue = rawRevenue.filter(r => r.revenue > 0);

  if (rawRevenue.length === 0 || nonZeroRevenue.length === 0) {
    return <p className="mt-4 text-gray-400">No data available.</p>;
  }

  const { yAxisLabels, topLabel } = generateYAxis(nonZeroRevenue);

  const chartHeight = 350;

  return (
    <div className="w-full md:col-span-4">
      <h2 className={`${lusitana.className} mb-4 text-xl md:text-2xl`}>
        Recent Revenue
      </h2>

      <div className="rounded-xl bg-gray-50 p-4">
        <div className="sm:grid-cols-13 mt-0 grid grid-cols-12 items-end gap-2 rounded-md bg-white p-4 md:gap-4">
          <div
            className="mb-6 hidden flex-col justify-between text-sm text-gray-400 sm:flex"
            style={{ height: `${chartHeight}px` }}
          >
            {yAxisLabels.map((label) => (
              <p key={label}>{label}</p>
            ))}
          </div>

          {rawRevenue.map((month) => {
            // calculate bar height relative to topLabel
            const barHeight = topLabel ? (chartHeight * month.revenue) / topLabel : 0;

            return (
              <div key={month.month} className="flex flex-col items-center gap-2">
                <div
                  className="w-full rounded-md bg-blue-300"
                  style={{ height: `${barHeight}px` }}
                ></div>
                <p className="-rotate-90 text-sm text-gray-400 sm:rotate-0">
                  {month.month}
                </p>
              </div>
            );
          })}
        </div>
        <div className="flex items-center pb-2 pt-6">
          <CalendarIcon className="h-5 w-5 text-gray-500" />
          <h3 className="ml-2 text-sm text-gray-500">Last 12 months</h3>
        </div>
      </div>
    </div>
  );
}
