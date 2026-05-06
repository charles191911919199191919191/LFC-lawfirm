import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './stores/useAuthStore';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Appointments from './pages/Appointments';
import Analytics from './pages/Analytics';
import Users from './pages/Users';
import Lawyers from './pages/Lawyers';
import Settings from './pages/Settings';
import NotFound from './pages/NotFound';

export default function App() {
  const user = useAuthStore((state) => state.user);

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-50 text-slate-900">
        <Toaster position="top-right" />
        <Routes>
          <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
          <Route path="/register" element={user ? <Navigate to="/" /> : <Register />} />
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <div className="lg:flex lg:min-h-screen lg:gap-6 p-4 lg:p-6">
                  <Sidebar />
                  <div className="flex-1 space-y-6">
                    <Navbar />
                    <div className="space-y-6">
                      <Routes>
                        <Route path="/" element={<Dashboard />} />
                        <Route path="/appointments" element={<Appointments />} />
                        <Route path="/analytics" element={<Analytics />} />
                        <Route path="/users" element={<Users />} />
                        <Route path="/lawyers" element={<Lawyers />} />
                        <Route path="/settings" element={<Settings />} />
                        <Route path="*" element={<NotFound />} />
                      </Routes>
                    </div>
                  </div>
                </div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
