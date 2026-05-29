import ApplicationLogo from '@/Components/ApplicationLogo';
import { Head, Link, usePage } from '@inertiajs/react';

export default function Pending() {
    const { auth } = usePage().props;
    const user = auth.user;

    const isRejected = user?.status === 'rejected';

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-[#f5f5f7] px-4">
            <Head title={isRejected ? 'Access Denied' : 'Pending Approval'} />

            <div className="w-full max-w-sm">
                <div className="mb-8 flex justify-center">
                    <ApplicationLogo className="h-10 w-auto object-contain" />
                </div>

                <div className="overflow-hidden rounded-2xl border border-black/[0.06] bg-white shadow-sm">
                    <div className="px-6 py-8 text-center">
                        <div className="mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
                            {isRejected ? (
                                <svg className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            ) : (
                                <svg className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2m6-2a10 10 0 11-20 0 10 10 0 0120 0z" />
                                </svg>
                            )}
                        </div>

                        <p className="text-[17px] font-semibold text-gray-900">
                            {isRejected ? 'Access denied' : 'Awaiting approval'}
                        </p>
                        <p className="mt-2 text-[13px] leading-relaxed text-gray-400">
                            {isRejected
                                ? 'Your account registration has been rejected. Contact an administrator for assistance.'
                                : 'Your account is pending review. You will gain access once an administrator approves your registration.'}
                        </p>
                    </div>

                    <div className="border-t border-gray-100 px-6 py-3.5 text-center">
                        <p className="text-[11px] text-gray-300">Signed in as {user?.email}</p>
                    </div>
                </div>

                <div className="mt-5 text-center">
                    <Link
                        href={route('logout')}
                        method="post"
                        as="button"
                        className="text-[13px] text-gray-400 transition-colors hover:text-gray-700"
                    >
                        Sign out
                    </Link>
                </div>
            </div>
        </div>
    );
}
