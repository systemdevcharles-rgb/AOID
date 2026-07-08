import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';

const FILTERS = ['all', 'pending', 'approved', 'rejected'];

function StatusBadge({ status }) {
    const cls = {
        pending:  'bg-amber-50 text-amber-700 border border-amber-100',
        approved: 'bg-gray-900 text-white',
        rejected: 'bg-gray-100 text-gray-400 border border-gray-200',
    };
    const label = { pending: 'Pending', approved: 'Approved', rejected: 'Rejected' };
    return (
        <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${cls[status] ?? ''}`}>
            {label[status] ?? status}
        </span>
    );
}

function Initials({ name }) {
    const initials = name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
    return (
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gray-100 text-[10px] font-bold text-gray-600 select-none">
            {initials}
        </span>
    );
}

function ConfirmRejectModal({ user, onConfirm, onCancel }) {
    if (!user) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/25 backdrop-blur-sm">
            <div className="w-80 rounded-2xl border border-black/[0.06] bg-white p-6 shadow-2xl">
                <p className="text-[14px] font-semibold text-gray-900">Reject this user?</p>
                <p className="mt-1.5 text-[12px] leading-relaxed text-gray-400">
                    <span className="font-medium text-gray-600">{user.name}</span> will lose access to the system. You can re-approve them later.
                </p>
                <div className="mt-5 flex justify-end gap-2">
                    <button
                        onClick={onCancel}
                        className="rounded-lg px-3 py-1.5 text-[12px] font-medium text-gray-500 transition-colors hover:bg-gray-100"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className="rounded-lg bg-gray-900 px-3 py-1.5 text-[12px] font-medium text-white transition-colors hover:bg-gray-700"
                    >
                        Reject
                    </button>
                </div>
            </div>
        </div>
    );
}

function CreateUserModal({ open, onClose }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        role: 'admin_assistant',
        password: '',
        password_confirmation: '',
    });

    if (!open) return null;

    const submit = (e) => {
        e.preventDefault();
        post(route('admin.users.store'), {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                onClose();
            },
        });
    };

    const inputClass =
        'w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-[13px] text-gray-900 placeholder-gray-300 outline-none transition-colors focus:border-gray-400';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/25 backdrop-blur-sm">
            <div className="w-full max-w-sm rounded-2xl border border-black/[0.06] bg-white shadow-2xl">
                <div className="border-b border-gray-100 px-6 py-4">
                    <p className="text-[14px] font-semibold text-gray-900">Add New User</p>
                    <p className="mt-0.5 text-[11px] text-gray-400">
                        Create a pre-approved account for a team member.
                    </p>
                </div>

                <form onSubmit={submit} className="space-y-3 px-6 py-4">
                    <div>
                        <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-gray-400">Full Name</label>
                        <input
                            type="text"
                            value={data.name}
                            onChange={e => setData('name', e.target.value)}
                            required
                            autoFocus
                            placeholder="Juan Dela Cruz"
                            className={inputClass}
                        />
                        {errors.name && <p className="mt-1 text-[11px] text-red-500">{errors.name}</p>}
                    </div>

                    <div>
                        <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-gray-400">Email</label>
                        <input
                            type="email"
                            value={data.email}
                            onChange={e => setData('email', e.target.value)}
                            required
                            placeholder="user@example.com"
                            className={inputClass}
                        />
                        {errors.email && <p className="mt-1 text-[11px] text-red-500">{errors.email}</p>}
                    </div>

                    <div>
                        <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-gray-400">Role</label>
                        <select
                            value={data.role}
                            onChange={e => setData('role', e.target.value)}
                            className={inputClass}
                        >
                            <option value="admin_assistant">Admin Assistant</option>
                            <option value="admin">Administrator</option>
                            <option value="management">Management</option>
                        </select>
                        {errors.role && <p className="mt-1 text-[11px] text-red-500">{errors.role}</p>}
                    </div>

                    <div>
                        <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-gray-400">Password</label>
                        <input
                            type="password"
                            value={data.password}
                            onChange={e => setData('password', e.target.value)}
                            required
                            placeholder="Min. 8 characters"
                            className={inputClass}
                        />
                        {errors.password && <p className="mt-1 text-[11px] text-red-500">{errors.password}</p>}
                    </div>

                    <div>
                        <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-gray-400">Confirm Password</label>
                        <input
                            type="password"
                            value={data.password_confirmation}
                            onChange={e => setData('password_confirmation', e.target.value)}
                            required
                            placeholder="Repeat password"
                            className={inputClass}
                        />
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                        <button
                            type="button"
                            onClick={() => { reset(); onClose(); }}
                            className="rounded-lg px-3 py-1.5 text-[12px] font-medium text-gray-500 transition-colors hover:bg-gray-100"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={processing}
                            className="rounded-lg bg-gray-900 px-3 py-1.5 text-[12px] font-medium text-white transition-colors hover:bg-gray-700 disabled:opacity-50"
                        >
                            {processing ? 'Creating...' : 'Create user'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default function Users({ users }) {
    const { auth, flash } = usePage().props;
    const currentUser = auth.user;

    const [filter, setFilter]         = useState('all');
    const [search, setSearch]         = useState('');
    const [toast, setToast]           = useState(null);
    const [confirmReject, setConfirmReject] = useState(null);
    const [showCreate, setShowCreate] = useState(false);

    useEffect(() => {
        if (flash?.success) {
            setToast(flash.success);
            const t = setTimeout(() => setToast(null), 3000);
            return () => clearTimeout(t);
        }
    }, [flash?.success]);

    const counts = {
        all:      users.length,
        pending:  users.filter(u => u.status === 'pending').length,
        approved: users.filter(u => u.status === 'approved').length,
        rejected: users.filter(u => u.status === 'rejected').length,
    };

    const filtered = users.filter(u => {
        const matchesFilter = filter === 'all' || u.status === filter;
        const q = search.toLowerCase();
        const matchesSearch = !q
            || u.name.toLowerCase().includes(q)
            || u.email.toLowerCase().includes(q);
        return matchesFilter && matchesSearch;
    });

    const handleApprove = (user) => {
        router.patch(route('admin.users.approve', user.id), {}, { preserveScroll: true });
    };

    const handleReject = (user) => setConfirmReject(user);

    const confirmDoReject = () => {
        if (!confirmReject) return;
        router.patch(route('admin.users.reject', confirmReject.id), {}, {
            preserveScroll: true,
            onFinish: () => setConfirmReject(null),
        });
    };

    return (
        <AuthenticatedLayout>
            <Head title="User Management" />

            {/* Toolbar */}
            <div className="flex items-center justify-between border-b border-black/[0.06] bg-white px-6 py-3.5">
                <div>
                    <p className="text-[14px] font-semibold text-gray-900">User Management</p>
                    <p className="text-[11px] text-gray-400">Review, approve, and reject registered accounts</p>
                </div>
                <button
                    onClick={() => setShowCreate(true)}
                    className="flex items-center gap-1.5 rounded-lg bg-gray-900 px-3 py-1.5 text-[12px] font-medium text-white transition-colors hover:bg-gray-700"
                >
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                    New User
                </button>
            </div>

            {/* Content */}
            <div className="mx-auto w-full max-w-5xl px-6 py-8">

                {/* Controls */}
                <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    {/* Filter pills */}
                    <div className="flex items-center gap-1 overflow-x-auto">
                        {FILTERS.map(f => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-[12px] font-medium transition-colors ${
                                    filter === f
                                        ? 'bg-gray-900 text-white'
                                        : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
                                }`}
                            >
                                {f.charAt(0).toUpperCase() + f.slice(1)}
                                <span className={`rounded-full px-1.5 py-px text-[10px] tabular-nums ${
                                    filter === f ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-400'
                                }`}>
                                    {counts[f]}
                                </span>
                            </button>
                        ))}
                    </div>

                    {/* Search */}
                    <input
                        type="text"
                        placeholder="Search name or email..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="h-8 w-full rounded-lg border border-gray-200 bg-white px-3 text-[12px] text-gray-900 placeholder-gray-300 outline-none transition-colors focus:border-gray-400 sm:w-52"
                    />
                </div>

                {/* Table card */}
                <div className="overflow-hidden rounded-2xl border border-black/[0.06] bg-white">
                    {filtered.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-center">
                            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
                                <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                            </div>
                            <p className="text-[13px] font-medium text-gray-400">No users found</p>
                            <p className="mt-0.5 text-[12px] text-gray-300">
                                {search ? 'Try a different search term.' : 'No users in this filter.'}
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                        <table className="w-full border-collapse text-left">
                            <thead>
                                <tr className="border-b border-gray-100">
                                    <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wide text-gray-400">User</th>
                                    <th className="hidden sm:table-cell px-5 py-3 text-[11px] font-semibold uppercase tracking-wide text-gray-400">Role</th>
                                    <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wide text-gray-400">Status</th>
                                    <th className="hidden md:table-cell px-5 py-3 text-[11px] font-semibold uppercase tracking-wide text-gray-400">Registered</th>
                                    <th className="px-5 py-3 text-right text-[11px] font-semibold uppercase tracking-wide text-gray-400">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {filtered.map(u => (
                                    <tr key={u.id} className="group transition-colors hover:bg-gray-50/60">
                                        <td className="px-5 py-3.5">
                                            <div className="flex items-center gap-3">
                                                <Initials name={u.name} />
                                                <div>
                                                    <p className="text-[13px] font-medium text-gray-900">{u.name}</p>
                                                    <p className="text-[11px] text-gray-400">{u.email}</p>
                                                    {/* Role + date inline on mobile */}
                                                    <div className="sm:hidden mt-1 flex items-center gap-1.5">
                                                        <StatusBadge status={u.status} />
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="hidden sm:table-cell px-5 py-3.5">
                                            <span className="inline-flex rounded-full border border-gray-200 bg-white px-2 py-0.5 text-[11px] font-medium text-gray-500">
                                                {u.role === 'admin' ? 'Administrator' : 'Admin Assistant'}
                                            </span>
                                        </td>
                                        <td className="hidden sm:table-cell px-5 py-3.5">
                                            <StatusBadge status={u.status} />
                                        </td>
                                        <td className="hidden md:table-cell px-5 py-3.5">
                                            <span className="text-[12px] text-gray-400 tabular-nums">{u.created_at}</span>
                                        </td>
                                        <td className="px-5 py-3.5 text-right">
                                            {u.id === currentUser.id ? (
                                                <span className="text-[11px] text-gray-300 select-none">You</span>
                                            ) : (
                                                <div className="flex items-center justify-end gap-1.5">
                                                    {u.status !== 'approved' && (
                                                        <button
                                                            onClick={() => handleApprove(u)}
                                                            className="rounded-lg border border-gray-200 px-3 py-1 text-[11px] font-medium text-gray-700 transition-colors hover:border-gray-300 hover:bg-gray-900 hover:text-white"
                                                        >
                                                            Approve
                                                        </button>
                                                    )}
                                                    {u.status !== 'rejected' && (
                                                        <button
                                                            onClick={() => handleReject(u)}
                                                            className="rounded-lg border border-gray-200 px-3 py-1 text-[11px] font-medium text-gray-500 transition-colors hover:border-gray-300 hover:bg-gray-100"
                                                        >
                                                            Reject
                                                        </button>
                                                    )}
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        </div>
                    )}
                </div>

                <p className="mt-3 text-[11px] text-gray-300 tabular-nums">
                    {filtered.length} {filtered.length === 1 ? 'user' : 'users'}
                    {filter !== 'all' ? ` · ${filter}` : ''}
                    {search ? ` · "${search}"` : ''}
                </p>
            </div>

            {/* Confirm Reject modal */}
            <ConfirmRejectModal
                user={confirmReject}
                onConfirm={confirmDoReject}
                onCancel={() => setConfirmReject(null)}
            />

            {/* Create User modal */}
            <CreateUserModal
                open={showCreate}
                onClose={() => setShowCreate(false)}
            />

            {/* Toast */}
            {toast && (
                <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2">
                    <div className="flex items-center gap-2 rounded-full bg-gray-900 px-4 py-2 text-[13px] font-medium text-white shadow-xl animate-slide-up">
                        {toast}
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
