import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, usePage } from '@inertiajs/react';

function StatCard({ label, value }) {
    return (
        <div className="rounded-2xl border border-black/[0.06] bg-white px-6 py-5 shadow-sm">
            <p className="text-[12px] font-medium text-gray-400">{label}</p>
            <p className="mt-1.5 text-[28px] font-semibold tracking-tight text-gray-900 tabular-nums">{value}</p>
        </div>
    );
}

export default function Dashboard({ stats }) {
    const { auth } = usePage().props;
    const user     = auth.user;
    const isAdmin  = user.role === 'admin';

    const hour      = new Date().getHours();
    const greeting  = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
    const firstName = user.name.split(' ')[0];

    return (
        <AuthenticatedLayout>
            <Head title="Dashboard" />

            {/* Page toolbar — same pattern as Documents */}
            <div className="border-b border-black/[0.06] bg-white px-6 py-3.5">
                <p className="text-[14px] font-semibold text-gray-900">Dashboard</p>
                <p className="text-[11px] text-gray-400">
                    Overview of your AID workspace
                </p>
            </div>

            {/* Content */}
            <div className="mx-auto max-w-2xl w-full px-6 py-12">

                {/* Greeting */}
                <div className="mb-10">
                    <h1 className="text-[30px] font-semibold tracking-tight text-gray-900">
                        {greeting}, {firstName}.
                    </h1>
                    <p className="mt-1.5 text-[14px] text-gray-400">
                        {isAdmin
                            ? 'You have full admin access — manage categories and documents.'
                            : 'You can attach documents to any existing category.'}
                    </p>
                </div>

                {/* Stats */}
                <div className="mb-6 grid grid-cols-2 gap-3">
                    <StatCard label="Total Categories" value={stats.categories} />
                    <StatCard label="Total Documents"  value={stats.documents}  />
                </div>

                {/* Quick access */}
                <Link
                    href={route('aid.index')}
                    className="group flex items-center justify-between rounded-2xl border border-black/[0.06] bg-white px-6 py-5 shadow-sm transition-shadow duration-150 hover:shadow-md"
                >
                    <div>
                        <p className="text-[14px] font-semibold text-gray-900">
                            Go to Documents
                        </p>
                        <p className="mt-0.5 text-[12px] text-gray-400">
                            Browse, attach, and manage issuance documents
                        </p>
                    </div>
                    <svg
                        className="h-4 w-4 text-gray-300 transition-all duration-150 group-hover:translate-x-0.5 group-hover:text-gray-500"
                        fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                </Link>

                {/* Role pill */}
                <div className="mt-6 flex items-center gap-2">
                    <span className="inline-flex items-center rounded-full border border-gray-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-gray-500">
                        {isAdmin ? 'Administrator' : 'Admin Assistant'}
                    </span>
                    <span className="text-[11px] text-gray-300">{user.email}</span>
                </div>

            </div>
        </AuthenticatedLayout>
    );
}
