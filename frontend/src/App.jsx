import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

import PublicLayout from './layouts/PublicLayout.jsx';
import AdminLayout from './layouts/AdminLayout.jsx';
import PrivateLayout from './layouts/PrivateLayout.jsx';

import { AuthProvider } from './features/auth/AuthContext.jsx';
import { EventosProvider } from './features/notificaciones/EventosContext.jsx';
import ProtectedRoute from './features/auth/components/ProtectedRoute.jsx';

import HomePage from './pages/public/HomePage.jsx';
import PoliticaDatosPage from './pages/public/PoliticaDatosPage.jsx';
import NoEncontradaPage from './pages/public/NoEncontradaPage.jsx';
import LoginPage from './pages/auth/LoginPage.jsx';
import RegisterPage from './pages/auth/RegisterPage.jsx';
import InicioPage from './pages/privado/InicioPage.jsx';

import CategoriasPage from './modules/categorias/CategoriasPage.jsx';
import HabilidadesAdminPage from './modules/habilidades/HabilidadesAdminPage.jsx';
import MisHabilidadesPage from './modules/habilidadesUsuario/MisHabilidadesPage.jsx';
import PerfilPage from './modules/usuarios/PerfilPage.jsx';
import BuscarUsuariosPage from './modules/usuarios/BuscarUsuariosPage.jsx';
import UsuarioDetallePage from './modules/usuarios/UsuarioDetallePage.jsx';
import SolicitudesPage from './modules/solicitudes/SolicitudesPage.jsx';
import ConexionesPage from './modules/conexiones/ConexionesPage.jsx';
import BandejaPage from './modules/mensajes/BandejaPage.jsx';
import ChatPage from './modules/mensajes/ChatPage.jsx';
import CalificacionesPage from './modules/calificaciones/CalificacionesPage.jsx';

export default function App() {
    return (
        <AuthProvider>
            <EventosProvider>
                <BrowserRouter>
                    <Routes>
                        {/* Rutas públicas */}
                        <Route element={<PublicLayout />}>
                            <Route index element={<HomePage />} />
                            <Route path="/login" element={<LoginPage />} />
                            <Route path="/registro" element={<RegisterPage />} />
                            <Route
                                path="/politica-datos"
                                element={<PoliticaDatosPage />}
                            />
                        </Route>

                        {/* Rutas privadas del usuario */}
                        <Route element={<ProtectedRoute />}>
                            <Route path="/app" element={<PrivateLayout />}>
                                <Route index element={<InicioPage />} />
                                <Route path="perfil" element={<PerfilPage />} />
                                <Route
                                    path="habilidades"
                                    element={<MisHabilidadesPage />}
                                />
                                <Route
                                    path="buscar"
                                    element={<BuscarUsuariosPage />}
                                />
                                <Route
                                    path="usuarios/:id"
                                    element={<UsuarioDetallePage />}
                                />
                                <Route
                                    path="solicitudes"
                                    element={<SolicitudesPage />}
                                />
                                <Route
                                    path="conexiones"
                                    element={<ConexionesPage />}
                                />
                                <Route
                                    path="mensajes"
                                    element={<BandejaPage />}
                                />
                                <Route
                                    path="mensajes/:idConexion"
                                    element={<ChatPage />}
                                />
                                <Route
                                    path="calificaciones"
                                    element={<CalificacionesPage />}
                                />
                            </Route>
                        </Route>

                        {/* Rutas administrativas: exigen el rol administrador */}
                        <Route
                            element={
                                <ProtectedRoute rol="administrador" />
                            }
                        >
                            <Route path="/admin" element={<AdminLayout />}>
                                <Route
                                    index
                                    element={
                                        <Navigate
                                            to="/admin/categorias"
                                            replace
                                        />
                                    }
                                />
                                <Route
                                    path="categorias"
                                    element={<CategoriasPage />}
                                />
                                <Route
                                    path="habilidades"
                                    element={<HabilidadesAdminPage />}
                                />
                            </Route>
                        </Route>

                        {/* Cualquier otra dirección */}
                        <Route path="*" element={<NoEncontradaPage />} />
                    </Routes>
                </BrowserRouter>
            </EventosProvider>
        </AuthProvider>
    );
}
