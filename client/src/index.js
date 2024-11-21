import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/styles.css';

// Crear una instancia de QueryClient con opciones predeterminadas para optimizar el manejo de caché y datos
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false, // Evita refetch al volver a enfocar la ventana
      retry: 1,                    // Reintenta una vez en caso de fallo
      staleTime: 300000,           // 5 minutos antes de que una consulta se considere obsoleta
      cacheTime: 600000,           // 10 minutos para mantener los datos en caché
    },
  },
});

const root = ReactDOM.createRoot(document.getElementById('root'));

// Renderizar la aplicación
const render = () => {
  root.render(
    <React.StrictMode>
      {/* Proveedor de QueryClient para gestionar el estado de React Query */}
      <QueryClientProvider client={queryClient}>
        {/* Proveedor de autenticación */}
        <AuthProvider>
          {/* Proveedor de tema (modo oscuro/luminoso) */}
          <ThemeProvider>
            <App />
            {/* DevTools de React Query para desarrollo */}
            {process.env.NODE_ENV === 'development' && <ReactQueryDevtools />}
          </ThemeProvider>
        </AuthProvider>
      </QueryClientProvider>
    </React.StrictMode> 
  );
};

render();

// Habilitar hot module replacement en desarrollo
if (process.env.NODE_ENV === 'development' && module.hot) {
  module.hot.accept('./App', render);
}
