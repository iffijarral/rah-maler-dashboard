'use client';

import { useActionState, useState } from 'react';
import Link from 'next/link';
import {
    AtSymbolIcon,
    UserCircleIcon,
    IdentificationIcon,
    PhoneIcon,
    MapPinIcon,
    TagIcon,
    BuildingOfficeIcon,
} from '@heroicons/react/24/outline';
import { Button } from '@/app/ui/button';
import { updateCustomer, CustomerState } from '@/app/lib/actions/customerActions';
import { UpdateCustomerInput } from '@/app/lib/definitions';

export default function EditCustomerForm({ customer }: { customer: UpdateCustomerInput }) {
    const updateCustomerWithId = updateCustomer.bind(null, customer.id);
    const initialState: CustomerState = { message: null, errors: {} };
    const [, formAction] = useActionState(updateCustomerWithId, initialState);
    const [selectedType, setSelectedType] = useState(customer.type);
    const [address, setAddress] = useState(customer.address || { street: '', postalCode: '', city: '', isPrimary: true });
    
    const handleRadioChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSelectedType(event.target.value as 'private' | 'company');
    };

    const handleAddressChange = (field: string, value: string) => {
        setAddress(prev => ({ ...prev, [field]: value }));
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
                            defaultValue={customer.name}
                            className="peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2"
                        />
                        <UserCircleIcon className="absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500" />
                    </div>
                </div>

                {/* Email */}
                <div className="mb-4">
                    <label htmlFor="email" className="mb-2 block text-sm font-medium">Email</label>
                    <div className="relative">
                        <input
                            id="email"
                            name="email"
                            type="email"
                            defaultValue={customer.email}
                            className="peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2"
                        />
                        <AtSymbolIcon className="absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500" />
                    </div>
                </div>
                {/* Phone */}
                <div className="mb-4">
                    <label htmlFor="phone" className="mb-2 block text-sm font-medium">Phone</label>
                    <div className="relative">
                        <input
                            id="phone"
                            name="phone"
                            type="text"
                            defaultValue={customer.phone}
                            className="peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2"
                        />
                        <PhoneIcon className="absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500" />
                    </div>
                </div>
                {/* Type */}
                <div className="mb-4">
                    <label className="mb-2 block text-sm font-medium">Type</label>
                    <div className="flex space-x-6">
                        {['private', 'company'].map((type) => (
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
                                defaultValue={customer.cvrNumber ?? ''}
                                className="peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2"
                            />
                            <IdentificationIcon className="absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500" />
                        </div>
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
                            value={address.street}
                            onChange={(e) => handleAddressChange('street', e.target.value)}
                            className="block w-full pl-10 h-10 rounded-md border border-gray-300 text-sm"
                        />
                        <MapPinIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                    </div>

                    <div className="flex gap-4">
                        {/* Postal Code */}
                        <div className='flex-col w-full'>
                            <div className="relative w-1/2">
                                <input
                                    name="postalCode"
                                    type="text"
                                    placeholder="Postal Code"
                                    value={address.postalCode}
                                    onChange={(e) => handleAddressChange('postalCode', e.target.value)}
                                    className="pl-10 w-full h-10 rounded-md border border-gray-300 text-sm"
                                />
                                <TagIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                            </div>
                        </div>

                        {/* City */}
                        <div className='flex-col w-full'>
                            <div className="relative w-1/2">
                                <input
                                    name="city"
                                    type="text"
                                    placeholder="City"
                                    value={address.city}
                                    onChange={(e) => handleAddressChange('city', e.target.value)}
                                    className="pl-10 w-full h-10 rounded-md border border-gray-300 text-sm"
                                />
                                <BuildingOfficeIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-6 flex justify-end gap-4">
                <Link href="/dashboard/customers" className="bg-gray-100 px-4 py-2 rounded-lg text-gray-600">Cancel</Link>
                <Button type="submit">Update Customer</Button>
            </div>
        </form>
    );
}
