import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, usePage, router } from '@inertiajs/react';
import { useState, useRef, useEffect } from 'react';

/* ─── utils ────────────────────────────────────────── */
function formatBytes(bytes) {
    if (!bytes) return '—';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
}

function formatDate(str) {
    return new Date(str).toLocaleDateString('en-US', {
        year: 'numeric', month: 'short', day: 'numeric',
        hour: '2-digit', minute: '2-digit',
    });
}

/* ─── icons ─────────────────────────────────────────── */
const Icon = {
    X: ({ className = 'h-3.5 w-3.5' }) => (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
    ),
    Plus: ({ className = 'h-3.5 w-3.5' }) => (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
    ),
    Paperclip: ({ className = 'h-3.5 w-3.5' }) => (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.32m.009-.01-.01.01m5.699-9.941-7.81 7.81a1.5 1.5 0 002.112 2.13" />
        </svg>
    ),
    Print: ({ className = 'h-3.5 w-3.5' }) => (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 9V2h12v7M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2m-2 0H8m4-6v6" />
        </svg>
    ),
    Check: ({ className = 'h-4 w-4' }) => (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
    ),
    Warning: ({ className = 'h-5 w-5' }) => (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
        </svg>
    ),
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
    Upload: ({ className = 'h-7 w-7' }) => (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0 3 3m-3-3-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.338-2.328A4.5 4.5 0 0117.25 19.5H6.75z" />
        </svg>
    ),
    Download: ({ className = 'h-4 w-4' }) => (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
        </svg>
    ),
    Chevron: ({ className = 'h-3 w-3' }) => (
        <svg className={className} fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M7.293 4.293a1 1 0 011.414 0L14 9.586l-5.293 5.293a1 1 0 01-1.414-1.414L11.586 9 7.293 4.707a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
    ),
    Folder: ({ className = 'h-10 w-10' }) => (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
        </svg>
    ),
    Inbox: ({ className = 'h-10 w-10' }) => (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 13.5h3.86a2.25 2.25 0 012.012 1.244l.256.512a2.25 2.25 0 002.013 1.244h3.218a2.25 2.25 0 002.013-1.244l.256-.512a2.25 2.25 0 012.013-1.244h3.859m-19.5.338V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18v-4.162c0-.224-.034-.447-.1-.661L19.24 5.338a2.25 2.25 0 00-2.15-1.588H6.911a2.25 2.25 0 00-2.15 1.588L2.35 13.177a2.25 2.25 0 00-.1.661z" />
        </svg>
    ),
    Eye: ({ className = 'h-3.5 w-3.5' }) => (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
    ),
    Trash: ({ className = 'h-3.5 w-3.5' }) => (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
        </svg>
    ),
    Menu: ({ className = 'h-4 w-4' }) => (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
    ),
};

function FileIcon({ type, className }) {
    if (type?.includes('image')) return <Icon.Image className={className} />;
    return <Icon.Document className={className} />;
}

/* ─── Toast ─────────────────────────────────────────── */
function Toast({ message, onDone }) {
    useEffect(() => {
        const t = setTimeout(onDone, 3000);
        return () => clearTimeout(t);
    }, []);
    return (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 animate-slide-up px-4">
            <div className="flex items-center gap-2.5 rounded-full border border-black/[0.06] bg-gray-900 px-4 py-2.5 text-[13px] text-white shadow-xl">
                <Icon.Check className="h-3.5 w-3.5 text-white/70" />
                {message}
            </div>
        </div>
    );
}

/* ─── Modal shell ────────────────────────────────────── */
function Modal({ title, onClose, children, size = 'sm' }) {
    const maxW = { lg: 'max-w-4xl', md: 'max-w-md', sm: 'max-w-sm' }[size] ?? 'max-w-sm';
    return (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/30 backdrop-blur-sm sm:items-center p-4 sm:p-4"
            onClick={onClose}>
            <div className={`flex w-full ${maxW} flex-col overflow-hidden rounded-2xl border border-black/[0.06] bg-white shadow-2xl`}
                onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
                    <p className="text-[14px] font-semibold text-gray-900">{title}</p>
                    <button onClick={onClose}
                        className="flex h-6 w-6 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors">
                        <Icon.X className="h-3.5 w-3.5" />
                    </button>
                </div>
                {children}
            </div>
        </div>
    );
}

