import { Link, useLocation, useNavigate } from 'react-router-dom';

import AlertMessage from '../../components/AlertMessage.jsx';
import { FormField } from '../../features/auth/components/FormField.jsx';
import { useAuth } from '../../features/auth/useAuth.js';
import { useLoginForm } from '../../features/auth/hooks/useLoginForm.js';

// Ruta a la que se dirige cada rol después de iniciar sesión.
// Si el usuario llegó desde una ruta privada, se respeta esa ruta.
function rutaDeInicio(usuario, desde) {
    if (desde) {
        return desde;
    }

    return usuario?.rol === 'administrador' ? '/admin/categorias' : '/app';
}

export default function LoginPage() {
    const navegar = useNavigate();
    const ubicacion = useLocation();
    const { autenticado, usuario, esAdministrador } = useAuth();

    const desde = ubicacion.state?.desde ?? null;
    const expirada = Boolean(ubicacion.state?.expirada);
    const aviso = ubicacion.state?.aviso ?? '';

    const {
        formData,
        errores,
        cargando,
        mensajeError,
        detalles,
        handleChange,
        handleSubmit
    } = useLoginForm({
        onSuccess: (usuarioAutenticado) => {
            navegar(rutaDeInicio(usuarioAutenticado, desde), { replace: true });
        }
    });

    // Si ya hay una sesión activa no se muestra el formulario otra vez.
    if (autenticado) {
        return (
            <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 md:py-20">
                <div className="mx-auto w-full max-w-md rounded-2xl border border-slate-800 bg-surface p-6 shadow-lg sm:p-8">
                    <h1 className="text-2xl font-bold text-text-main">
                        Ya tienes una sesión activa
                    </h1>

                    <p className="mt-2 text-sm text-text-muted">
                        Ingresaste como {usuario?.nombres ?? 'usuario'}.
                    </p>

                    <div className="mt-6 flex flex-col gap-3">
                        <Link
                            to="/app"
                            className="rounded-lg bg-primary px-4 py-3 text-center text-sm font-semibold text-slate-950 transition hover:bg-primary-dark"
                        >
                            Ir a mi panel
                        </Link>

                        {esAdministrador && (
                            <Link
                                to="/admin/categorias"
                                className="rounded-lg border border-slate-700 px-4 py-3 text-center text-sm font-medium text-text-main transition hover:bg-slate-800"
                            >
                                Ir a la administración
                            </Link>
                        )}
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="mx-auto flex max-w-6xl items-center justify-center px-4 py-12 sm:px-6 md:py-20">
            <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-surface p-6 shadow-lg sm:p-8">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-text-main sm:text-3xl">
                        Iniciar sesión
                    </h1>

                    <p className="mt-2 text-sm text-text-muted">
                        Ingresa a tu cuenta para continuar aprendiendo y
                        enseñando.
                    </p>
                </div>

                <div className="mt-6 space-y-3">
                    {expirada && (
                        <AlertMessage type="info">
                            Tu sesión expiró. Inicia sesión de nuevo para
                            continuar.
                        </AlertMessage>
                    )}

                    {aviso && <AlertMessage type="info">{aviso}</AlertMessage>}

                    {desde && (
                        <p className="text-xs text-text-muted">
                            Después de ingresar volverás a la página que
                            solicitaste.
                        </p>
                    )}

                    {mensajeError && (
                        <AlertMessage>
                            <p>{mensajeError}</p>

                            {detalles.length > 0 && (
                                <ul className="mt-2 list-disc pl-5">
                                    {detalles.map((detalle, indice) => (
                                        <li key={indice}>{detalle}</li>
                                    ))}
                                </ul>
                            )}
                        </AlertMessage>
                    )}
                </div>

                <form
                    onSubmit={handleSubmit}
                    className="mt-6 space-y-5"
                    noValidate
                >
                    <FormField
                        id="correoElectronico"
                        name="correoElectronico"
                        label="Correo electrónico"
                        type="email"
                        value={formData.correoElectronico}
                        onChange={handleChange}
                        error={errores.correoElectronico}
                        autoComplete="email"
                        placeholder="tucorreo@example.com"
                    />

                    <FormField
                        id="contrasena"
                        name="contrasena"
                        label="Contraseña"
                        type="password"
                        value={formData.contrasena}
                        onChange={handleChange}
                        error={errores.contrasena}
                        autoComplete="current-password"
                        placeholder="••••••••"
                    />

                    <button
                        type="submit"
                        disabled={cargando}
                        className="w-full rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {cargando ? 'Ingresando…' : 'Iniciar sesión'}
                    </button>
                </form>

                <p className="mt-6 text-center text-sm text-text-muted">
                    ¿No tienes cuenta?{' '}
                    <Link
                        to="/registro"
                        className="font-medium text-primary hover:underline"
                    >
                        Regístrate
                    </Link>
                </p>
            </div>
        </section>
    );
}
