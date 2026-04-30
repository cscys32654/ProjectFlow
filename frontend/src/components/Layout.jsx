import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-xl font-bold text-primary">ProjectFlow</h1>
          <p className="text-xs text-gray-500 mt-1 capitalize">{user?.role} account</p>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {[
            { to: '/dashboard', label: '📊 Dashboard' },
            { to: '/projects',  label: '📁 Projects' },
          ].map(({ to, label }) => (
            <NavLink
              key={to} to={to}
              className={({ isActive }) =>
                `block px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive ? 'bg-indigo-50 text-primary' : 'text-gray-600 hover:bg-gray-100'
                }`
              }
            >{label}</NavLink>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-primary text-sm font-bold">
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium truncate">{user?.name}</p>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            </div>
          </div>
          <button onClick={handleLogout}
            className="w-full text-sm text-gray-500 hover:text-red-500 transition-colors text-left px-2">
            Sign out →
          </button>
        </div>
      </aside>
      {/* Main */}
      <main className="flex-1 overflow-auto bg-gray-50">
        <Outlet />
      </main>
    </div>
  );
}