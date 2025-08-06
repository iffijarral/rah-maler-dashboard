// import Pagination from '@/app/ui/invoices/pagination';
import Search from '@/app/ui/search';
// import Table from '@/app/ui/invoices/table';
import { lusitana } from '@/app/ui/fonts';
// import { InvoicesTableSkeleton } from '@/app/ui/skeletons';
// import { fetchInvoicesPages } from '@/app/lib/data';
// import { Suspense } from 'react';
import { Metadata } from 'next';
import { CreateEmail } from '@/app/ui/emails/buttons';

export const metadata: Metadata = {
  title: 'Emails',
};

type PageProps = {
    searchParams?: Promise<{
        query?: string;
        page?: string;
    }>;
};
 
export default async function Page(props: PageProps) {
    // const searchParams = await props.searchParams;
    // const query = searchParams?.query || '';
    // const currentPage = Number(searchParams?.page) || 1;
    // const totalPages = await fetchInvoicesPages(query);
    console.log(props);
  return (
    <div className="w-full">
      <div className="flex w-full items-center justify-between">
        <h1 className={`${lusitana.className} text-2xl`}>Emails</h1>
      </div>
      <div className="mt-4 flex items-center justify-between gap-2 md:mt-8">
        <Search placeholder="Search emails..." />
        <CreateEmail />
      </div>
       {/* <Suspense key={query + currentPage} fallback={<InvoicesTableSkeleton />}>
        <Table query={query} currentPage={currentPage} />
      </Suspense>
      <div className="mt-5 flex w-full justify-center">
        <Pagination totalPages={totalPages} />
      </div> */}
    </div>
  );
}