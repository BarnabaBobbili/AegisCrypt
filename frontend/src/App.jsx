import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Header from './components/layout/Header';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Classification from './pages/Classification';
import Encryption from './pages/Encryption';
import Policies from './pages/Policies';
import Analytics from './pages/Analytics';
import UserManagement from './pages/UserManagement';
import MFASetup from './pages/MFASetup';
import PublicEncrypt from './pages/PublicEncrypt';
import PublicDecrypt from './pages/PublicDecrypt';
import BenchmarkDashboard from './pages/BenchmarkDashboard';

function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    {/* Public Routes (No Authentication Required) */}
                    <Route path="/login" element={<Login />} />
                    <Route path="/encrypt" element={<PublicEncrypt />} />
                    <Route path="/share/:token" element={<PublicDecrypt />} />

                    {/* Protected Routes */}
                    <Route
                        path="/*"
                        element={
                            <ProtectedRoute>
                                <div className="min-h-screen bg-slate-900">
                                    <Header />
                                    <Routes>
                                        <Route path="/" element={<Dashboard />} />
                                        <Route path="/classification" element={<Classification />} />
                                        <Route path="/encryption" element={<Encryption />} />
                                        <Route path="/policies" element={<Policies />} />
                                        <Route path="/analytics" element={<Analytics />} />
                                        <Route path="/benchmarks" element={<BenchmarkDashboard />} />
                                        <Route path="/admin/users" element={<UserManagement />} />
                                        <Route path="/mfa/setup" element={<MFASetup />} />
                                        <Route path="*" element={<Navigate to="/" replace />} />
                                    </Routes>
                                </div>
                            </ProtectedRoute>
                        }
                    />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;
