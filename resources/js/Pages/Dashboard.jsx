import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, usePage } from '@inertiajs/react';
import { useState, useMemo } from 'react';

/* ─── utils ─────────────────────────────────────────── */
function formatBytes(bytes) {
    if (!bytes) return '—';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
}

function formatDate(str) {
    if (!str) return '—';
    return new Date(str).toLocaleDateString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric',
    });
}

function formatDateShort(str) {
    if (!str) return '—';
    return new Date(str).toLocaleDateString('en-US', {
        year: 'numeric', month: 'short', day: 'numeric',
    });
}

/* ─── icons ──────────────────────────────────────────── */
const Icon = {
    X: ({ className = 'h-3.5 w-3.5' }) => (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
    ),
    Print: ({ className = 'h-3.5 w-3.5' }) => (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 9V2h12v7M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2m-2 0H8m4-6v6" />
        </svg>
    ),
    Export: ({ className = 'h-3.5 w-3.5' }) => (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
        </svg>
    ),
    Download: ({ className = 'h-4 w-4' }) => (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
        </svg>
    ),
    Document: ({ className = 'h-7 w-7' }) => (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
        </svg>
    ),
    Image: ({ className = 'h-7 w-7' }) => (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
        </svg>
    ),
    ChevronDown: ({ className = 'h-3.5 w-3.5' }) => (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
    ),
    ChevronUp: ({ className = 'h-3.5 w-3.5' }) => (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
        </svg>
    ),
};

function FileIcon({ type, className }) {
    if (type?.includes('image')) return <Icon.Image className={className} />;
    return <Icon.Document className={className} />;
}

