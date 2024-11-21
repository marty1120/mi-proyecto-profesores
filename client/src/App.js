// App.js
import React, { useEffect, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useTheme } from './context/ThemeContext';
import { useAuth } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';

// Componentes comunes
import Navbar from './components/Navbar';
import PrivateRoute from './components/PrivateRoute';
import AdminRoute from './components/AdminRoute';
import LoadingSpinner from './components/LoadingSpinner';

// Lazy loading de componentes
const TeacherList = lazy(() => import('./components/TeacherList'));
const TeacherProfile = lazy(() => import('./components/TeacherProfile'));
const CollaborativeGroups = lazy(() => import('./components/CollaborativeGroups'));
const GroupDetails = lazy(() => import('./components/GroupDetails'));
const EditGroup = lazy(() => import('./components/EditGroup'));
const Login = lazy(() => import('./pages/Login'));
const CreateTeacherForm = lazy(() => import('./components/CreateTeacherForm'));
const LikeModeration = lazy(() => import('./components/LikeModeration'));

const App = () => {
  const { darkMode } = useTheme();
  const { loading } = useAuth();

  // Efecto para aplicar el modo oscuro
  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, [darkMode]);

  // Mostrar spinner mientras se verifica la autenticación
  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <Router>
      <div className={`app ${darkMode ? 'dark-mode' : ''}`}>
        <Navbar />
        <div className="container mt-5">
          {/* Suspense para componentes cargados perezosamente */}
          <Suspense fallback={<LoadingSpinner />}>
            <Routes>
              {/* Rutas públicas */}
              <Route path="/" element={<TeacherList />} />
              <Route path="/login" element={<Login />} />
              
              {/* Rutas protegidas */}
              <Route element={<PrivateRoute />}>
                <Route path="/profesor/:id" element={<TeacherProfile />} />
                <Route path="/grupos" element={<CollaborativeGroups />} />
                <Route path="/grupos/:id" element={<GroupDetails />} />
                <Route path="/grupos/:id/editar" element={<EditGroup />} /> {/* Ruta para editar grupo */}
              </Route>

              {/* Rutas de administración */}
              <Route element={<PrivateRoute />}>
                <Route element={<AdminRoute />}>
                  <Route path="/admin/likes" element={<LikeModeration />} />
                  <Route path="/admin/profesores/crear" element={<CreateTeacherForm />} />
                </Route>
              </Route>

              {/* Ruta 404 */}
              <Route path="*" element={
                <div className="text-center mt-5">
                  <h2>Página no encontrada</h2>
                  <p>La página que buscas no existe.</p>
                </div>
              } />
            </Routes>
          </Suspense>
        </div>
      </div>
      <Toaster /> {/* Componente Toaster para react-hot-toast */}
    </Router>
  );
};

export default App;
