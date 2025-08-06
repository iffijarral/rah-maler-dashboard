import { UpdateInvoice } from '@/app/ui/invoices/buttons';
import InvoiceStatus from '@/app/ui/invoices/status';
import { formatDateToLocal, formatCurrency } from '@/app/lib/utils';
import { fetchFilteredInvoices } from '@/app/lib/data';
import { Delete, SendMail } from '../buttons/action-buttons';
import { InvoiceTableRow } from '@/app/lib/definitions';
// import { InvoicesTableType } from '@/app/lib/definitions';

export default async function InvoicesTable({
  query,
  currentPage,
}: {
  query: string;
  currentPage: number; 
}) {
  const { invoices }: { invoices: InvoiceTableRow[] }  = await fetchFilteredInvoices(query, currentPage);

  return (
    <div className="mt-6 flow-root">
      <div className="inline-block min-w-full align-middle">
        <div className="rounded-lg bg-gray-50 p-2 md:pt-0">
          {invoices?.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No data available</div>
          ) : (
            <>
              {/* Mobile view */}
              <div className="md:hidden">
                {invoices.map((invoice) => (
                  <div
                    key={invoice.id}
                    className="mb-2 w-full rounded-md bg-white p-4"
                  >
                    <div className="flex items-center justify-between border-b pb-4">
                      <div>
                        <div className="mb-2 flex items-center">
                          <p>{invoice.project.customer.name}</p>
                        </div>
                        <p className="text-sm text-gray-500">{invoice.project.customer.email}</p>
                      </div>
                      <InvoiceStatus status={invoice.status} />
                    </div>
                    <div className="flex w-full items-center justify-between pt-4">
                      <div>
                        <p className="text-xl font-medium">
                          {formatCurrency(invoice.services.reduce((acc, service) => acc + service.amount, 0))}
                        </p>
                        <p>{formatDateToLocal(invoice.date.toString())}</p>
                      </div>
                      <div className="flex justify-end gap-2">
                        <UpdateInvoice id={invoice.id} />
                        <Delete id={invoice.id} route="invoice" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop table view */}
              <table className="hidden min-w-full text-gray-900 md:table">
                <thead className="rounded-lg text-left text-sm font-normal">
                  <tr>
                    <th scope="col" className="px-4 py-5 font-medium sm:pl-6">
                      Project
                    </th>
                    <th scope="col" className="px-3 py-5 font-medium">
                      Customer
                    </th>
                    <th scope="col" className="px-3 py-5 font-medium">
                      Amount
                    </th>
                    <th scope="col" className="px-3 py-5 font-medium">
                      Date
                    </th>
                    <th scope="col" className="px-3 py-5 font-medium">
                      Status
                    </th>
                    {/* <th scope="col" className="px-3 py-5 font-medium">
                      Deleted?
                    </th> */}
                    <th scope="col" className="relative py-3 pl-6 pr-3">
                      <span className="sr-only">Edit</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white">
                  {invoices.map((invoice) => (
                    <tr
                      key={invoice.id}
                      className="w-full border-b py-3 text-sm last-of-type:border-none [&:first-child>td:first-child]:rounded-tl-lg [&:first-child>td:last-child]:rounded-tr-lg [&:last-child>td:first-child]:rounded-bl-lg [&:last-child>td:last-child]:rounded-br-lg"
                    >
                      <td className="whitespace-nowrap py-3 pl-6 pr-3">
                        <div className="flex items-center gap-3">
                          <p>{invoice.project.name}</p>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-3 py-3">
                        {invoice.project.customer.name}
                      </td>
                      <td className="whitespace-nowrap px-3 py-3">
                        {formatCurrency(invoice.totalAmount)}
                      </td>
                      <td className="whitespace-nowrap px-3 py-3">
                        {formatDateToLocal(invoice.date.toString())}
                      </td>
                      <td className="whitespace-nowrap px-3 py-3">
                        <InvoiceStatus status={invoice.status} />
                      </td>
                      {/* <td className="whitespace-nowrap px-3 py-3">
                        {invoice.isDeleted ? (
                          <span className="text-red-500">Yes</span>
                        ) : (
                          <span className="text-green-500">No</span>
                        )}
                      </td> */}
                      <td className="whitespace-nowrap py-3 pl-6 pr-3">
                        <div className="flex justify-end gap-3">
                          <div className="relative group">
                            <SendMail invoice={invoice} />
                            <div className="absolute bottom-full left-1/2 mb-2 w-max -translate-x-1/2 scale-0 transform rounded bg-gray-800 px-2 py-1 text-xs text-white opacity-0 transition-all group-hover:scale-100 group-hover:opacity-100 z-10">
                              Send Email
                            </div>
                          </div>

                          <div className="relative group">
                            <UpdateInvoice id={invoice.id} />
                            <div className="absolute bottom-full left-1/2 mb-2 w-max -translate-x-1/2 scale-0 transform rounded bg-gray-800 px-2 py-1 text-xs text-white opacity-0 transition-all group-hover:scale-100 group-hover:opacity-100 z-10">
                              Edit Invoice
                            </div>
                          </div>

                          <div className="relative group">
                            <Delete id={invoice.id} route="invoice" />
                            <div className="absolute bottom-full left-1/2 mb-2 w-max -translate-x-1/2 scale-0 transform rounded bg-gray-800 px-2 py-1 text-xs text-white opacity-0 transition-all group-hover:scale-100 group-hover:opacity-100 z-10">
                              Delete Invoice
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}
        </div>

      </div>
    </div>
  );
}
