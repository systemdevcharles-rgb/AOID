import ApplicationLogo from '@/Components/ApplicationLogo';
import { Head, Link, useForm } from '@inertiajs/react';

function Field({ label, error, children }) {
    return (
        <div>
            <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                {label}
            </label>
            {children}
            {error && <p className="mt-1.5 text-[11px] text-red-500">{error}</p>}
        </div>
    );
}

export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    const inputClass =
        'w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-[13px] text-gray-900 placeholder-gray-300 outline-none transition-colors focus:border-gray-400';

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-[#f5f5f7] px-4 py-12">
            <Head title="Register" />

            <div className="w-full max-w-sm">
                {/* Logo */}
                <div className="mb-8 flex justify-center">
                    <Link href="/">
                        <ApplicationLogo className="h-10 w-auto object-contain" />
                    </Link>
                </div>

                {/* Card */}
                <div className="overflow-hidden rounded-2xl border border-black/[0.06] bg-white shadow-sm">
                    <div className="border-b border-gray-100 px-6 py-5">
                        <p className="text-[17px] font-semibold text-gray-900">Create an account</p>
                        <p className="mt-1 text-[12px] leading-relaxed text-gray-400">
                            Your account will require admin approval before you can access the system.
                        </p>
                    </div>

                    <form onSubmit={submit} className="space-y-4 px-6 py-5">
                        <Field label="Full Name" error={errors.name}>
                            <input
                                type="text"
                                value={data.name}
                                onChange={e => setData('name', e.target.value)}
                                autoFocus
                                autoComplete="name"
                                required
                                placeholder="Juan Dela Cruz"
                                className={inputClass}
                            />
                        </Field>

                        <Field label="Email" error={errors.email}>
                            <input
                                type="email"
                                value={data.email}
                                onChange={e => setData('email', e.target.value)}
                                autoComplete="email"
                                required
                                placeholder="you@example.com"
                                className={inputClass}
                            />
                        </Field>

                        <Field label="Password" error={errors.password}>
                            <input
                                type="password"
                                value={data.password}
                                onChange={e => setData('password', e.target.value)}
                                autoComplete="new-password"
                                required
                                placeholder="Min. 8 characters"
                                className={inputClass}
                            />
                        </Field>

                        <Field label="Confirm Password" error={errors.password_confirmation}>
                            <input
                                type="password"
                                value={data.password_confirmation}
                                onChange={e => setData('password_confirmation', e.target.value)}
                                autoComplete="new-password"
                                required
                                placeholder="Repeat your password"
                                className={inputClass}
                            />
                        </Field>

                        <button
                            type="submit"
                            disabled={processing}
                            className="mt-1 w-full rounded-lg bg-gray-900 py-2.5 text-[13px] font-medium text-white transition-colors hover:bg-gray-700 disabled:opacity-50"
                        >
                            {processing ? 'Creating account...' : 'Create account'}
                        </button>
                    </form>
                </div>

                <p className="mt-5 text-center text-[12px] text-gray-400">
                    Already have an account?{' '}
                    <Link href={route('login')} className="font-medium text-gray-900 hover:underline">
                        Sign in
                    </Link>
                </p>
            </div>
        </div>
    );
}
