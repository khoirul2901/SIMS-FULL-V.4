import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Role } from '../types';
import Swal from 'sweetalert2';

interface AuthContextType {
  user: User | null;
  login: (username: string, role: Role) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Dummy users for simulation
const MOCK_USERS: Record<string, User> = {
  admin: { id: '1', username: 'admin', name: 'Administrator', role: 'Admin' },
  kepsek: { id: '2', username: 'kepsek', name: 'Kepala Sekolah', role: 'Kepala Sekolah' },
  guru: { id: '3', username: 'guru', name: 'Budi Santoso, S.Pd', role: 'Guru' },
  walikelas: { id: '4', username: 'walikelas', name: 'Siti Aminah, M.Pd', role: 'Wali Kelas' },
  bk: { id: '5', username: 'bk', name: 'Rina Rahmawati, S.Psi', role: 'BK' },
  tu: { id: '6', username: 'tu', name: 'Agus Pratama', role: 'Tata Usaha' },
  bendahara: { id: '7', username: 'bendahara', name: 'Dewi Lestari', role: 'Bendahara' },
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check session in LocalStorage
    const storedUser = localStorage.getItem('sims_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = (username: string, role: Role) => {
    // In a real app, we would verify password here.
    // For this prototype, we just match username or create a mock user based on role
    const matchedUser = MOCK_USERS[username.toLowerCase()] || {
      id: Math.random().toString(36).substr(2, 9),
      username,
      name: `User ${role}`,
      role,
    };

    setUser(matchedUser);
    localStorage.setItem('sims_user', JSON.stringify(matchedUser));
    
    Swal.fire({
      icon: 'success',
      title: 'Login Berhasil',
      text: `Selamat datang, ${matchedUser.name}!`,
      timer: 1500,
      showConfirmButton: false,
    });
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('sims_user');
    Swal.fire({
      icon: 'info',
      title: 'Logout Berhasil',
      text: 'Anda telah keluar dari sistem.',
      timer: 1500,
      showConfirmButton: false,
    });
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-500">Memuat sesi...</div>;
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
