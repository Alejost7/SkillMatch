export default function AdminLayout({ children }) {
    return (
        <div className="min-h-screen bg-slate-50">
        <header className="border-b border-slate-200 bg-white">
            <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-6 py-5">
            <div>
                <p className="text-xl font-bold tracking-tight text-indigo-600">
                SkillMatch
                </p>

                <p className="text-sm text-slate-500">
                Intercambio de habilidades y conocimientos
                </p>
            </div>

            <span className="rounded-full bg-indigo-50 px-3 py-1 text-sm font-medium text-indigo-700">
                Administración · Categorías
            </span>
            </div>
        </header>

        <main className="mx-auto max-w-6xl px-6 py-8">
            {children}
        </main>
        </div>
    );
}

// Este encabezado es solamente la presentación del módulo, no un sistema de autenticación.