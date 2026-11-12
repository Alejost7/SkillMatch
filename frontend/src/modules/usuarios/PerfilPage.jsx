import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import AlertMessage from '../../components/AlertMessage.jsx';
import Cargando from '../../components/Cargando.jsx';
import { useAuth } from '../../features/auth/useAuth.js';
import { mensajeDeError } from '../../utils/errores.js';
import {
    formatearFecha,
    formatearPromedio,
    iniciales,
    nombreCompleto
} from '../../utils/formato.js';

import PerfilForm from './components/PerfilForm.jsx';
import { actualizarPerfil, obtenerPerfil } from './usuarios.api.js';

export default function PerfilPage() {
    const { usuario: sesion, actualizarUsuario } = useAuth();

    const [perfil, setPerfil] = useState(null);
    const [cargando, setCargando] = useState(true);
    const [guardando, setGuardando] = useState(false);
    const [errorCarga, setErrorCarga] = useState('');
    const [mensaje, setMensaje] = useState(null);

    useEffect(() => {
        const controlador = new AbortController();

        async function cargarPerfil() {
            try {
                const datos = await obtenerPerfil({
                    signal: controlador.signal
                });

                if (!controlador.signal.aborted) {
                    setPerfil(datos);
                    setErrorCarga('');
                }
            } catch (error) {
                if (!controlador.signal.aborted) {
                    setErrorCarga(mensajeDeError(error));
                }
            } finally {
                if (!controlador.signal.aborted) {
                    setCargando(false);
                }
            }
        }

        cargarPerfil();

        return () => controlador.abort();
    }, []);

    async function guardarPerfil(datos) {
        if (guardando) return false;

        setGuardando(true);
        setMensaje(null);

        try {
            const { usuario, message } = await actualizarPerfil(datos);

            setPerfil((actual) => ({
                ...actual,
                ...usuario,
                calificacion: actual?.calificacion
            }));

            // El saludo del panel usa la sesión: se mantiene sincronizada.
            actualizarUsuario({
                ...sesion,
                nombres: usuario.nombres,
                apellidos: usuario.apellidos,
                alias: usuario.alias
            });

            setMensaje({
                type: 'success',
                text: message ?? 'Perfil actualizado.'
            });

            return true;
        } catch (error) {
            setMensaje({
                type: 'error',
                text: mensajeDeError(error),
                details: error.errors ?? []
            });

            return false;
        } finally {
            setGuardando(false);
        }
    }

    if (cargando) {
        return <Cargando mensaje="Cargando tu perfil…" />;
    }

    if (errorCarga) {
        return <AlertMessage>{errorCarga}</AlertMessage>;
    }

    const calificacion = perfil?.calificacion;
    const foto = perfil?.perfil?.fotoPerfilUrl;

    return (
        <section>
            <div className="mb-6">
                <p className="text-sm font-medium text-primary">Mi cuenta</p>

                <h1 className="mt-2 text-3xl font-bold tracking-tight text-text-main">
                    Mi perfil
                </h1>

                <p className="mt-2 text-text-muted">
                    Mantén tus datos al día para que otras personas te
                    encuentren con facilidad.
                </p>
            </div>

            {mensaje && (
                <div className="mb-6">
                    <AlertMessage type={mensaje.type}>
                        <p>{mensaje.text}</p>

                        {mensaje.details?.length > 0 && (
                            <ul className="mt-2 list-disc pl-5">
                                {mensaje.details.map((detalle, indice) => (
                                    <li key={indice}>{detalle}</li>
                                ))}
                            </ul>
                        )}
                    </AlertMessage>
                </div>
            )}

            <div className="grid items-start gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2">
                    <PerfilForm
                        perfil={perfil}
                        onSave={guardarPerfil}
                        guardando={guardando}
                    />
                </div>

                <aside className="space-y-4">
                    <div className="rounded-2xl border border-slate-800 bg-surface p-6 text-center">
                        {foto ? (
                            <img
                                src={foto}
                                alt={`Foto de ${nombreCompleto(perfil)}`}
                                className="mx-auto h-20 w-20 rounded-full object-cover"
                            />
                        ) : (
                            <span className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary/20 text-xl font-bold text-primary">
                                {iniciales(perfil)}
                            </span>
                        )}

                        <h2 className="mt-3 font-semibold text-text-main">
                            {nombreCompleto(perfil)}
                        </h2>

                        <p className="text-xs text-text-muted">
                            {perfil.alias ? `@${perfil.alias}` : 'Sin alias'}
                        </p>

                        <p className="mt-3 text-sm font-semibold text-accent">
                            {calificacion?.total
                                ? `★ ${formatearPromedio(calificacion.promedio, calificacion.total)} (${calificacion.total} calificaciones)`
                                : 'Sin calificaciones todavía'}
                        </p>
                    </div>

                    <div className="rounded-2xl border border-slate-800 bg-surface p-6 text-sm">
                        <dl className="space-y-3">
                            <div>
                                <dt className="text-xs uppercase tracking-wide text-text-muted">
                                    Correo electrónico
                                </dt>
                                <dd className="mt-1 break-words text-text-main">
                                    {perfil?.correoElectronico}
                                </dd>
                            </div>

                            <div>
                                <dt className="text-xs uppercase tracking-wide text-text-muted">
                                    Rol
                                </dt>
                                <dd className="mt-1 text-text-main">
                                    {perfil?.rol === 'administrador'
                                        ? 'Administrador'
                                        : 'Usuario'}
                                </dd>
                            </div>

                            <div>
                                <dt className="text-xs uppercase tracking-wide text-text-muted">
                                    Miembro desde
                                </dt>
                                <dd className="mt-1 text-text-main">
                                    {formatearFecha(perfil?.fechaRegistro)}
                                </dd>
                            </div>
                        </dl>

                        <div className="mt-5 flex flex-col gap-2">
                            <Link
                                to="/app/habilidades"
                                className="rounded-lg bg-primary px-4 py-2 text-center text-sm font-semibold text-slate-950 transition hover:bg-primary-dark"
                            >
                                Editar mis habilidades
                            </Link>

                            <Link
                                to="/app/calificaciones"
                                className="rounded-lg border border-slate-700 px-4 py-2 text-center text-sm font-medium text-text-main transition hover:bg-slate-800"
                            >
                                Ver mis calificaciones
                            </Link>
                        </div>
                    </div>
                </aside>
            </div>
        </section>
    );
}