/* ─── Field ──────────────────────────────────────────── */
function Field({ label, error, children, hint }) {
    return (
        <div>
            <label className="mb-1.5 block text-[12px] font-semibold text-gray-500 uppercase tracking-wide">{label}</label>
            {children}
            {hint && !error && <p className="mt-1 text-[11px] text-gray-400">{hint}</p>}
            {error && <p className="mt-1 text-[11px] text-red-500">{error}</p>}
        </div>
    );
}

/* ─── ConfirmDialog (admin) ──────────────────────────── */
function ConfirmDialog({ doc, onConfirm, onCancel }) {
    return (
        <Modal title="Delete Document" onClose={onCancel} size="sm">
            <div className="p-5">
                <div className="mb-5 flex items-start gap-3">
                    <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border border-red-100 bg-red-50">
                        <Icon.Warning className="h-4 w-4 text-red-500" />
                    </span>
                    <div>
                        <p className="text-[13px] font-semibold text-gray-900">{doc.title}</p>
                        <p className="mt-0.5 text-[12px] text-gray-500">This document will be permanently deleted and cannot be recovered.</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button onClick={onCancel}
                        className="flex-1 rounded-xl border border-gray-200 py-2 text-[13px] font-medium text-gray-600 hover:bg-gray-50 transition-colors">
                        Cancel
                    </button>
                    <button onClick={onConfirm}
                        className="flex-1 rounded-xl bg-red-500 py-2 text-[13px] font-semibold text-white hover:bg-red-600 transition-colors">
                        Delete
                    </button>
                </div>
            </div>
        </Modal>
    );
}

/* ─── DeletionReasonModal (admin assistant) ──────────── */
function DeletionReasonModal({ doc, onClose }) {
    const [reason, setReason]   = useState('');
    const [error, setError]     = useState('');
    const [loading, setLoading] = useState(false);

    function submit(e) {
        e.preventDefault();
        if (reason.trim().length < 10) {
            setError('Please provide at least 10 characters explaining the reason.');
            return;
        }
        setError('');
        setLoading(true);
        router.delete(route('aid.documents.destroy', doc.id), {
            data:      { reason: reason.trim() },
            onSuccess: onClose,
            onError:   () => { setLoading(false); setError('Something went wrong. Please try again.'); },
        });
    }

    return (
        <Modal title="State Reason for Deletion" onClose={onClose} size="md">
            <form onSubmit={submit} className="p-5 space-y-4">
                <div className="flex items-start gap-3 rounded-xl border border-amber-100 bg-amber-50 p-3.5">
                    <Icon.Warning className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-500" />
                    <div>
                        <p className="text-[12px] font-semibold text-amber-800">Deletion requires a reason</p>
                        <p className="mt-0.5 text-[12px] text-amber-700">
                            As an Admin Assistant, all document deletions are logged. Please state a clear reason before proceeding.
                        </p>
                    </div>
                </div>

                <div className="rounded-xl border border-gray-100 bg-[#fafafa] px-4 py-3">
                    <p className="text-[12px] font-semibold text-gray-700">{doc.title}</p>
                    <p className="mt-0.5 font-mono text-[10px] text-gray-400">{doc.control_number}</p>
                </div>

                <Field label="Reason for Deletion" error={error}>
                    <textarea
                        value={reason}
                        onChange={e => setReason(e.target.value)}
                        rows={4}
                        placeholder="Describe why this document should be deleted…"
                        className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-[13px] text-gray-800 placeholder-gray-300 focus:border-gray-400 focus:ring-0 focus:outline-none transition-colors"
                    />
                    <p className="mt-1 text-right text-[11px] text-gray-300">{reason.length} / 500</p>
                </Field>

                <div className="flex gap-2 pt-1">
                    <button type="button" onClick={onClose}
                        className="flex-1 rounded-xl border border-gray-200 py-2.5 text-[13px] font-medium text-gray-600 hover:bg-gray-50 transition-colors">
                        Cancel
                    </button>
                    <button type="submit" disabled={loading}
                        className="flex-1 rounded-xl bg-red-500 py-2.5 text-[13px] font-semibold text-white hover:bg-red-600 disabled:opacity-40 transition-colors">
                        {loading ? 'Deleting…' : 'Submit & Delete'}
                    </button>
                </div>
            </form>
        </Modal>
    );
}