/* ─── PreviewModal ───────────────────────────────────── */
function PreviewModal({ doc, categoryName, onClose }) {
    const fileUrl = `/${doc.file_path}`;
    const isPdf   = doc.file_type?.includes('pdf');
    const isImage = doc.file_type?.includes('image');

    function handlePrint() {
        const w = window.open(fileUrl, '_blank');
        if (w) w.print();
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-2 sm:p-4"
            onClick={onClose}>
            <div className="flex w-full max-w-4xl max-h-[95vh] flex-col overflow-hidden rounded-2xl border border-black/[0.06] bg-white shadow-2xl"
                onClick={e => e.stopPropagation()}>

                <div className="flex flex-shrink-0 items-center justify-between border-b border-gray-100 bg-[#fafafa] px-4 py-3">
                    <button onClick={onClose}
                        className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors">
                        <Icon.X className="h-3.5 w-3.5" />
                    </button>
                    <div className="flex-1 px-3 text-center min-w-0">
                        <p className="text-[13px] font-medium text-gray-600 truncate">{doc.title}</p>
                        {categoryName && <p className="text-[10px] text-gray-400">{categoryName}</p>}
                    </div>
                    <button onClick={handlePrint}
                        className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-[12px] font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-sm">
                        <Icon.Print className="h-3 w-3" />
                        <span className="hidden sm:inline">Print</span>
                    </button>
                </div>

                <div className="flex-shrink-0 border-b border-gray-100 bg-[#4a4fb5] px-4 py-2">
                    <p className="text-center font-mono text-[11px] font-semibold tracking-widest text-white/70 truncate">
                        {doc.control_number}
                    </p>
                </div>

                {doc.details && (
                    <div className="flex-shrink-0 border-b border-gray-100 bg-gray-50 px-5 py-3">
                        <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400 mb-1">Details</p>
                        <p className="text-[13px] text-gray-700 leading-relaxed whitespace-pre-wrap">{doc.details}</p>
                    </div>
                )}

                <div className="flex-1 overflow-auto bg-[#f5f5f7] flex items-center justify-center min-h-[300px]">
                    {isPdf && <iframe src={fileUrl} className="h-full w-full min-h-[400px] sm:min-h-[500px]" title={doc.title} />}
                    {isImage && <img src={fileUrl} alt={doc.title} className="max-h-[560px] object-contain" />}
                    {!isPdf && !isImage && (
                        <div className="flex flex-col items-center gap-4 p-12 text-center">
                            <span className="flex h-16 w-16 items-center justify-center rounded-2xl border border-gray-200 bg-white shadow-sm">
                                <FileIcon type={doc.file_type} className="h-7 w-7 text-gray-400" />
                            </span>
                            <div>
                                <p className="text-[14px] font-medium text-gray-700">{doc.file_name}</p>
                                <p className="mt-0.5 text-[12px] text-gray-400">{formatBytes(doc.file_size)}</p>
                            </div>
                            <a href={fileUrl} download={doc.file_name}
                                className="flex items-center gap-2 rounded-xl bg-[#4a4fb5] px-5 py-2.5 text-[13px] font-medium text-white hover:bg-[#3a3fa5] transition-colors">
                                <Icon.Download className="h-3.5 w-3.5" />
                                Download
                            </a>
                        </div>
                    )}
                </div>

                <div className="flex flex-shrink-0 items-center justify-between border-t border-gray-100 bg-[#fafafa] px-4 py-3">
                    <div className="flex items-center gap-2 text-[12px] text-gray-500 min-w-0">
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gray-200 text-[9px] font-bold text-gray-600">
                            {doc.uploader?.name?.[0]?.toUpperCase() ?? '?'}
                        </span>
                        <span className="truncate">{doc.uploader?.name ?? '—'}</span>
                        <span className="text-gray-300">·</span>
                        <span className="text-gray-400">{formatDateShort(doc.created_at)}</span>
                    </div>
                    <button onClick={onClose}
                        className="ml-3 shrink-0 rounded-lg border border-gray-200 bg-white px-4 py-1.5 text-[12px] font-medium text-gray-600 hover:bg-gray-50 transition-colors">
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}

/* ─── Main ───────────────────────────────────────────── */
export default function Dashboard({ categories }) {
    const { auth } = usePage().props;
    const user = auth.user;

    /* Flatten all docs sorted by newest first */
    const allDocs = useMemo(() =>
        categories.flatMap(cat =>
            (cat.documents ?? []).map(doc => ({ ...doc, _category: cat.name, _categoryId: cat.id }))
        ).sort((a, b) => new Date(b.created_at) - new Date(a.created_at)),
    [categories]);

    /* Filter state */
    const [keyword,    setKeyword]    = useState('');
    const [catFilter,  setCatFilter]  = useState('');
    const [controlNo,  setControlNo]  = useState('');
    const [dateFrom,   setDateFrom]   = useState('');
    const [dateTo,     setDateTo]     = useState('');
    const [showCount,  setShowCount]  = useState('10');
    const [sortDir,    setSortDir]    = useState('desc');
    const [previewDoc, setPreviewDoc] = useState(null);

    /* Filtered + sorted results */
    const filtered = useMemo(() => {
        let docs = allDocs;

        if (keyword.trim()) {
            const q = keyword.toLowerCase();
            docs = docs.filter(d =>
                d.title?.toLowerCase().includes(q) ||
                d.control_number?.toLowerCase().includes(q) ||
                d.details?.toLowerCase().includes(q) ||
                d.uploader?.name?.toLowerCase().includes(q)
            );
        }

        if (catFilter) {
            docs = docs.filter(d => String(d._categoryId) === catFilter);
        }

        if (controlNo.trim()) {
            const q = controlNo.toLowerCase();
            docs = docs.filter(d => d.control_number?.toLowerCase().includes(q));
        }

        if (dateFrom) {
            docs = docs.filter(d => new Date(d.created_at) >= new Date(dateFrom));
        }

        if (dateTo) {
            docs = docs.filter(d => new Date(d.created_at) <= new Date(dateTo + 'T23:59:59'));
        }

        return [...docs].sort((a, b) => {
            const diff = new Date(b.created_at) - new Date(a.created_at);
            return sortDir === 'desc' ? diff : -diff;
        });
    }, [allDocs, keyword, catFilter, controlNo, dateFrom, dateTo, sortDir]);

    const displayed = showCount === 'all' ? filtered : filtered.slice(0, Number(showCount));
    const latest    = allDocs.slice(0, 6);

    function clearFilters() {
        setKeyword(''); setCatFilter(''); setControlNo(''); setDateFrom(''); setDateTo('');
    }

    function handlePrint() {
        window.print();
    }

    function handleExport() {
        const rows = [
            ['Title', 'Category', 'Control Number', 'Details', 'Uploaded By', 'Date'],
            ...filtered.map(d => [
                `"${(d.title ?? '').replace(/"/g, '""')}"`,
                `"${(d._category ?? '').replace(/"/g, '""')}"`,
                `"${(d.control_number ?? '').replace(/"/g, '""')}"`,
                `"${(d.details ?? '').replace(/"/g, '""')}"`,
                `"${(d.uploader?.name ?? '').replace(/"/g, '""')}"`,
                formatDateShort(d.created_at),
            ]),
        ];
        const csv  = rows.map(r => r.join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url  = URL.createObjectURL(blob);
        const a    = document.createElement('a');
        a.href = url; a.download = 'AID-Documents.csv'; a.click();
        URL.revokeObjectURL(url);
    }

    const roleLabel = { admin: 'Administrator', admin_assistant: 'Admin Assistant', management: 'Management' }[user.role] ?? user.role;

    return (
        <AuthenticatedLayout>
            <Head title="Dashboard" />

            {/* ── Banner ─────────────────────────────────── */}
            <div className="bg-[#4a4fb5] px-6 py-4 flex items-center justify-between">
                <p className="text-[14px] font-semibold text-white leading-snug">
                    Issuances, Memoranda, and Attachments — AID Workspace
                </p>
                <span className="hidden sm:inline-flex items-center rounded border border-white/30 px-3 py-1 text-[11px] font-medium text-white/80">
                    {roleLabel}
                </span>
            </div>

            {/* ── Page body ──────────────────────────────── */}
            <div className="mx-auto max-w-[1280px] w-full px-4 sm:px-6 py-6 flex gap-6 items-start">

                {/* ── Main column ────────────────────────── */}
                <div className="flex-1 min-w-0">

                    {/* Disclaimer + Reminder */}
                    <div className="mb-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="rounded border border-red-200 bg-red-50 px-4 py-3">
                            <p className="text-[13px] font-bold text-red-600 mb-0.5">Disclaimer</p>
                            <p className="text-[12px] text-red-500 leading-relaxed">
                                *Search covers document title, control number, and details. For file content search, open and preview the document directly.
                            </p>
                        </div>
                        <div className="rounded border border-blue-200 bg-blue-50 px-4 py-3">
                            <p className="text-[13px] font-bold text-blue-600 mb-0.5">Reminder</p>
                            <p className="text-[12px] text-blue-500 leading-relaxed">
                                Reset your search by clicking <strong>Clear Filters</strong>.
                            </p>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="mb-4 space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div>
                                <label className="block text-[12px] font-semibold text-gray-700 mb-1">Title / Keywords :</label>
                                <input
                                    type="text"
                                    value={keyword}
                                    onChange={e => setKeyword(e.target.value)}
                                    placeholder="Title/Keywords"
                                    className="w-full rounded border border-gray-300 px-3 py-2 text-[13px] text-gray-800 placeholder-gray-300 focus:border-[#4a4fb5] focus:outline-none transition-colors"
                                />
                            </div>
                            <div>
                                <label className="block text-[12px] font-semibold text-gray-700 mb-1">Category :</label>
                                <div className="relative">
                                    <select
                                        value={catFilter}
                                        onChange={e => setCatFilter(e.target.value)}
                                        className="w-full appearance-none rounded border border-gray-300 px-3 py-2 pr-8 text-[13px] text-gray-800 focus:border-[#4a4fb5] focus:outline-none transition-colors bg-white"
                                    >
                                        <option value="">All Categories</option>
                                        {categories.map(c => (
                                            <option key={c.id} value={String(c.id)}>{c.name}</option>
                                        ))}
                                    </select>
                                    <Icon.ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-[12px] font-semibold text-gray-700 mb-1">Control No :</label>
                                <input
                                    type="text"
                                    value={controlNo}
                                    onChange={e => setControlNo(e.target.value)}
                                    placeholder="Control No"
                                    className="w-full rounded border border-gray-300 px-3 py-2 text-[13px] text-gray-800 placeholder-gray-300 focus:border-[#4a4fb5] focus:outline-none transition-colors"
                                />
                            </div>
                        </div>

                        <div className="flex flex-wrap items-end gap-3">
                            <div>
                                <label className="block text-[12px] font-semibold text-gray-700 mb-1">Date Uploaded :</label>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="date"
                                        value={dateFrom}
                                        onChange={e => setDateFrom(e.target.value)}
                                        className="rounded border border-gray-300 px-3 py-2 text-[13px] text-gray-800 focus:border-[#4a4fb5] focus:outline-none transition-colors"
                                    />
                                    <span className="text-[12px] text-gray-400">to</span>
                                    <input
                                        type="date"
                                        value={dateTo}
                                        onChange={e => setDateTo(e.target.value)}
                                        className="rounded border border-gray-300 px-3 py-2 text-[13px] text-gray-800 focus:border-[#4a4fb5] focus:outline-none transition-colors"
                                    />
                                </div>
                            </div>
                            <button
                                onClick={clearFilters}
                                className="rounded bg-[#5856D6] px-4 py-2 text-[13px] font-semibold text-white hover:bg-[#4a4fcb] transition-colors"
                            >
                                Clear Filters
                            </button>
                        </div>
                    </div>

                    {/* Toolbar: Print / Export / Show entries */}
                    <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                        <div className="flex items-center gap-2">
                            <button
                                onClick={handlePrint}
                                className="flex items-center gap-1.5 rounded border border-gray-300 bg-white px-3 py-1.5 text-[12px] font-medium text-gray-600 hover:bg-gray-50 transition-colors shadow-sm"
                            >
                                <Icon.Print />
                                Print
                            </button>
                            <div className="relative group">
                                <button
                                    onClick={handleExport}
                                    className="flex items-center gap-1.5 rounded border border-gray-300 bg-white px-3 py-1.5 text-[12px] font-medium text-gray-600 hover:bg-gray-50 transition-colors shadow-sm"
                                >
                                    <Icon.Export />
                                    Export
                                    <Icon.ChevronDown className="h-3 w-3 text-gray-400" />
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 text-[12px] text-gray-600">
                            Show
                            <div className="relative">
                                <select
                                    value={showCount}
                                    onChange={e => setShowCount(e.target.value)}
                                    className="appearance-none rounded border border-gray-300 pl-2.5 pr-6 py-1 text-[12px] text-gray-700 focus:border-[#4a4fb5] focus:outline-none bg-white"
                                >
                                    <option value="10">10</option>
                                    <option value="25">25</option>
                                    <option value="50">50</option>
                                    <option value="all">All</option>
                                </select>
                                <Icon.ChevronDown className="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2 h-3 w-3 text-gray-400" />
                            </div>
                            entries
                        </div>
                    </div>

                    {/* Table */}
                    <div className="overflow-hidden rounded border border-gray-200 shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-[#5c6bc0]">
                                        <th className="px-4 py-3 text-[12px] font-semibold text-white">Title / Keywords</th>
                                        <th className="hidden sm:table-cell px-4 py-3 text-[12px] font-semibold text-white whitespace-nowrap">Category</th>
                                        <th className="hidden md:table-cell px-4 py-3 text-[12px] font-semibold text-white whitespace-nowrap">Control No</th>
                                        <th
                                            className="px-4 py-3 text-[12px] font-semibold text-white whitespace-nowrap cursor-pointer select-none"
                                            onClick={() => setSortDir(d => d === 'desc' ? 'asc' : 'desc')}
                                        >
                                            <span className="flex items-center gap-1">
                                                Date Uploaded
                                                {sortDir === 'desc'
                                                    ? <Icon.ChevronDown className="h-3 w-3" />
                                                    : <Icon.ChevronUp className="h-3 w-3" />}
                                            </span>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 bg-white">
                                    {displayed.length === 0 ? (
                                        <tr>
                                            <td colSpan={4} className="px-4 py-10 text-center text-[13px] text-gray-400">
                                                No documents found.
                                            </td>
                                        </tr>
                                    ) : (
                                        displayed.map((doc, i) => (
                                            <tr
                                                key={doc.id}
                                                className={`cursor-pointer transition-colors hover:bg-indigo-50 ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}
                                                onClick={() => setPreviewDoc(doc)}
                                            >
                                                <td className="px-4 py-3">
                                                    <p className="text-[13px] font-medium text-[#4a4fb5] hover:underline leading-snug">
                                                        {doc.title}
                                                    </p>
                                                    {doc.details && (
                                                        <p className="mt-0.5 text-[11px] text-gray-400 truncate max-w-xs">{doc.details}</p>
                                                    )}
                                                    {/* Mobile: show category + control inline */}
                                                    <p className="sm:hidden mt-0.5 text-[11px] text-gray-400">{doc._category}</p>
                                                    <p className="md:hidden sm:block mt-0.5 font-mono text-[10px] text-gray-400">{doc.control_number}</p>
                                                </td>
                                                <td className="hidden sm:table-cell px-4 py-3 text-[12px] text-gray-600 whitespace-nowrap">
                                                    {doc._category}
                                                </td>
                                                <td className="hidden md:table-cell px-4 py-3">
                                                    <span className="font-mono text-[11px] text-gray-600 leading-snug">
                                                        {doc.control_number}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-[12px] text-gray-600 whitespace-nowrap">
                                                    {formatDate(doc.created_at)}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Count */}
                    <p className="mt-2 text-[11px] text-gray-400">
                        Showing {displayed.length} of {filtered.length} result{filtered.length !== 1 ? 's' : ''}
                        {allDocs.length !== filtered.length && ` (${allDocs.length} total)`}
                    </p>
                </div>

                {/* ── Sidebar ─────────────────────────────── */}
                <aside className="hidden lg:block w-64 flex-shrink-0">
                    <p className="text-[14px] font-bold text-gray-900 mb-4 leading-snug">
                        Latest Uploaded Documents:
                    </p>
                    <div className="space-y-4">
                        {latest.length === 0 ? (
                            <p className="text-[12px] text-gray-400">No documents yet.</p>
                        ) : (
                            latest.map(doc => (
                                <div key={doc.id} className="border-b border-gray-100 pb-4">
                                    <button
                                        onClick={() => setPreviewDoc(doc)}
                                        className="text-[13px] font-medium text-[#4a4fb5] hover:underline text-left leading-snug"
                                    >
                                        {doc.control_number && (
                                            <span className="block font-mono text-[10px] text-gray-400 mb-0.5">{doc.control_number}</span>
                                        )}
                                        {doc.title}
                                    </button>
                                    <p className="mt-1 text-[11px] text-gray-400">{formatDateShort(doc.created_at)}</p>
                                    <button
                                        onClick={() => setPreviewDoc(doc)}
                                        className="mt-0.5 text-[12px] font-semibold text-[#4a4fb5] hover:underline"
                                    >
                                        Read More »
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </aside>
            </div>

            {/* Preview modal */}
            {previewDoc && (
                <PreviewModal
                    doc={previewDoc}
                    categoryName={categories.find(c => c.id === (previewDoc._categoryId ?? previewDoc.category_id))?.name}
                    onClose={() => setPreviewDoc(null)}
                />
            )}
        </AuthenticatedLayout>
    );
}
