import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Header from './components/layout/Header';

// Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Classification from './pages/Classification';
import Encryption from './pages/Encryption';
import Policies from './pages/Policies';
import Analytics from './pages/Analytics';
import UserManagement from './pages/UserManagement';
import MFASetup from './pages/MFASetup';
import PublicDecrypt from './pages/PublicDecrypt';
import BenchmarkDashboard from './pages/BenchmarkDashboard';

function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    {/* Public Routes (No Authentication Required) */}
                    <Route path="/" element={<Landing />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/share/:token" element={<PublicDecrypt />} />

                    {/* Protected Routes */}
                    <Route
                        path="/dashboard"
                        element={
                            <ProtectedRoute>
                                <div className="min-h-screen bg-slate-900">
                                    <Header />
                                    <Dashboard />
                                </div>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/classification"
                        element={
                            <ProtectedRoute>
                                <div className="min-h-screen bg-slate-900">
                                    <Header />
                                    <Classification />
                                </div>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/encryption"
                        element={
                            <ProtectedRoute>
                                <div className="min-h-screen bg-slate-900">
                                    <Header />
                                    <Encryption />
                                </div>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/policies"
                        element={
                            <ProtectedRoute>
                                <div className="min-h-screen bg-slate-900">
                                    <Header />
                                    <Policies />
                                </div>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/analytics"
                        element={
                            <ProtectedRoute>
                                <div className="min-h-screen bg-slate-900">
                                    <Header />
                                    <Analytics />
                                </div>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/benchmarks"
                        element={
                            <ProtectedRoute>
                                <div className="min-h-screen bg-slate-900">
                                    <Header />
                                    <BenchmarkDashboard />
                                </div>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/admin/users"
                        element={
                            <ProtectedRoute>
                                <div className="min-h-screen bg-slate-900">
                                    <Header />
                                    <UserManagement />
                                </div>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/mfa/setup"
                        element={
                            <ProtectedRoute>
                                <div className="min-h-screen bg-slate-900">
                                    <Header />
                                    <MFASetup />
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

