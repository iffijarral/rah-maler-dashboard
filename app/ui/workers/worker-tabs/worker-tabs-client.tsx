// ui/worker-tabs/worker-tabs-client.tsx
'use client';

import { useState, useEffect, startTransition } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Vacation, SalarySummary } from '@/app/lib/definitions'; // Your types
import WorkerHistoryTab from './worker-history-tab-client';
// import SalaryTab from './salary-tab-client';
import VacationTab from './vacation-tab-client';
import SalaryTab from './salary-tab-client';

interface WorkerTabsClientProps {
    workerId: string;
    initialActiveTab: string;
    initialSelectedYear: number;
    workedDaysPerMonth: Record<number, number>; // This is the data structure for worked days per month
    initialSalaryHistory: SalarySummary[];
    initialVacationHistory: Vacation[];
}

export default function WorkerTabsClient({
    workerId,
    initialActiveTab,
    initialSelectedYear,
    workedDaysPerMonth,
    initialSalaryHistory,
    initialVacationHistory,
}: WorkerTabsClientProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    // Manage active tab state
    const [activeTab, setActiveTab] = useState(initialActiveTab);
    // Manage selected year state (for dropdown)
    const [selectedYear, setSelectedYear] = useState(initialSelectedYear);   

    // Update URL when tab changes (optional, but good for bookmarking)
    useEffect(() => {
        const params = new URLSearchParams(searchParams.toString());
        if (params.get('tab') !== activeTab) {
            params.set('tab', activeTab);
            startTransition(() => {
                router.replace(`${pathname}?${params.toString()}`);
            });
        }
    }, [activeTab, router, pathname, searchParams]);

    // Update URL and trigger data fetch when year changes
    useEffect(() => {
        const params = new URLSearchParams(searchParams.toString());
        if (parseInt(params.get('year') || '0') !== selectedYear) {
            params.set('year', String(selectedYear));
            startTransition(() => {
                router.replace(`${pathname}?${params.toString()}`);
                // When router.replace (or push) with different search params runs,
                // the *Server Component* `page.tsx` will re-render if the params change
                // because it's a new URL. This means initial data will be re-fetched.
                // So, we don't necessarily need a client-side fetch here for the primary data.
                // However, for immediate feedback on tab-specific data, you might still need
                // a client-side fetch for specific tabs if they aren't fully re-rendered.
                // The `refreshToken` strategy will handle this for CUD operations.
            });
        }
    }, [selectedYear, router, pathname, searchParams]);


    // Function to trigger refresh of all tab data
    // This will be passed down to forms (SalaryModal, VacationModal)
    const handleDataRefresh = () => {
        startTransition(() => {            
            // This is the cleanest way to get fresh data from the server.
            console.log('Refreshing data for all tabs...');
            router.refresh();            
        });
    };

    // You might still have a useEffect to respond to refreshToken if some data is *only* client-fetched.
    // For instance, if changing `selectedYear` directly triggers a new client-side fetch.
    // However, if `router.refresh()` is used, the server component will re-fetch and pass new props.

    // Example of client-side year change fetch (only if you don't rely solely on router.refresh for year)
    // useEffect(() => {
    //     // This effect only runs if selectedYear changes AND we are not relying on router.refresh to re-fetch all data.
    //     // If router.refresh() (or a full navigation due to search param change) is your primary data refresh,
    //     // then `initialWorkerHistory`, `initialSalaryHistory`, `initialVacationHistory` would be updated on re-render.
    //     // However, for CUD operations, `router.refresh()` in `handleDataRefresh` is perfect.
    //     if (selectedYear !== initialSelectedYear || refreshToken > 0) { // check if year changed or refresh needed
    //         // Here you would make client-side fetches if needed per tab
    //         // Example:
    //         // fetch(`/api/worker-history?workerId=${workerId}&year=${selectedYear}`)
    //         //     .then(res => res.json()).then(setWorkerHistory);
    //         // fetch(`/api/salary-history?workerId=${workerId}&year=${selectedYear}`)
    //         //     .then(res => res.json()).then(setSalaryHistory);
    //         // fetch(`/api/vacation-history?workerId=${workerId}&year=${selectedYear}`)
    //         //     .then(res => res.json()).then(setVacationHistory);
    //         // IMPORTANT: If you use router.refresh() in handleDataRefresh,
    //         // these useState setters will be re-initialized from props on the next server render.
    //     }
    // }, [selectedYear, refreshToken, workerId, initialSelectedYear]); // Include initialSelectedYear to prevent initial re-fetch

    const years = Array.from({ length: 5 }).map((_, i) => new Date().getFullYear() - i); // Example years

    return (
        <div>
            {/* Year dropdown - it's a client component because it has useState onChange */}
            <div className="mb-4 flex gap-2 items-center">
                <label htmlFor="year" className="font-medium text-gray-700">Year:</label>
                <select
                    id="year"
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                    className="rounded border border-gray-300 py-2 focus:border-blue-500 focus:ring-blue-500"
                >
                    {years.map(year => (
                        <option key={year} value={year}>{year}</option>
                    ))}
                </select>
            </div>

            {/* Tab Navigation */}
            <div className="mb-6 border-b border-gray-200">
                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                    {['history', 'salary', 'vacation'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`
                                whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm
                                ${activeTab === tab
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                                }
                            `}
                        >
                            {tab.charAt(0).toUpperCase() + tab.slice(1)} Tab
                        </button>
                    ))}
                </nav>
            </div>

            {/* Tab Content */}
            <div>
                 {activeTab === 'history' && (
                    <WorkerHistoryTab
                        workerId={workerId}
                        workedDaysPerMonth={workedDaysPerMonth} // Pass the fetched data
                        selectedYear={selectedYear}                        // Pass the refresh function
                    />
                )}
                {activeTab === 'salary' && (
                    <SalaryTab
                        workerId={workerId}
                        salaryHistory={initialSalaryHistory} // Pass the fetched data
                        selectedYear={selectedYear}
                        triggerRefresh={handleDataRefresh} // Pass the refresh function
                    />
                )}
                {activeTab === 'vacation' && (
                    <VacationTab
                        workerId={workerId}
                        vacations={initialVacationHistory} // Pass the fetched data
                        selectedYear={selectedYear}
                        triggerRefresh={handleDataRefresh} // Pass the refresh function
                    />
                )} 
            </div>
        </div>
    );
}