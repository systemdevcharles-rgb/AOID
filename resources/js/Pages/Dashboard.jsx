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
    return new Date(str).toLocaleDateString('en-US', {
        year: 'numeric', month: 'short', day: 'numeric',
    });
}

/* ─── icons ──────────────────────────────────────────── */
const Icon = {
    Document: ({ className = 'h-4 w-4' }) => (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
        </svg>
    ),
    Image: ({ className = 'h-4 w-4' }) => (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
        </svg>
    ),
    Eye: ({ className = 'h-3.5 w-3.5' }) => (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
    ),
    X: ({ className = 'h-3.5 w-3.5' }) => (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
    ),
    Search: ({ className = 'h-4 w-4' }) => (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 15.803 7.5 7.5 0 0015.803 15.803z" />
        </svg>
    ),
    Print: ({ className = 'h-3.5 w-3.5' }) => (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 9V2h12v7M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2m-2 0H8m4-6v6" />
        </svg>
    ),
    Download: ({ className = 'h-4 w-4' }) => (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
        </svg>
    ),
    Inbox: ({ className = 'h-10 w-10' }) => (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 13.5h3.86a2.25 2.25 0 012.012 1.244l.256.512a2.25 2.25 0 002.013 1.244h3.218a2.25 2.25 0 002.013-1.244l.256-.512a2.25 2.25 0 012.013-1.244h3.859m-19.5.338V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18v-4.162c0-.224-.034-.447-.1-.661L19.24 5.338a2.25 2.25 0 00-2.15-1.588H6.911a2.25 2.25 0 00-2.15 1.588L2.35 13.177a2.25 2.25 0 00-.1.661z" />
        </svg>
    ),
    Folder: ({ className = 'h-10 w-10' }) => (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
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

                {/* Header */}
                <div className="flex flex-shrink-0 items-center justify-between border-b border-gray-100 bg-[#fafafa] px-4 py-3">
                    <button onClick={onClose}
                        className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-800 transition-colors">
                        <Icon.X className="h-3.5 w-3.5" />
                    </button>
                    <div className="flex-1 px-3 text-center min-w-0">
                        <p className="text-[13px] font-medium text-gray-600 truncate">{doc.title}</p>
                        {categoryName && (
                            <p className="text-[10px] text-gray-400 truncate">{categoryName}</p>
                        )}
                    </div>
                    <button onClick={handlePrint}
                        className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-[12px] font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-sm">
                        <Icon.Print className="h-3 w-3" />
                        <span className="hidden sm:inline">Print</span>
                    </button>
                </div>

                {/* Control number strip */}
                <div className="flex-shrink-0 border-b border-gray-100 bg-gray-900 px-4 py-2">
                    <p className="text-center font-mono text-[11px] font-semibold tracking-widest text-gray-400 truncate">
                        {doc.control_number}
                    </p>
                </div>

                {/* Details strip */}
                {doc.details && (
                    <div className="flex-shrink-0 border-b border-gray-100 bg-gray-50 px-5 py-3">
                        <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400 mb-1">Details</p>
                        <p className="text-[13px] text-gray-700 leading-relaxed whitespace-pre-wrap">{doc.details}</p>
                    </div>
                )}

                {/* Preview */}
                <div className="flex-1 overflow-auto bg-[#f5f5f7] flex items-center justify-center min-h-[300px] sm:min-h-[400px]">
                    {isPdf && <iframe src={fileUrl} className="h-full w-full min-h-[400px] sm:min-h-[500px]" title={doc.title} />}
                    {isImage && <img src={fileUrl} alt={doc.title} className="max-h-[400px] sm:max-h-[560px] object-contain" />}
                    {!isPdf && !isImage && (
                        <div className="flex flex-col items-center gap-4 p-8 sm:p-12 text-center">
                            <span className="flex h-16 w-16 items-center justify-center rounded-2xl border border-gray-200 bg-white shadow-sm">
                                <FileIcon type={doc.file_type} className="h-7 w-7 text-gray-400" />
                            </span>
                            <div>
                                <p className="text-[14px] font-medium text-gray-700">{doc.file_name}</p>
                                <p className="mt-0.5 text-[12px] text-gray-400">{formatBytes(doc.file_size)}</p>
                            </div>
                            <a href={fileUrl} download={doc.file_name}
                                className="flex items-center gap-2 rounded-xl bg-gray-900 px-5 py-2.5 text-[13px] font-medium text-white hover:bg-gray-700 transition-colors">
                                <Icon.Download className="h-3.5 w-3.5" />
                                Download
                            </a>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex flex-shrink-0 items-center justify-between border-t border-gray-100 bg-[#fafafa] px-4 py-3">
                    <div className="flex items-center gap-2 text-[12px] text-gray-500 min-w-0">
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gray-200 text-[9px] font-bold text-gray-600">
                            {doc.uploader?.name?.[0]?.toUpperCase() ?? '?'}
                        </span>
                        <span className="truncate">{doc.uploader?.name ?? '—'}</span>
                        <span className="text-gray-300 hidden sm:inline">·</span>
                        <span className="text-gray-400 hidden sm:inline">{formatDate(doc.created_at)}</span>
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

/* ─── DocumentsTable ─────────────────────────────────── */
function DocumentsTable({ documents, onPreview, showCategory = false }) {
    if (documents.length === 0) {
        return (
            <div className="flex h-64 flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-gray-200 bg-white text-center">
                <Icon.Inbox className="text-gray-200" />
                <p className="text-[13px] font-medium text-gray-400">No documents found</p>
            </div>
        );
    }

    return (
        <div className="overflow-hidden rounded-2xl border border-black/[0.06] bg-white shadow-sm">
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b border-gray-100 bg-[#fafafa]">
                            <th className="w-12 px-4 py-3" />
                            <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-gray-400">Document</th>
                            {showCategory && (
                                <th className="hidden sm:table-cell px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-gray-400">Category</th>
                            )}
                            <th className="hidden sm:table-cell px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-gray-400">Control Number</th>
                            <th className="hidden lg:table-cell px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-gray-400">Attached By</th>
                            <th className="hidden lg:table-cell px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-gray-400">Date</th>
                            <th className="hidden md:table-cell px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-gray-400">Size</th>
                            <th className="w-14 px-4 py-3" />
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {documents.map(doc => (
                            <tr key={doc.id}
                                className="group cursor-pointer transition-colors duration-100 hover:bg-gray-50"
                                onClick={() => onPreview(doc)}>

                                <td className="px-4 py-3.5">
                                    <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-100 bg-gray-50">
                                        <FileIcon type={doc.file_type} className="h-4 w-4 text-gray-400" />
                                    </span>
                                </td>

                                <td className="px-4 py-3.5 min-w-[160px]">
                                    <p className="text-[13px] font-semibold text-gray-900 leading-snug">{doc.title}</p>
                                    {doc.details && (
                                        <p className="mt-0.5 text-[11px] text-gray-400 truncate max-w-[220px]">{doc.details}</p>
                                    )}
                                    <p className="sm:hidden mt-1 font-mono text-[10px] text-gray-400 truncate max-w-[200px]">{doc.control_number}</p>
                                </td>

                                {showCategory && (
                                    <td className="hidden sm:table-cell px-4 py-3.5">
                                        <span className="inline-block rounded-full border border-gray-100 bg-gray-50 px-2.5 py-1 text-[11px] font-medium text-gray-600 whitespace-nowrap">
                                            {doc._categoryName}
                                        </span>
                                    </td>
                                )}

                                <td className="hidden sm:table-cell px-4 py-3.5">
                                    <div className="inline-block max-w-[200px] rounded-lg border border-gray-100 bg-[#fafafa] px-2.5 py-1.5">
                                        <p className="truncate font-mono text-[10px] font-medium text-gray-500 leading-snug">
                                            {doc.control_number}
                                        </p>
                                    </div>
                                </td>

                                <td className="hidden lg:table-cell px-4 py-3.5">
                                    <div className="flex items-center gap-2">
                                        <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-gray-100 text-[8px] font-bold text-gray-500">
                                            {doc.uploader?.name?.[0]?.toUpperCase() ?? '?'}
                                        </span>
                                        <span className="text-[12px] text-gray-700">{doc.uploader?.name ?? '—'}</span>
                                    </div>
                                </td>

                                <td className="hidden lg:table-cell px-4 py-3.5">
                                    <p className="text-[12px] text-gray-500 whitespace-nowrap">{formatDate(doc.created_at)}</p>
                                </td>

                                <td className="hidden md:table-cell px-4 py-3.5">
                                    <p className="text-[12px] text-gray-400 tabular-nums">{formatBytes(doc.file_size)}</p>
                                </td>

                                <td className="px-4 py-3.5" onClick={e => e.stopPropagation()}>
                                    <div className="flex items-center justify-end opacity-100 sm:opacity-0 sm:transition-opacity sm:duration-100 sm:group-hover:opacity-100">
                                        <button onClick={() => onPreview(doc)}
                                            className="flex h-7 w-7 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-400 shadow-sm hover:text-gray-700 transition-colors"
                                            title="View">
                                            <Icon.Eye />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="border-t border-gray-100 bg-[#fafafa] px-4 py-2.5">
                <p className="text-[11px] text-gray-400">
                    {documents.length} document{documents.length !== 1 ? 's' : ''}
                </p>
            </div>
        </div>
    );
}

/* ─── Main ───────────────────────────────────────────── */
export default function Dashboard({ categories }) {
    const { auth } = usePage().props;
    const user = auth.user;

    const [selectedId, setSelectedId] = useState(categories[0]?.id ?? null);
    const [query, setQuery]           = useState('');
    const [previewDoc, setPreviewDoc] = useState(null);
    const [previewCat, setPreviewCat] = useState(null);

    const totalDocs = categories.reduce((n, c) => n + (c.documents?.length ?? 0), 0);

    // Flatten all documents with their category name for search
    const allDocuments = useMemo(() => {
        return categories.flatMap(cat =>
            (cat.documents ?? []).map(doc => ({ ...doc, _categoryName: cat.name, _categoryId: cat.id }))
        );
    }, [categories]);

    // Search results
    const searchResults = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return null;
        return allDocuments.filter(doc =>
            doc.title?.toLowerCase().includes(q) ||
            doc.control_number?.toLowerCase().includes(q) ||
            doc.details?.toLowerCase().includes(q) ||
            doc._categoryName?.toLowerCase().includes(q) ||
            doc.uploader?.name?.toLowerCase().includes(q)
        );
    }, [query, allDocuments]);

    const activeCategory  = categories.find(c => c.id === selectedId);
    const visibleDocuments = searchResults ?? (activeCategory?.documents ?? []);
    const isSearching     = searchResults !== null;

    function handlePreview(doc) {
        const cat = categories.find(c => c.id === (doc._categoryId ?? doc.category_id));
        setPreviewDoc(doc);
        setPreviewCat(cat?.name ?? null);
    }

    const roleLabel = {
        admin:           'Administrator',
        admin_assistant: 'Admin Assistant',
        management:      'Management',
    }[user.role] ?? user.role;

    return (
        <AuthenticatedLayout>
            <Head title="Dashboard" />

            <div className="flex h-[calc(100vh-3rem)] flex-col overflow-hidden">

                {/* Mobile category chips */}
                <div className="flex md:hidden shrink-0 items-center gap-1.5 overflow-x-auto border-b border-black/[0.06] bg-white px-3 py-2">
                    {categories.map(cat => (
                        <button key={cat.id}
                            onClick={() => { setSelectedId(cat.id); setQuery(''); }}
                            className={`flex-shrink-0 rounded-full px-3 py-1.5 text-[12px] font-medium whitespace-nowrap transition-colors ${
                                cat.id === selectedId && !isSearching
                                    ? 'bg-gray-900 text-white'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}>
                            {cat.name}
                            <span className={`ml-1.5 text-[10px] tabular-nums ${cat.id === selectedId && !isSearching ? 'text-white/60' : 'text-gray-400'}`}>
                                {cat.documents?.length ?? 0}
                            </span>
                        </button>
                    ))}
                </div>

                {/* Two-panel layout */}
                <div className="flex flex-1 overflow-hidden">

                    {/* Sidebar */}
                    <aside className="hidden md:flex w-60 flex-shrink-0 flex-col overflow-hidden border-r border-black/[0.06] bg-white">
                        <div className="border-b border-gray-100 px-4 py-3">
                            <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">Categories</p>
                        </div>

                        <div className="flex-1 overflow-y-auto p-2">
                            {categories.length === 0 ? (
                                <div className="rounded-xl border border-dashed border-gray-200 px-4 py-6 text-center">
                                    <p className="text-[12px] text-gray-400">No categories yet</p>
                                </div>
                            ) : (
                                <ul className="space-y-0.5">
                                    {categories.map(cat => {
                                        const active = cat.id === selectedId && !isSearching;
                                        return (
                                            <li key={cat.id}>
                                                <button
                                                    onClick={() => { setSelectedId(cat.id); setQuery(''); }}
                                                    className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left transition-all duration-100 ${
                                                        active ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                                    }`}>
                                                    <span className="truncate text-[13px] font-medium">{cat.name}</span>
                                                    <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold tabular-nums ${
                                                        active ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'
                                                    }`}>
                                                        {cat.documents?.length ?? 0}
                                                    </span>
                                                </button>
                                            </li>
                                        );
                                    })}
                                </ul>
                            )}
                        </div>

                        {/* User info */}
                        <div className="border-t border-gray-100 p-3">
                            <div className="flex items-center gap-2.5 rounded-xl bg-gray-50 px-3 py-2.5">
                                <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-gray-200 text-[9px] font-bold text-gray-600">
                                    {user.name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()}
                                </span>
                                <div className="min-w-0">
                                    <p className="truncate text-[12px] font-semibold text-gray-700">{user.name}</p>
                                    <p className="text-[10px] font-medium uppercase tracking-wide text-gray-400">{roleLabel}</p>
                                </div>
                            </div>
                        </div>
                    </aside>

                    {/* Main area */}
                    <div className="flex flex-1 flex-col overflow-hidden bg-[#f5f5f7]">

                        {/* Toolbar with search */}
                        <div className="flex flex-shrink-0 items-center justify-between border-b border-black/[0.06] bg-white px-4 sm:px-6 py-3 gap-3">
                            <div className="min-w-0">
                                <p className="text-[14px] font-semibold text-gray-900 truncate">
                                    {isSearching
                                        ? `Search results`
                                        : (activeCategory?.name ?? 'Dashboard')}
                                </p>
                                <p className="text-[11px] text-gray-400">
                                    {isSearching
                                        ? `${searchResults.length} result${searchResults.length !== 1 ? 's' : ''} for "${query}"`
                                        : `${totalDocs} doc${totalDocs !== 1 ? 's' : ''} · ${categories.length} categor${categories.length !== 1 ? 'ies' : 'y'}`}
                                </p>
                            </div>

                            {/* Search input */}
                            <div className="relative flex-shrink-0 w-full max-w-xs">
                                <Icon.Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 pointer-events-none" />
                                <input
                                    type="text"
                                    value={query}
                                    onChange={e => setQuery(e.target.value)}
                                    placeholder="Search documents…"
                                    className="w-full rounded-xl border border-gray-200 bg-gray-50 pl-9 pr-8 py-2 text-[13px] text-gray-800 placeholder-gray-300 focus:border-gray-400 focus:outline-none transition-colors"
                                />
                                {query && (
                                    <button
                                        onClick={() => setQuery('')}
                                        className="absolute right-2.5 top-1/2 -translate-y-1/2 flex h-4 w-4 items-center justify-center rounded-full bg-gray-200 text-gray-500 hover:bg-gray-300 transition-colors">
                                        <Icon.X className="h-2.5 w-2.5" />
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
                            {categories.length === 0 ? (
                                <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
                                    <Icon.Folder className="text-gray-200" />
                                    <p className="text-[14px] font-medium text-gray-400">No categories yet</p>
                                </div>
                            ) : (
                                <>
                                    {!isSearching && activeCategory && (
                                        <div className="mb-4 flex items-center gap-2">
                                            <span className="rounded-full border border-gray-200 bg-white px-3 py-1 text-[12px] font-semibold text-gray-600 shadow-sm">
                                                {activeCategory.name}
                                            </span>
                                            <span className="text-[11px] text-gray-400">
                                                {visibleDocuments.length} document{visibleDocuments.length !== 1 ? 's' : ''}
                                            </span>
                                        </div>
                                    )}

                                    <DocumentsTable
                                        documents={visibleDocuments}
                                        onPreview={handlePreview}
                                        showCategory={isSearching}
                                    />
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {previewDoc && (
                <PreviewModal
                    doc={previewDoc}
                    categoryName={previewCat}
                    onClose={() => { setPreviewDoc(null); setPreviewCat(null); }}
                />
            )}
        </AuthenticatedLayout>
    );
}
