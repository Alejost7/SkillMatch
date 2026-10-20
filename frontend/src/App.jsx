import AdminLayout from './layouts/AdminLayout.jsx';
import CategoriasPage from './modules/categorias/CategoriasPage.jsx';

export default function App() {
  return (
    <AdminLayout>
      <CategoriasPage />
    </AdminLayout>
  );
}