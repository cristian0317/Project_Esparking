import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import theme from './theme';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import LugaresPage from './pages/LugaresPage';
import VehiculosPage from './pages/VehiculosPage';
import TarifasPage from './pages/TarifasPage';
import EntradasPage from './pages/EntradasPage';
import IngresosPage from './pages/IngresosPage';
import ProtectedRoute from './components/auth/ProtectedRoute';
import MainLayout from './components/layout/MainLayout';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CssBaseline } from '@mui/material';
import AdministracionPage from './pages/AdministracionPage';
import UsuariosPage from './pages/UsuariosPage';


const AppRouter = () => {
  return (
    <Router>
      <Routes>
        {/* Ruta Pública */}
        <Route path="/login" element={<LoginPage />} />

        {/* Rutas Protegidas */}
        <Route path="/dashboard" element={<ProtectedRoute><MainLayout><DashboardPage /></MainLayout></ProtectedRoute>} />
        <Route path="/lugares" element={<ProtectedRoute><MainLayout><LugaresPage /></MainLayout></ProtectedRoute>} />
        <Route path="/vehiculos" element={<ProtectedRoute><MainLayout><VehiculosPage /></MainLayout></ProtectedRoute>} />
        <Route path="/tarifas" element={<ProtectedRoute><MainLayout><TarifasPage /></MainLayout></ProtectedRoute>} />
        <Route path="/entradas" element={<ProtectedRoute><MainLayout><EntradasPage /></MainLayout></ProtectedRoute>} />
        <Route path="/ingresos" element={<ProtectedRoute><MainLayout><IngresosPage /></MainLayout></ProtectedRoute>} />
        <Route path="/usuarios" element={<ProtectedRoute><MainLayout><UsuariosPage /></MainLayout></ProtectedRoute>} />
        
        {/* --- LA CORRECCIÓN ESTÁ AQUÍ --- */}
        <Route path="/administracion" element={<ProtectedRoute><MainLayout><AdministracionPage /></MainLayout></ProtectedRoute>} />
        
        {/* Ruta de Redirección Principal */}
        <Route path="*" element={<RootRedirect />} />
      </Routes>
    </Router>
  );
};

const RootRedirect = () => {
    const { user } = useAuth();
    return <Navigate to={user ? "/dashboard" : "/login"} />;
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <AuthProvider>
        <CssBaseline />
        <div className="App">
          <AppRouter />
        </div>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;