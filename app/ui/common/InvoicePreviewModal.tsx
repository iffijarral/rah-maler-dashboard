'use client';

import { Address, InvoiceService, InvoiceTableRow } from '@/app/lib/definitions';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/solid';
import { Fragment } from 'react';

export default function InvoicePreviewModal({ invoice, isOpen, onClose, onSendMail }: {invoice: InvoiceTableRow, isOpen: boolean, onClose: () => void, onSendMail: () => void}) {
    if (!invoice) return null;    
    const { project, services } = invoice;
    const customer = project.customer || {};
    const address: Address = customer.address || {
        street: '',
        postalCode: '',
        city: ''
    };
    let total = 0;
    return (
        <Transition show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onClose}>
                {/* Backdrop */}
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" aria-hidden="true" />

                {/* Centered Dialog Content */}
                <div className="fixed inset-0 flex items-center justify-center p-4">
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0 scale-95"
                        enterTo="opacity-100 scale-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100 scale-100"
                        leaveTo="opacity-0 scale-95"
                    >
                        <Dialog.Panel className="relative w-full max-w-2xl rounded-lg bg-white p-6 shadow-xl">
                            {/* Close Button */}
                            <button
                                className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
                                onClick={onClose}
                            >
                                <XMarkIcon className="h-5 w-5" />
                            </button>

                            {/* Title */}
                            <Dialog.Title className="text-xl font-bold mb-4">Faktura Preview</Dialog.Title>

                            {/* Customer & Company Info */}
                            <div className="flex justify-between mb-6 text-xs">
                                <div>
                                    <p>{customer.name}</p>
                                    <p>{customer.email}</p>
                                    <p>{address.street}</p>
                                    <p>{address.postalCode}, {address.city}</p>
                                </div>
                                <div className="">
                                    <p>RAH Maler</p>
                                    <p>Tingbjerg ås 9</p>
                                    <p>2700 Brønshøj</p>
                                    <p>CVR. 12345678</p>
                                    <p>rahmaler.dk</p>
                                    <p>info@rahmaler.dk</p>
                                    <p>Telefon 70 10 20 31</p>
                                </div>
                            </div>

                            {/* Services Table */}
                            <table className="w-full text-sm border-t border-b border-gray-200 mb-4">
                                <thead>
                                    <tr className="text-left text-gray-700">
                                        <th className="py-2">Ydelse(r)</th>
                                        <th className="py-2">Antal</th>
                                        <th className="py-2">Enhedspris</th>
                                        <th className="py-2 text-right">Beløb</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {services.map((s: InvoiceService, index: number) => (
                                        total += s.amount * s.quantity,
                                        <tr key={index}>
                                            <td className="py-1">{s.service.name}</td>
                                            <td className="py-1">{s.quantity}</td>
                                            <td className="py-1">{(s.amount / 100).toFixed(2)}</td>
                                            <td className="py-1 text-right">{((s.amount * s.quantity) / 100).toFixed(2)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            {/* Total */}
                            <div className="text-right text-sm space-y-1 mt-4">
                                <div className="font-semibold">
                                    Total (ekskl. moms): {(total / 100).toFixed(2)} DKK
                                </div>
                                <div className="text-gray-600">
                                    Total (inkl. moms 25%): {(total * 1.25 / 100).toFixed(2)} DKK
                                </div>
                            </div>

                            {/* Send Email Button */}
                            <div className="mt-6 text-right">
                                <button
                                    className="bg-gray-200 text-gray-800 px-4 py-2 mr-2 rounded hover:bg-gray-300"
                                    onClick={onClose}
                                >
                                    Cancel
                                </button>
                                <button
                                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                                    onClick={() => {
                                        // Email sending logic here
                                        onSendMail();
                                        onClose();
                                    }}
                                >
                                    Send
                                </button>
                            </div>
                        </Dialog.Panel>
                    </Transition.Child>
                </div>
            </Dialog>
        </Transition>
    );
}
