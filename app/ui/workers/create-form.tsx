'use client';

import { useActionState, useEffect, useState } from 'react';
import { createWorker, WorkerState } from '@/app/lib/actions/workerActions';
import {
    UserCircleIcon,
    AtSymbolIcon,
    BriefcaseIcon,
    CalendarIcon,
    CurrencyDollarIcon,
    CheckCircleIcon,
    BuildingOfficeIcon,
    TagIcon,
    PhoneIcon,
    MapPinIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { Button } from '@/app/ui/button';
import { Toast } from '../common/toast';

export default function WorkerForm() {
    const initialState: WorkerState = { message: '', errors: {} };

    const [state, formAction] = useActionState(createWorker, initialState);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    useEffect(() => {
        if (state.message) {
            const type = state.errors && Object.keys(state.errors).length > 0 ? 'error' : 'success';
            setToast({ message: state.message, type });
        }
    }, [state.message, state.errors]);
    return (
        <form action={formAction}>
            <div className="rounded-md bg-gray-50 p-4 md:p-6">

                {/* Name */}
                <div className="mb-4">
                    <label htmlFor="name" className="mb-2 block text-sm font-medium">Name</label>
                    <div className="relative">
                        <input
                            id="name"
                            name="name"
                            type="text"
                            placeholder="Full Name"
                            className="peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm placeholder:text-gray-500"
                            aria-describedby="name-error"
                        />
                        <UserCircleIcon className="absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500" />
                    </div>
                    {state.errors?.name && (
                        <p className="mt-2 text-sm text-red-500">{state.errors.name[0]}</p>
                    )}
                </div>

                {/* Email */}
                <div className="mb-4">
                    <label htmlFor="email" className="mb-2 block text-sm font-medium">Email</label>
                    <div className="relative">
                        <input
                            id="email"
                            name="email"
                            type="email"
                            placeholder="Email"
                            className="peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm placeholder:text-gray-500"
                            aria-describedby="email-error"
                        />
                        <AtSymbolIcon className="absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500" />
                    </div>
                    {state.errors?.email && (
                        <p className="mt-2 text-sm text-red-500">{state.errors.email[0]}</p>
                    )}
                </div>
                {/* Phone */}
                <div className="mb-4">
                    <label htmlFor="phone" className="mb-2 block text-sm font-medium">Phone</label>
                    <div className="relative">
                        <input
                            id="phone"
                            name="phone"
                            type="text"
                            placeholder="Phone Number"
                            className="peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm placeholder:text-gray-500"
                            aria-describedby="phone-error"
                        />
                        <PhoneIcon className="absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500" />  
                    </div>
                    {state.errors?.phone && (
                        <p className="mt-2 text-sm text-red-500">{state.errors.phone[0]}</p>
                    )}
                </div>
                {/* Position */}
                <div className="mb-4">
                    <label htmlFor="position" className="mb-2 block text-sm font-medium">Position</label>
                    <div className="relative">
                        <input
                            id="position"
                            name="position"
                            type="text"
                            placeholder="e.g. Painter"
                            className="peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm placeholder:text-gray-500"
                            aria-describedby="position-error"
                        />
                        <BriefcaseIcon className="absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500" />
                    </div>
                    {state.errors?.position && (
                        <p className="mt-2 text-sm text-red-500">{state.errors.position[0]}</p>
                    )}
                </div>

                {/* daily Rate */}
                <div className="mb-4">
                    <label htmlFor="dailyRate" className="mb-2 block text-sm font-medium">Daily Rate (DKK)</label>
                    <div className="relative">
                        <input
                            id="dailyRate"
                            name="dailyRate"
                            type="number"
                            step="0.01"
                            placeholder="e.g. 300"
                            className="peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm placeholder:text-gray-500"
                            aria-describedby="dailyRate-error"
                        />
                        <CurrencyDollarIcon className="absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500" />
                    </div>
                    {state.errors?.dailyRate && (
                        <p className="mt-2 text-sm text-red-500">{state.errors.dailyRate[0]}</p>
                    )}
                </div>

                {/* Start Date */}
                <div className="mb-4">
                    <label htmlFor="startDate" className="mb-2 block text-sm font-medium">Start Date</label>
                    <div className="relative">
                        <input
                            id="startDate"
                            name="startDate"
                            type="date"
                            className="peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm placeholder:text-gray-500"
                            aria-describedby="startDate-error"
                        />
                        <CalendarIcon className="absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500" />
                    </div>
                    {state.errors?.startDate && (
                        <p className="mt-2 text-sm text-red-500">{state.errors.startDate[0]}</p>
                    )}
                </div>


                {/* Address */}
                <div className="mb-4">
                    <label className="mb-2 block text-sm font-medium">Address</label>

                    {/* Street */}
                    <div className="relative mb-2">
                        <input
                            name="street"
                            type="text"
                            placeholder="Street"
                            className="block w-full pl-10 h-10 rounded-md border border-gray-300 text-sm"
                        />
                        <MapPinIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                    </div>
                    {state.errors?.address?.street && (
                        <p className="mt-2 text-sm text-red-500">{state.errors.address.street}</p>
                    )}

                    <div className="flex gap-4">
                        {/* Postal Code */}
                        <div className='flex-col w-full'>
                            <div className="relative w-1/2">
                                <input
                                    name="postalCode"
                                    type="text"
                                    placeholder="Postal Code"
                                    className="pl-10 w-full h-10 rounded-md border border-gray-300 text-sm"
                                />
                                <TagIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                            </div>
                            {state.errors?.address?.postalCode && (
                                <p className="mt-2 text-sm text-red-500">{state.errors.address.postalCode}</p>
                            )}
                        </div>

                        {/* City */}
                        <div className='flex-col w-full'>
                            <div className="relative w-1/2">
                                <input
                                    name="city"
                                    type="text"
                                    placeholder="City"
                                    className="pl-10 w-full h-10 rounded-md border border-gray-300 text-sm"
                                />
                                <BuildingOfficeIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                            </div>
                            {state.errors?.address?.city && (
                                <p className="mt-2 text-sm text-red-500">{state.errors.address.city}</p>
                            )}
                        </div>
                    </div>
                </div>
                {/* Is Active */}
                <div className="mb-4">
                    <label htmlFor="isActive" className="mb-2 block text-sm font-medium">Active</label>
                    <div className="flex items-center gap-2">
                        <input
                            id="isActive"
                            name="isActive"
                            type="checkbox"
                            defaultChecked
                            className="h-4 w-4 border-gray-300 text-blue-600"
                        />
                        <CheckCircleIcon className="h-5 w-5 text-gray-500" />
                        <span className="text-sm">Mark as currently active</span>
                    </div>
                </div>
            </div>

            <div id="error-message" aria-live="polite" aria-atomic="true">
                {toast && (
                    <Toast
                        message={toast.message}
                        type={toast.type}
                        onClose={() => setToast(null)}
                    />
                )}
            </div>
            <div className="mt-6 flex justify-end gap-4">
                <Link href="/dashboard/workers" className="bg-gray-100 px-4 py-2 rounded-lg text-gray-600">Cancel</Link>
                <Button type="submit">Create Worker</Button>
            </div>
        </form>
    );
}
