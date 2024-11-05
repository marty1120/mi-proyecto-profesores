import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useTheme } from './context/ThemeContext';
import { useAuth } from './context/AuthContext';

// Componentes
import Navbar from './components/Navbar';
import TeacherList from './components/TeacherList';
import TeacherProfile from './components/TeacherProfile';
import CollaborativeGroups from './components/CollaborativeGroups';
import GroupDetails from './components/GroupDetails';
import Login from './pages/Login';
import PrivateRoute from './components/PrivateRoute';
import LoadingSpinner from './components/LoadingSpinner';

const App = () => {
  const { darkMode } = useTheme();
  const { loading } = useAuth();

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, [darkMode]);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <Router>
      <div className={`app ${darkMode ? 'dark-mode' : ''}`}>
        <Navbar />
        <div className="container mt-5">
          <Routes>
            {/* Rutas públicas */}
            <Route path="/" element={<TeacherList />} />
            <Route path="/login" element={<Login />} />
            
            {/* Rutas protegidas */}
            <Route element={<PrivateRoute />}>
              <Route path="/profesor/:id" element={<TeacherProfile />} />
              <Route path="/grupos" element={<CollaborativeGroups />} />
              <Route path="/grupos/:id" element={<GroupDetails />} />
            </Route>

            {/* Ruta 404 */}
            <Route path="*" element={
              <div className="text-center mt-5">
                <h2>Página no encontrada</h2>
                <p>La página que buscas no existe.</p>
              </div>
            } />
          </Routes>
        </div>
      </div>
    </Router>
  );
};

export default App;