import { notFound } from 'next/navigation';
import WorkerTabsClient from '@/app/ui/workers/worker-tabs/worker-tabs-client';
import { fetchWorkerById2, fetchWorkerHistory } from '@/app/lib/data';
import Breadcrumbs from '@/app/ui/common/breadcrumbs';

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ year?: string; tab?: string }>;
};

export default async function WorkerDetailPage({ params, searchParams }: PageProps) {
  const { id: workerId } = await params;
  const { year, tab } = await searchParams;

  if (!workerId) notFound();

  const currentYear = parseInt(year || String(new Date().getFullYear()), 10);
  const activeTab = tab || 'history';

  const workerDetails = await fetchWorkerById2(workerId);
  if (!workerDetails) notFound();

  const { vacations, salarySummaries, workedDaysPerMonth } = await fetchWorkerHistory(workerId, currentYear);
  
  return (
    <div className="container mx-auto p-6">
      <Breadcrumbs
        breadcrumbs={[
          { label: 'Workers', href: '/dashboard/workers' },
          {
            label: workerDetails.name,
            href: `/dashboard/workers/${workerId}`,
            active: true,
          },
        ]}
      />
      
      <WorkerTabsClient
        workerId={workerId}
        initialActiveTab={activeTab}
        initialSelectedYear={currentYear}
        workedDaysPerMonth={workedDaysPerMonth}
        initialSalaryHistory={salarySummaries}
        initialVacationHistory={vacations}
      />
    </div>
  );
}
