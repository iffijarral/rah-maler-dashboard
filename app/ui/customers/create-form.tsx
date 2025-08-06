'use client';

import { useActionState, useState } from 'react';
import Link from 'next/link';
import {
    AtSymbolIcon,
    UserCircleIcon,
    PhoneIcon,
    IdentificationIcon,
    MapPinIcon,
    TagIcon,
    BuildingOfficeIcon,
} from '@heroicons/react/24/outline';
import { Button } from '@/app/ui/button';
import { createCustomer, CustomerState } from '@/app/lib/actions/customerActions';

export default function Form() {
    const initialState: CustomerState = { message: "", errors: {} };
    const [state, formAction] = useActionState(createCustomer, initialState);
    const [selectedType, setSelectedType] = useState<'private' | 'company'>('private');

    const handleRadioChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSelectedType(event.target.value as 'private' | 'company');
    };

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
                            placeholder="Enter Full Name"
                            className="peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2"
                            aria-describedby="name-error"
                        />
                        <UserCircleIcon className="absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500" />
                    </div>
                    {state.errors?.name && (
                        <p id="name-error" className="mt-2 text-sm text-red-500">{state.errors.name[0]}</p>
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
                            placeholder="Enter Email"
                            className="peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2"
                            aria-describedby="email-error"
                        />
                        <AtSymbolIcon className="absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500" />
                    </div>
                    {state.errors?.email && (
                        <p id="email-error" className="mt-2 text-sm text-red-500">{state.errors.email[0]}</p>
                    )}
                </div>

                {/* Phone */}
                <div className="mb-4">
                    <label htmlFor="phone" className="mb-2 block text-sm font-medium">Phone</label>
                    <div className="relative">
                        <input
                            id="phone"
                            name="phone"
                            type="tel"
                            placeholder="Enter Phone Number"
                            className="peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2"
                            aria-describedby="phone-error"
                        />
                        <PhoneIcon className="absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500" />
                    </div>
                    {state.errors?.phone && (
                        <p id="phone-error" className="mt-2 text-sm text-red-500">{state.errors.phone[0]}</p>
                    )}
                </div>

                {/* Type */}
                <div className="mb-4">
                    <label className="mb-2 block text-sm font-medium">Type</label>
                    <div className="flex space-x-6">
                        {["private", "company"].map((type) => (
                            <div className="flex items-center" key={type}>
                                <input
                                    id={type}
                                    name="type"
                                    type="radio"
                                    value={type}
                                    checked={selectedType === type}
                                    onChange={handleRadioChange}
                                    className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                                />
                                <label htmlFor={type} className="ml-2 text-sm capitalize">{type}</label>
                            </div>
                        ))}
                    </div>
                </div>

                {/* CVR Number */}
                {selectedType === 'company' && (
                    <div className="mb-4">
                        <label htmlFor="cvrNumber" className="mb-2 block text-sm font-medium">CVR Number</label>
                        <div className="relative">
                            <input
                                id="cvrNumber"
                                name="cvrNumber"
                                type="text"
                                placeholder="Enter CVR Number"
                                className="peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2"
                            />
                            <IdentificationIcon className="absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500" />
                        </div>
                        {state.errors?.cvrNumber && (
                            <p className="mt-2 text-sm text-red-500">{state.errors.cvrNumber[0]}</p>
                        )}
                    </div>
                )}

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
            </div>

            <div className="mt-6 flex justify-end gap-4">
                <Link href="/dashboard/customers" className="bg-gray-100 px-4 py-2 rounded-lg text-gray-600">Cancel</Link>
                <Button type="submit">Create Customer</Button>
            </div>
        </form>
    );
}
