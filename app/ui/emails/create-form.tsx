// "use client";
// import { useActionState } from 'react';
// import { EmailParams } from '@/app/lib/definitions';
// import Link from 'next/link';
// import {
//     DocumentTextIcon,
//     UserCircleIcon,
//     EnvelopeIcon,
//     CheckCircleIcon
// } from '@heroicons/react/24/outline';
// import { Button } from '@/app/ui/button';
// import { sendWelcomeEmail } from '@/app/lib/actions/actions';

// export default function Form() {
//     const initialState: EmailParams = { receiver: '', subject: '', message: '', files: null, success: false, errors: {} };
//     const [state, formAction, isPending] = useActionState(sendWelcomeEmail, initialState);

//     return (
//         <form action={formAction}>
//             <div className="rounded-md bg-gray-50 p-4 md:p-6">
//                 {/* Receiver */}
//                 <div className="mb-4">
//                     <label htmlFor="receiver" className="mb-2 block text-sm font-medium">
//                         Receiver
//                     </label>
//                     <div className="relative">
//                         <input
//                             id="receiver"
//                             name="receiver"
//                             type="text"
//                             placeholder="Enter receiver email"
//                             className="peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
//                             aria-describedby="receiver-error"
//                         />
//                         <UserCircleIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
//                     </div>
//                     <div id="receiver-error" aria-live="polite" aria-atomic="true">
//                         {
//                             state.errors?.receiver &&
//                             <p className="mt-2 text-sm text-red-500">
//                                 {state.errors.receiver[0]}
//                             </p>
//                         }
//                     </div>
//                 </div>

//                 {/* Subject */}
//                 <div className="mb-4">
//                     <label htmlFor="subject" className="mb-2 block text-sm font-medium">
//                         Subject
//                     </label>
//                     <div className="relative mt-2 rounded-md">
//                         <div className="relative">
//                             <input
//                                 id="subject"
//                                 name="subject"
//                                 type="text"
//                                 placeholder="Enter subject"
//                                 className="peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
//                                 aria-describedby="subject-error"
//                             />
//                             <EnvelopeIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
//                         </div>
//                         <div id="subject-error" aria-live="polite" aria-atomic="true">
//                             {state.errors?.subject &&
//                                 <p className="mt-2 text-sm text-red-500">
//                                     {state.errors.subject[0]}
//                                 </p>
//                             }
//                         </div>
//                     </div>
//                 </div>

//                 {/*  Message     */}
//                 <div className="mb-4">
//                     <label htmlFor="message" className="mb-2 block text-sm font-medium">
//                         Message
//                     </label>
//                     <div className="relative mt-2 rounded-md">
//                         <div className="relative">
//                             <textarea
//                                 id="message"
//                                 name="message"
//                                 rows={6}
//                                 placeholder="Write your email here..."
//                                 className="peer block w-full rounded-md border border-gray-200 py-2 pl-10 pr-2 text-sm outline-2 placeholder:text-gray-500"
//                                 aria-describedby="message-error"
//                             ></textarea>
//                             <DocumentTextIcon className="pointer-events-none absolute left-3 top-3 h-[18px] w-[18px] text-gray-500 peer-focus:text-gray-900" />
//                         </div>
//                         <div id="message-error" aria-live="polite" aria-atomic="true">
//                             {state.errors?.message &&
//                                 state.errors.message.map((error: string) => (
//                                     <p className="mt-2 text-sm text-red-500" key={error}>
//                                         {error}
//                                     </p>
//                                 ))}
//                         </div>
//                     </div>
//                 </div>
//                 <div className="mb-4">

//                     <div className="relative">
//                         <input
//                             type="file"
//                             id="files"
//                             name="files"
//                             multiple
//                             accept='.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.png,.jpg,.jpeg,.gif,.webp,.svg,.zip, .rar'
//                             placeholder="file upload..."
//                             className="peer block w-full rounded-md py-2 pr-2 text-sm placeholder:text-gray-500"
//                             aria-describedby="files-error"
//                         />
//                         {/* <DocumentTextIcon className="pointer-events-none absolute left-3 top-3 h-[18px] w-[18px] text-gray-500 peer-focus:text-gray-900" /> */}
//                     </div>
//                     <div id="files-error" aria-live="polite" aria-atomic="true">
//                         {state.errors?.message &&
//                             state.errors.message.map((error: string) => (
//                                 <p className="mt-2 text-sm text-red-500" key={error}>
//                                     {error}
//                                 </p>
//                             ))}
//                     </div>

//                 </div>
//                 <div className='mb-4'>
//                     {state.success && (
//                         <div className="flex items-center gap-2">
//                             <CheckCircleIcon className="h-5 w-5 text-green-500" />
//                             <span className='text-sm'>Email sent successfully</span>
//                         </div>
//                     )}
//                 </div>
//             </div>
//             <div className="mt-6 flex justify-end gap-4">
//                 <Link
//                     href="/dashboard/invoices"
//                     className="flex h-10 items-center rounded-lg bg-gray-100 px-4 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-200"
//                 >
//                     Cancel
//                 </Link>
//                 <Button type="submit" disabled={isPending}>Send</Button>
//             </div>
//         </form>
//     );
// }
