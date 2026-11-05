import { Link } from 'react-router-dom';

const funcionalidades = [
    {
        titulo: 'Publica tus habilidades',
        descripcion:
        'Registra las habilidades que puedes enseñar, su nivel y una breve descripción de apoyo.',
        color: 'text-success',
        fondo: 'bg-success/10 border-success/30',
    },
    {
        titulo: 'Encuentra personas compatibles',
        descripcion:
        'Busca usuarios por palabra clave, categoría de conocimiento y nivel de habilidad.',
        color: 'text-primary',
        fondo: 'bg-primary/10 border-primary/30',
    },
    {
        titulo: 'Conecta y aprende',
        descripcion:
        'Envía solicitudes de conexión, conversa por mensajería privada y califica tu experiencia.',
        color: 'text-accent',
        fondo: 'bg-accent/10 border-accent/30',
    },
];

const categorias = [
    'Programación',
    'Idiomas',
    'Música',
    'Diseño',
    'Matemáticas',
    'Deportes',
    'Cocina',
    'Fotografía',
];

export default function HomePage() {
    return (
        <>
        {/* Hero */}
        <section className="relative overflow-hidden">
            <div className="pointer-events-none absolute inset-0">
            <div className="absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-primary/20 blur-3xl" />
            <div className="absolute bottom-0 right-0 h-64 w-64 rounded-full bg-success/10 blur-3xl" />
            </div>

            <div className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6 md:py-24">
            <div className="mx-auto max-w-3xl text-center">
                <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
                Aprende y enseña sin costo
                </span>

                <h1 className="mt-6 text-4xl font-bold leading-tight tracking-tight text-text-main sm:text-5xl md:text-6xl">
                Intercambia{' '}
                <span className="text-primary">habilidades</span> y{' '}
                <span className="text-success">conocimientos</span>
                </h1>

                <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-text-muted sm:text-lg">
                SkillMatch conecta personas que desean aprender nuevas habilidades con
                aquellas que quieren compartir sus conocimientos. Ofrece lo que sabes,
                encuentra lo que quieres aprender y construye una comunidad de aprendizaje
                colaborativo.
                </p>

                <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Link
                    to="/registro"
                    className="w-full rounded-lg bg-primary px-6 py-3 text-center text-sm font-semibold text-slate-950 transition hover:bg-primary-dark sm:w-auto"
                >
                    Crear mi cuenta
                </Link>

                <Link
                    to="/login"
                    className="w-full rounded-lg border border-primary px-6 py-3 text-center text-sm font-semibold text-primary transition hover:bg-primary/10 sm:w-auto"
                >
                    Iniciar sesión
                </Link>
                </div>

                <p className="mt-4 text-sm text-text-muted">
                Sin pagos, sin comisiones: aprende enseñando.
                </p>
            </div>
            </div>
        </section>

        {/* Cómo funciona */}
        <section className="border-y border-slate-800 bg-surface/50">
            <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
            <div className="mx-auto max-w-2xl text-center">
                <h2 className="text-2xl font-bold text-text-main sm:text-3xl">
                ¿Cómo funciona SkillMatch?
                </h2>

                <p className="mt-3 text-text-muted">
                Un espacio sencillo para encontrar personas con intereses complementarios
                y comenzar un intercambio de conocimientos.
                </p>
            </div>

            <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-3">
                {funcionalidades.map((item) => (
                <article
                    key={item.titulo}
                    className={`rounded-xl border p-6 transition hover:-translate-y-1 ${item.fondo}`}
                >
                    <h3 className={`text-lg font-semibold ${item.color}`}>
                    {item.titulo}
                    </h3>

                    <p className="mt-2 text-sm leading-relaxed text-text-muted">
                    {item.descripcion}
                    </p>
                </article>
                ))}
            </div>
            </div>
        </section>

        {/* Categorías destacadas */}
        <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
            <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-bold text-text-main sm:text-3xl">
                Explora áreas de conocimiento
            </h2>

            <p className="mt-3 text-text-muted">
                Encuentra personas interesadas en las mismas áreas que tú.
            </p>
            </div>

            <div className="mt-8 flex flex-wrap justify-center gap-3">
            {categorias.map((categoria) => (
                <span
                key={categoria}
                className="rounded-full border border-slate-700 bg-surface px-4 py-2 text-sm text-text-main transition hover:border-primary hover:text-primary"
                >
                {categoria}
                </span>
            ))}
            </div>
        </section>

        {/* Llamado final */}
        <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
            <div className="rounded-2xl border border-primary/30 bg-primary/10 p-8 text-center md:p-12">
            <h2 className="text-2xl font-bold text-text-main sm:text-3xl">
                Comienza a aprender y enseñar hoy
            </h2>

            <p className="mx-auto mt-3 max-w-2xl text-text-muted">
                Crea tu perfil, publica las habilidades que ofreces y descubre personas
                dispuestas a compartir lo que saben.
            </p>

            <Link
                to="/registro"
                className="mt-6 inline-block rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-primary-dark"
            >
                Registrarme gratis
            </Link>
            </div>
        </section>
        </>
    );
}