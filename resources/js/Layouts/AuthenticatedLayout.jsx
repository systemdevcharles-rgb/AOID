import ApplicationLogo from '@/Components/ApplicationLogo';
import { Link, usePage } from '@inertiajs/react';
import { useState, useRef, useEffect } from 'react';

function NavPill({ href, active, children }) {
    return (
        <Link
            href={href}
            className={`rounded-lg px-3 py-1.5 text-[13px] font-medium transition-all duration-150 ${
                active
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
            }`}
        >
            {children}
        </Link>
    );
}

export default function AuthenticatedLayout({ header, children }) {
    const { auth } = usePage().props;
    const user = auth.user;
    const isAdmin = user.role === 'admin';
    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef();

    useEffect(() => {
        function handler(e) {
            if (menuRef.current && !menuRef.current.contains(e.target))
                setMenuOpen(false);
        }
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const initials = user.name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();

    return (
        <div className="min-h-screen bg-[#f5f5f7]">
            <nav className="sticky top-0 z-30 h-12 border-b border-black/[0.06] bg-white/80 backdrop-blur-xl">
                <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-6">

                    <div className="flex items-center gap-4">
                        <Link href="dashboard" className="flex items-center gap-2">
                            <ApplicationLogo className="h-7 w-auto object-contain" />
                        </Link>
                        <div className="h-4 w-px bg-gray-200" />
                        <div className="flex items-center gap-0.5">
                            <NavPill href={route('dashboard')} active={route().current('dashboard')}>
                                Dashboard
                            </NavPill>
                            <NavPill href={route('aid.index')} active={route().current('aid.*')}>
                                Documents
                            </NavPill>
                            {isAdmin && (
                                <NavPill href={route('admin.users')} active={route().current('admin.*')}>
                                    Users
                                </NavPill>
                            )}
                        </div>
                    </div>

                    <div className="relative" ref={menuRef}>
                        <button
                            onClick={() => setMenuOpen(v => !v)}
                            className="flex items-center gap-2 rounded-full py-1 pl-1 pr-2.5 hover:bg-gray-100 transition-colors duration-150"
                        >
                            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-900 text-[10px] font-bold text-white select-none">
                                {initials}
                            </span>
                            <span className="text-[13px] font-medium text-gray-700">{user.name}</span>
                            <svg className="h-3 w-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>

                        {menuOpen && (
                            <div className="absolute right-0 top-full mt-1.5 w-52 overflow-hidden rounded-xl border border-black/[0.06] bg-white shadow-xl">
                                <div className="border-b border-gray-100 px-3 py-2.5">
                                    <p className="text-xs font-semibold text-gray-900 truncate">{user.name}</p>
                                    <p className="mt-0.5 text-[11px] text-gray-400 truncate">{user.email}</p>
                                </div>
                                <div className="py-1">
                                    <Link
                                        href={route('profile.edit')}
                                        className="flex w-full items-center px-3 py-1.5 text-[13px] text-gray-700 hover:bg-gray-50 transition-colors"
                                        onClick={() => setMenuOpen(false)}
                                    >
                                        Profile Settings
                                    </Link>
                                </div>
                                <div className="border-t border-gray-100 py-1">
                                    <Link
                                        href={route('logout')}
                                        method="post"
                                        as="button"
                                        className="flex w-full items-center px-3 py-1.5 text-[13px] text-red-500 hover:bg-red-50 transition-colors"
                                        onClick={() => setMenuOpen(false)}
                                    >
                                        Sign Out
                                    </Link>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </nav>

            {header && (
                <header className="border-b border-black/[0.06] bg-white">
                    <div className="mx-auto max-w-7xl px-6 py-4">
                        {header}
                    </div>
                </header>
            )}

            <main>{children}</main>
        </div>
    );
}
