import ApplicationLogo from '@/Components/ApplicationLogo';
import { Head, Link } from '@inertiajs/react';

const features = [
    {
        title: 'Organized Categories',
        body: 'Documents are grouped under admin-defined categories such as Memorandum, Administrative Order, and more.',
        icon: (
            <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 7h7a1 1 0 011 1v9a1 1 0 01-1 1H3a1 1 0 01-1-1V8a1 1 0 011-1zM14 5h7a1 1 0 011 1v11a1 1 0 01-1 1h-7a1 1 0 01-1-1V6a1 1 0 011-1z" />
            </svg>
        ),
    },
    {
        title: 'Auto Control Numbers',
        body: 'Every attached document receives a unique auto-generated control number for reference and traceability.',
        icon: (
            <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
        ),
    },
    {
        title: 'Role-Based Access',
        body: 'Admins manage categories and documents. Assistants attach files. Every action is logged and tracked.',
        icon: (
            <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
        ),
    },
];

export default function Welcome({ auth }) {
    return (
        <div className="min-h-screen bg-[#f5f5f7]">
            <Head title="Welcome" />

            {/* Nav */}
            <nav className="sticky top-0 z-30 h-12 border-b border-black/[0.06] bg-white/80 backdrop-blur-xl">
                <div className="mx-auto flex h-full max-w-6xl items-center justify-between px-6">
                    <Link href="/" className="flex items-center">
                        <ApplicationLogo className="h-7 w-auto object-contain" />
                    </Link>

                    <div className="flex items-center gap-1.5">
                        {auth.user ? (
                            <Link
                                href={route('dashboard')}
                                className="rounded-lg bg-gray-900 px-3.5 py-1.5 text-[13px] font-medium text-white transition-colors hover:bg-gray-700"
                            >
                                Dashboard
                            </Link>
                        ) : (
                            <Link
                                href={route('login')}
                                className="rounded-lg bg-gray-900 px-3.5 py-1.5 text-[13px] font-medium text-white transition-colors hover:bg-gray-700"
                            >
                                Sign In
                            </Link>
                        )}
                    </div>
                </div>
            </nav>

            {/* Hero */}
            <div className="flex flex-col items-center px-6 py-24 text-center">
                <div className="mb-8 flex justify-center">
                    <ApplicationLogo className="h-16 w-auto object-contain" />
                </div>

                <h1 className="text-[38px] font-semibold tracking-tight text-gray-900 sm:text-[52px]">
                    Attachment Issuance<br />Documents
                </h1>
                <p className="mt-4 max-w-md text-[15px] leading-relaxed text-gray-400">
                    A centralized workspace for managing, tracking, and issuing
                    official documents across your organization.
                </p>

                <div className="mt-8 flex items-center gap-3">
                    {auth.user ? (
                        <Link
                            href={route('dashboard')}
                            className="rounded-xl bg-gray-900 px-5 py-2.5 text-[14px] font-medium text-white transition-colors hover:bg-gray-700"
                        >
                            Go to Dashboard
                        </Link>
                    ) : (
                        <Link
                            href={route('login')}
                            className="rounded-xl bg-gray-900 px-5 py-2.5 text-[14px] font-medium text-white transition-colors hover:bg-gray-700"
                        >
                            Sign In
                        </Link>
                    )}
                </div>

                {/* Divider */}
                <div className="mt-20 h-px w-full max-w-3xl bg-black/[0.06]" />

                {/* Feature cards */}
                <div className="mt-12 grid w-full max-w-3xl grid-cols-1 gap-4 text-left sm:grid-cols-3">
                    {features.map(f => (
                        <div
                            key={f.title}
                            className="rounded-2xl border border-black/[0.06] bg-white p-5 shadow-sm"
                        >
                            <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-lg border border-gray-100 bg-gray-50">
                                {f.icon}
                            </div>
                            <p className="text-[13px] font-semibold text-gray-900">{f.title}</p>
                            <p className="mt-1.5 text-[12px] leading-relaxed text-gray-400">{f.body}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Footer */}
            <footer className="border-t border-black/[0.06] bg-white py-5 text-center">
                <p className="text-[11px] text-gray-300">
                    Attachment Issuance Documents System
                </p>
            </footer>
        </div>
    );
}