/* ─── PreviewModal ───────────────────────────────────── */
function PreviewModal({ doc, onClose }) {
    const fileUrl = `/secure/documents/${doc.id}`;
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
                    <p className="flex-1 px-3 text-center text-[13px] font-medium text-gray-600 truncate">{doc.title}</p>
                    <button onClick={handlePrint}
                        className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-[12px] font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-sm">
                        <Icon.Print className="h-3 w-3" />
                        <span className="hidden sm:inline">Print</span>
                    </button>
                </div>

                {/* Control number strip */}
                <div className="flex-shrink-0 border-b border-gray-100 bg-[#4a4fb5] px-4 py-2">
                    <p className="text-center font-mono text-[11px] font-semibold tracking-widest text-white/70 truncate">
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
                                className="flex items-center gap-2 rounded-xl bg-[#4a4fb5] px-5 py-2.5 text-[13px] font-medium text-white hover:bg-[#3a3fa5] transition-colors">
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

/* ─── CustomSelect ───────────────────────────────────── */
function CustomSelect({ options, value, onChange }) {
    const [open, setOpen] = useState(false);
    const ref = useRef();

    useEffect(() => {
        function handler(e) {
            if (ref.current && !ref.current.contains(e.target)) setOpen(false);
        }
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const selected = options.find(o => o.value === value);

    return (
        <div className="relative" ref={ref}>
            <button
                type="button"
                onClick={() => setOpen(v => !v)}
                className={`flex w-full items-center justify-between rounded-xl border bg-gray-50 px-3 py-2.5 text-[13px] text-gray-800 transition-colors focus:outline-none ${
                    open ? 'border-gray-400' : 'border-gray-200 hover:border-gray-300'
                }`}
            >
                <span className={selected ? 'text-gray-800' : 'text-gray-400'}>
                    {selected?.label ?? 'Select a category…'}
                </span>
                <svg
                    className={`h-4 w-4 flex-shrink-0 text-gray-400 transition-transform duration-150 ${open ? '-rotate-180' : ''}`}
                    fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {open && (
                <div className="absolute left-0 right-0 top-full z-50 mt-1.5 overflow-hidden rounded-xl border border-black/[0.06] bg-white shadow-xl">
                    <div className="max-h-48 overflow-y-auto py-1">
                        {options.map(opt => (
                            <button
                                key={opt.value}
                                type="button"
                                onClick={() => { onChange(opt.value); setOpen(false); }}
                                className={`flex w-full items-center justify-between px-3.5 py-2.5 text-left text-[13px] transition-colors hover:bg-gray-50 ${
                                    opt.value === value ? 'font-semibold text-gray-900' : 'font-normal text-gray-600'
                                }`}
                            >
                                <span>{opt.label}</span>
                                {opt.value === value && <Icon.Check className="h-3.5 w-3.5 flex-shrink-0 text-green-600" />}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

/* ─── AttachModal ────────────────────────────────────── */
function AttachModal({ categories, defaultCategoryId, onClose }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        category_id:    defaultCategoryId ?? categories[0]?.id ?? '',
        control_number: '',
        title:          '',
        details:        '',
        file:           null,
    });
    const fileRef = useRef();

    function submit(e) {
        e.preventDefault();
        post(route('aid.documents.store'), {
            forceFormData: true,
            onSuccess: () => { reset(); onClose(); },
        });
    }

    function clearFile(e) {
        e.stopPropagation();
        setData('file', null);
        if (fileRef.current) fileRef.current.value = '';
    }

    return (
        <Modal title="Attach Document" onClose={onClose} size="md">
            <form onSubmit={submit} className="p-5 space-y-3.5">

                <Field label="Category" error={errors.category_id}>
                    <CustomSelect
                        options={categories.map(c => ({ value: c.id, label: c.name }))}
                        value={data.category_id}
                        onChange={val => setData('category_id', val)}
                    />
                </Field>

                <Field
                    label="Control Number"
                    error={errors.control_number}
                    hint="Enter the document's existing control number exactly as written."
                >
                    <input
                        type="text"
                        value={data.control_number}
                        onChange={e => setData('control_number', e.target.value)}
                        placeholder="e.g. MEMORANDUM NO. 2024-001"
                        className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 font-mono text-[13px] text-gray-800 placeholder-gray-300 focus:border-gray-400 focus:ring-0 focus:outline-none transition-colors"
                    />
                </Field>

                <Field label="Document Title" error={errors.title}>
                    <input
                        type="text"
                        value={data.title}
                        onChange={e => setData('title', e.target.value)}
                        placeholder="e.g. Personnel Policy Update"
                        className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-[13px] text-gray-800 placeholder-gray-300 focus:border-gray-400 focus:ring-0 focus:outline-none transition-colors"
                    />
                </Field>

                <Field label="Document Details" error={errors.details}>
                    <textarea
                        value={data.details}
                        onChange={e => setData('details', e.target.value)}
                        rows={3}
                        placeholder="Brief description or notes about this document…"
                        className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-[13px] text-gray-800 placeholder-gray-300 focus:border-gray-400 focus:ring-0 focus:outline-none transition-colors"
                    />
                </Field>

                <Field label="File" error={errors.file}>
                    {data.file ? (
                        <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-3">
                            <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-white shadow-sm">
                                <FileIcon type={data.file.type} className="h-4 w-4 text-gray-500" />
                            </span>
                            <div className="min-w-0 flex-1">
                                <p className="truncate text-[13px] font-medium text-gray-800">{data.file.name}</p>
                                <p className="text-[11px] text-gray-400">{formatBytes(data.file.size)}</p>
                            </div>
                            <button type="button" onClick={clearFile}
                                className="flex-shrink-0 rounded-lg border border-gray-200 bg-white px-2.5 py-1 text-[11px] font-medium text-gray-500 hover:bg-gray-100 transition-colors">
                                Change
                            </button>
                        </div>
                    ) : (
                        <div onClick={() => fileRef.current?.click()}
                            className="flex cursor-pointer items-center gap-4 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 px-4 py-4 hover:border-gray-300 hover:bg-gray-100 transition-colors">
                            <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl border border-gray-200 bg-white shadow-sm">
                                <Icon.Upload className="h-5 w-5 text-gray-400" />
                            </span>
                            <div>
                                <p className="text-[13px] font-medium text-gray-700">Click to choose a file</p>
                                <p className="mt-0.5 text-[11px] text-gray-400">PDF, DOC, or Image — max 25 MB</p>
                            </div>
                        </div>
                    )}
                    <input ref={fileRef} type="file" className="hidden"
                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                        onChange={e => setData('file', e.target.files[0])} />
                </Field>

                <div className="flex gap-2 border-t border-gray-100 pt-4">
                    <button type="button" onClick={onClose}
                        className="flex-1 rounded-xl border border-gray-200 py-2.5 text-[13px] font-medium text-gray-600 hover:bg-gray-50 transition-colors">
                        Cancel
                    </button>
                    <button type="submit" disabled={processing}
                        className="flex-1 rounded-xl bg-[#4a4fb5] py-2.5 text-[13px] font-semibold text-white hover:bg-[#3a3fa5] disabled:opacity-40 transition-colors">
                        {processing ? 'Attaching…' : 'Attach'}
                    </button>
                </div>
            </form>
        </Modal>
    );
}

/* ─── AddCategoryModal ───────────────────────────────── */
const DEFAULT_CATEGORIES = [
    'Memorandum', 'Memorandum Circular', 'Administrative Order',
    'Department Order', 'Office Order', 'Notice of Implementation',
];

function AddCategoryModal({ existingNames, onClose }) {
    const { data, setData, post, processing, errors, reset } = useForm({ name: '' });
    const [showSugg, setShowSugg] = useState(false);

    const suggestions = DEFAULT_CATEGORIES.filter(
        s => !existingNames.map(n => n.toLowerCase()).includes(s.toLowerCase())
    );

    function submit(e) {
        e.preventDefault();
        post(route('aid.categories.store'), {
            onSuccess: () => { reset(); onClose(); },
        });
    }

    return (
        <Modal title="New Category" onClose={onClose} size="sm">
            <form onSubmit={submit} className="p-5 space-y-4">
                <Field label="Category Name" error={errors.name}>
                    <input type="text" value={data.name} onChange={e => setData('name', e.target.value)}
                        placeholder="e.g. Memorandum"
                        className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-[13px] text-gray-800 placeholder-gray-300 focus:border-gray-400 focus:ring-0 focus:outline-none transition-colors"
                        autoFocus />
                </Field>

                {suggestions.length > 0 && (
                    <div>
                        <button type="button" onClick={() => setShowSugg(v => !v)}
                            className="flex items-center gap-1 text-[12px] text-gray-400 hover:text-gray-600 transition-colors">
                            <Icon.Chevron className={`h-2.5 w-2.5 transition-transform duration-150 ${showSugg ? 'rotate-90' : ''}`} />
                            Suggestions ({suggestions.length})
                        </button>
                        {showSugg && (
                            <div className="mt-2 flex flex-wrap gap-1.5">
                                {suggestions.map(s => (
                                    <button key={s} type="button" onClick={() => setData('name', s)}
                                        className="rounded-lg border border-gray-200 bg-gray-50 px-2.5 py-1 text-[12px] font-medium text-gray-600 hover:border-gray-300 hover:bg-gray-100 transition-colors">
                                        {s}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                <div className="flex gap-2 pt-1">
                    <button type="button" onClick={onClose}
                        className="flex-1 rounded-xl border border-gray-200 py-2.5 text-[13px] font-medium text-gray-600 hover:bg-gray-50 transition-colors">
                        Cancel
                    </button>
                    <button type="submit" disabled={processing}
                        className="flex-1 rounded-xl bg-[#4a4fb5] py-2.5 text-[13px] font-semibold text-white hover:bg-[#3a3fa5] disabled:opacity-40 transition-colors">
                        {processing ? 'Creating…' : 'Create'}
                    </button>
                </div>
            </form>
        </Modal>
    );
}

/* ─── DocumentsTable ─────────────────────────────────── */
function DocumentsTable({ documents, onPreview, onDelete }) {
    if (documents.length === 0) {
        return (
            <div className="flex h-64 flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-gray-200 bg-white text-center">
                <Icon.Inbox className="text-gray-200" />
                <p className="text-[13px] font-medium text-gray-400">No documents in this category</p>
            </div>
        );
    }

    return (
        <div className="overflow-hidden rounded-2xl border border-black/[0.06] bg-white shadow-sm">
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-[#5c6bc0]">
                            <th className="w-12 px-4 py-3" />
                            <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-white">Document</th>
                            <th className="hidden sm:table-cell px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-white">Control Number</th>
                            <th className="hidden lg:table-cell px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-white">Attached By</th>
                            <th className="hidden lg:table-cell px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-white">Date</th>
                            <th className="hidden md:table-cell px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-white">Size</th>
                            <th className="w-20 px-4 py-3" />
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
                                    <p className="mt-0.5 text-[11px] text-gray-400 truncate max-w-[200px]">{doc.file_name}</p>
                                    {/* Show control number inline on mobile */}
                                    <p className="sm:hidden mt-1 font-mono text-[10px] text-gray-400 truncate max-w-[200px]">{doc.control_number}</p>
                                </td>

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
                                    <div className="flex items-center justify-end gap-1.5 opacity-100 sm:opacity-0 sm:transition-opacity sm:duration-100 sm:group-hover:opacity-100">
                                        <button onClick={() => onPreview(doc)}
                                            className="flex h-7 w-7 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-400 shadow-sm hover:text-gray-700 transition-colors"
                                            title="View">
                                            <Icon.Eye />
                                        </button>
                                        <button onClick={() => onDelete(doc)}
                                            className="flex h-7 w-7 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-400 shadow-sm hover:border-red-200 hover:text-red-500 transition-colors"
                                            title="Delete">
                                            <Icon.Trash />
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
export default function AIDIndex({ categories }) {
    const { auth, flash } = usePage().props;
    const isAdmin           = auth.user.role === 'admin';
    const isAdminAssistant  = auth.user.role === 'admin_assistant';
    const canManageCats     = isAdmin || isAdminAssistant;

    const [selectedId, setSelectedId]       = useState(categories[0]?.id ?? null);
    const [showAttach, setShowAttach]       = useState(false);
    const [showAddCat, setShowAddCat]       = useState(false);
    const [previewDoc, setPreviewDoc]       = useState(null);
    const [confirmDelete, setConfirmDelete] = useState(null);
    const [reasonDelete, setReasonDelete]   = useState(null);
    const [confirmDeleteCat, setConfirmDeleteCat] = useState(null);
    const [toast, setToast]                 = useState(null);

    useEffect(() => {
        if (flash?.success) setToast(flash.success);
    }, [flash]);

    const activeCategory = categories.find(c => c.id === selectedId);
    const documents      = activeCategory?.documents ?? [];
    const totalDocs      = categories.reduce((n, c) => n + (c.documents?.length ?? 0), 0);

    function handleDeleteClick(doc) {
        isAdmin ? setConfirmDelete(doc) : setReasonDelete(doc);
    }

    function handleAdminDeleteConfirm() {
        if (!confirmDelete) return;
        router.delete(route('aid.documents.destroy', confirmDelete.id), {
            onSuccess: () => setConfirmDelete(null),
        });
    }

    function handleDeleteCategory(cat) {
        setConfirmDeleteCat(cat);
    }

    function confirmCategoryDelete() {
        if (!confirmDeleteCat) return;
        router.delete(route('aid.categories.destroy', confirmDeleteCat.id), {
            onSuccess: () => {
                if (selectedId === confirmDeleteCat.id)
                    setSelectedId(categories.find(c => c.id !== confirmDeleteCat.id)?.id ?? null);
                setConfirmDeleteCat(null);
            },
        });
    }

    return (
        <AuthenticatedLayout>
            <Head title="Documents — AID" />

            <div className="flex h-[calc(100vh-3rem)] flex-col overflow-hidden">

                {/* ── Mobile category bar (hidden on md+) ──────── */}
                <div className="flex md:hidden shrink-0 items-center gap-1.5 overflow-x-auto border-b border-black/[0.06] bg-white px-3 py-2">
                    {categories.length === 0 ? (
                        <p className="text-[12px] text-gray-400 px-1">No categories</p>
                    ) : (
                        categories.map(cat => (
                            <button key={cat.id}
                                onClick={() => setSelectedId(cat.id)}
                                className={`flex-shrink-0 rounded-full px-3 py-1.5 text-[12px] font-medium whitespace-nowrap transition-colors ${
                                    cat.id === selectedId
                                        ? 'bg-[#4a4fb5] text-white'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}>
                                {cat.name}
                                <span className={`ml-1.5 text-[10px] tabular-nums ${cat.id === selectedId ? 'text-white/60' : 'text-gray-400'}`}>
                                    {cat.documents?.length ?? 0}
                                </span>
                            </button>
                        ))
                    )}
                    {canManageCats && (
                        <button onClick={() => setShowAddCat(true)}
                            className="flex-shrink-0 flex h-7 w-7 items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors">
                            <Icon.Plus className="h-3 w-3" />
                        </button>
                    )}
                </div>

                {/* ── Two-panel layout ──────────────────────────── */}
                <div className="flex flex-1 overflow-hidden">

                    {/* Sidebar — hidden on mobile */}
                    <aside className="hidden md:flex w-60 flex-shrink-0 flex-col overflow-hidden border-r border-black/[0.06] bg-white">
                        <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
                            <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">Categories</p>
                            {canManageCats && (
                                <button onClick={() => setShowAddCat(true)}
                                    className="flex h-5 w-5 items-center justify-center rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors"
                                    title="New category">
                                    <Icon.Plus className="h-3 w-3" />
                                </button>
                            )}
                        </div>

                        <div className="flex-1 overflow-y-auto p-2">
                            {categories.length === 0 ? (
                                <div className="rounded-xl border border-dashed border-gray-200 px-4 py-6 text-center">
                                    <p className="text-[12px] text-gray-400">No categories yet</p>
                                    {canManageCats && (
                                        <button onClick={() => setShowAddCat(true)}
                                            className="mt-1.5 text-[12px] font-semibold text-gray-600 underline underline-offset-2 hover:text-gray-900">
                                            Add one
                                        </button>
                                    )}
                                </div>
                            ) : (
                                <ul className="space-y-0.5">
                                    {categories.map(cat => {
                                        const active = cat.id === selectedId;
                                        return (
                                            <li key={cat.id}>
                                                <button onClick={() => setSelectedId(cat.id)}
                                                    className={`group flex w-full items-center justify-between rounded-xl px-3 py-2 text-left transition-all duration-100 ${
                                                        active ? 'bg-[#4a4fb5] text-white' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                                    }`}>
                                                    <span className="truncate text-[13px] font-medium">{cat.name}</span>
                                                    <div className="flex flex-shrink-0 items-center gap-1.5">
                                                        <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold tabular-nums ${
                                                            active ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'
                                                        }`}>
                                                            {cat.documents?.length ?? 0}
                                                        </span>
                                                        {isAdmin && (
                                                            <button onClick={e => { e.stopPropagation(); handleDeleteCategory(cat); }}
                                                                className="flex h-4 w-4 items-center justify-center rounded-full text-gray-300 transition-colors hover:bg-red-50 hover:text-red-500"
                                                                title="Delete category">
                                                                <Icon.X className="h-2.5 w-2.5" />
                                                            </button>
                                                        )}
                                                    </div>
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
                                    {auth.user.name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()}
                                </span>
                                <div className="min-w-0">
                                    <p className="truncate text-[12px] font-semibold text-gray-700">{auth.user.name}</p>
                                    <p className="text-[10px] font-medium uppercase tracking-wide text-gray-400">
                                        {isAdmin ? 'Administrator' : 'Admin Assistant'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </aside>

                    {/* Main area */}
                    <div className="flex flex-1 flex-col overflow-hidden bg-[#f5f5f7]">

                        {/* Toolbar */}
                        <div className="flex flex-shrink-0 items-center justify-between border-b border-black/[0.06] bg-white px-4 sm:px-6 py-3.5 gap-3">
                            <div className="min-w-0">
                                <p className="text-[14px] font-semibold text-gray-900 truncate">
                                    {activeCategory ? activeCategory.name : 'Documents'}
                                </p>
                                <p className="text-[11px] text-gray-400">
                                    {totalDocs} doc{totalDocs !== 1 ? 's' : ''} · {categories.length} categor{categories.length !== 1 ? 'ies' : 'y'}
                                </p>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                                {canManageCats && (
                                    <button onClick={() => setShowAddCat(true)}
                                        className="hidden sm:flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-[12px] font-semibold text-gray-600 shadow-sm hover:bg-gray-50 transition-colors">
                                        <Icon.Plus className="h-3 w-3" />
                                        New Category
                                    </button>
                                )}
                                {categories.length > 0 && (
                                    <button onClick={() => setShowAttach(true)}
                                        className="flex items-center gap-1.5 rounded-xl bg-[#4a4fb5] px-3 py-1.5 text-[12px] font-semibold text-white shadow-sm hover:bg-[#3a3fa5] transition-colors">
                                        <Icon.Paperclip className="h-3 w-3" />
                                        <span className="hidden xs:inline">Attach</span>
                                        <span className="hidden sm:inline"> Document</span>
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
                            {!activeCategory ? (
                                <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
                                    <Icon.Folder className="text-gray-200" />
                                    <p className="text-[14px] font-medium text-gray-400">Select a category</p>
                                    {canManageCats && (
                                        <button onClick={() => setShowAddCat(true)}
                                            className="mt-1 rounded-xl bg-[#4a4fb5] px-4 py-2 text-[13px] font-semibold text-white hover:bg-[#3a3fa5] transition-colors">
                                            Create First Category
                                        </button>
                                    )}
                                </div>
                            ) : (
                                <>
                                    <div className="mb-4 flex items-center gap-2">
                                        <span className="rounded-full border border-gray-200 bg-white px-3 py-1 text-[12px] font-semibold text-gray-600 shadow-sm">
                                            {activeCategory.name}
                                        </span>
                                        <span className="text-[11px] text-gray-400">
                                            {documents.length} document{documents.length !== 1 ? 's' : ''}
                                        </span>
                                    </div>

                                    {documents.length === 0 ? (
                                        <div className="flex h-64 flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-gray-200 bg-white text-center">
                                            <Icon.Inbox className="text-gray-200" />
                                            <p className="text-[13px] font-medium text-gray-400">No documents in this category</p>
                                            <button onClick={() => setShowAttach(true)}
                                                className="rounded-xl bg-[#4a4fb5] px-4 py-2 text-[12px] font-semibold text-white hover:bg-[#3a3fa5] transition-colors">
                                                Attach First Document
                                            </button>
                                        </div>
                                    ) : (
                                        <DocumentsTable
                                            documents={documents}
                                            onPreview={setPreviewDoc}
                                            onDelete={handleDeleteClick}
                                        />
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Modals */}
            {showAttach    && <AttachModal categories={categories} defaultCategoryId={selectedId} onClose={() => setShowAttach(false)} />}
            {showAddCat    && <AddCategoryModal existingNames={categories.map(c => c.name)} onClose={() => setShowAddCat(false)} />}
            {previewDoc    && <PreviewModal doc={previewDoc} onClose={() => setPreviewDoc(null)} />}
            {confirmDelete && (
                <ConfirmDialog
                    doc={confirmDelete}
                    onConfirm={handleAdminDeleteConfirm}
                    onCancel={() => setConfirmDelete(null)}
                />
            )}
            {confirmDeleteCat && (
                <Modal title="Delete Category" onClose={() => setConfirmDeleteCat(null)} size="sm">
                    <div className="p-5">
                        <div className="mb-5 flex items-start gap-3">
                            <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border border-red-100 bg-red-50">
                                <Icon.Warning className="h-4 w-4 text-red-500" />
                            </span>
                            <div>
                                <p className="text-[13px] font-semibold text-gray-900">{confirmDeleteCat.name}</p>
                                <p className="mt-0.5 text-[12px] text-gray-500">
                                    This will permanently delete the category
                                    {(confirmDeleteCat.documents?.length ?? 0) > 0
                                        ? ` and all ${confirmDeleteCat.documents.length} document${confirmDeleteCat.documents.length !== 1 ? 's' : ''} inside it`
                                        : ''}.
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={() => setConfirmDeleteCat(null)}
                                className="flex-1 rounded-xl border border-gray-200 py-2 text-[13px] font-medium text-gray-600 hover:bg-gray-50 transition-colors">
                                Cancel
                            </button>
                            <button onClick={confirmCategoryDelete}
                                className="flex-1 rounded-xl bg-red-500 py-2 text-[13px] font-semibold text-white hover:bg-red-600 transition-colors">
                                Delete
                            </button>
                        </div>
                    </div>
                </Modal>
            )}
            {reasonDelete  && (
                <DeletionReasonModal
                    doc={reasonDelete}
                    onClose={() => setReasonDelete(null)}
                />
            )}
            {toast && <Toast message={toast} onDone={() => setToast(null)} />}
        </AuthenticatedLayout>
    );
}
