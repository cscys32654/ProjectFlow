import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../api/endpoints';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'member' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await authAPI.register(form);
      login(data.token, data.user);
      toast.success('Account created!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-1">Create account</h2>
        <p className="text-gray-500 text-sm mb-6">Get started for free</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          {[
            { label: 'Full name',  key: 'name',     type: 'text',     placeholder: 'John Doe' },
            { label: 'Email',      key: 'email',    type: 'email',    placeholder: 'you@example.com' },
            { label: 'Password',   key: 'password', type: 'password', placeholder: '••••••••' },
          ].map(({ label, key, type, placeholder }) => (
            <div key={key}>
              <label className="block text-sm font-medium mb-1">{label}</label>
              <input type={type} required value={form[key]}
                onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder={placeholder} />
            </div>
          ))}
          <div>
            <label className="block text-sm font-medium mb-1">Role</label>
            <select value={form.role}
              onChange={e => setForm(p => ({ ...p, role: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
              <option value="member">Member</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <button type="submit" disabled={loading}
            className="w-full bg-primary hover:bg-primary-hover text-white rounded-lg py-2.5 text-sm font-medium transition-colors disabled:opacity-60">
            {loading ? 'Creating…' : 'Create account'}
          </button>
        </form>
        <p className="text-center text-sm text-gray-500 mt-6">
          Have an account? <Link to="/login" className="text-primary font-medium">Sign in</Link>
        </p>
      </div>
    </div>
  );
}