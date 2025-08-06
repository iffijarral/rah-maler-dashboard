import Pagination from '@/app/ui/invoices/pagination';
import Search from '@/app/ui/search';
import { lusitana } from '@/app/ui/fonts';
import { WorkersTableSkeleton } from '@/app/ui/skeletons';
import { fetchWorkersPages } from '@/app/lib/data';
import { Suspense } from 'react';
import { Metadata } from 'next';
import CreateButton from '@/app/ui/buttons/create';
import WorkersTable from '@/app/ui/workers/table';

export const metadata: Metadata = {
  title: 'Workers',
};

type PageProps = {
    searchParams?: Promise<{
        query?: string;
        page?: string;
    }>;
};
 
export default async function Page(props: PageProps) {
    const searchParams = await props.searchParams;
    const query = searchParams?.query || '';
    const currentPage = Number(searchParams?.page) || 1;
    const totalPages = await fetchWorkersPages(query);
  return (
    <div className="w-full">
      <div className="flex w-full items-center justify-between">
        <h1 className={`${lusitana.className} text-2xl`}>Workers</h1>
      </div>
      <div className="mt-4 flex items-center justify-between gap-2 md:mt-8">
        <Search placeholder="Search worker..." />
        <CreateButton label='Create Worker' route='workers' />
      </div>
       <Suspense key={query + currentPage} fallback={<WorkersTableSkeleton />}>
        <WorkersTable query={query} currentPage={currentPage} />
      </Suspense>
      { totalPages > 1 && (
        <div className="mt-5 flex w-full justify-center">
          <Pagination totalPages={totalPages} />
        </div>
      )}     
    </div>
  );
}