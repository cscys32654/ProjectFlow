import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { projectAPI, authAPI } from '../api/endpoints';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Modal = ({ title, onClose, children }) => (
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
      <div className="flex items-center justify-between p-6 border-b border-gray-200">
        <h3 className="font-semibold text-lg">{title}</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
      </div>
      <div className="p-6">{children}</div>
    </div>
  </div>
);

export default function Projects() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', members: [] });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([
      projectAPI.getAll(),
      isAdmin ? authAPI.users() : Promise.resolve({ data: [] }),
    ]).then(([pRes, uRes]) => {
      setProjects(pRes.data);
      setUsers(uRes.data);
    }).finally(() => setLoading(false));
  }, [isAdmin]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await projectAPI.create(form);
      setProjects(p => [data, ...p]);
      setShowModal(false);
      setForm({ name: '', description: '', members: [] });
      toast.success('Project created!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create project');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this project?')) return;
    try {
      await projectAPI.delete(id);
      setProjects(p => p.filter(x => x._id !== id));
      toast.success('Project deleted');
    } catch {
      toast.error('Failed to delete');
    }
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold">Projects</h2>
          <p className="text-gray-500 text-sm mt-1">{projects.length} project{projects.length !== 1 ? 's' : ''}</p>
        </div>
        {isAdmin && (
          <button onClick={() => setShowModal(true)}
            className="bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            + New Project
          </button>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array(3).fill(0).map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-5 animate-pulse h-36" />
          ))}
        </div>
      ) : projects.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-5xl mb-4">📁</p>
          <p className="font-medium">No projects yet</p>
          {isAdmin && <p className="text-sm mt-1">Create your first project to get started</p>}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map(p => (
            <div key={p._id} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between gap-2 mb-3">
                <h3 className="font-semibold text-gray-900 truncate">{p.name}</h3>
                {isAdmin && (
                  <button onClick={() => handleDelete(p._id)}
                    className="text-gray-300 hover:text-red-400 transition-colors text-lg leading-none shrink-0">×</button>
                )}
              </div>
              <p className="text-sm text-gray-500 mb-4 line-clamp-2">{p.description || 'No description'}</p>
              <div className="flex items-center justify-between">
                <div className="flex -space-x-2">
                  {p.members?.slice(0, 4).map(m => (
                    <div key={m._id} title={m.name}
                      className="w-7 h-7 rounded-full bg-indigo-100 border-2 border-white flex items-center justify-center text-xs font-bold text-primary">
                      {m.name?.[0]?.toUpperCase()}
                    </div>
                  ))}
                  {p.members?.length > 4 && (
                    <div className="w-7 h-7 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center text-xs text-gray-500">
                      +{p.members.length - 4}
                    </div>
                  )}
                </div>
                <Link to={`/projects/${p._id}/board`}
                  className="text-sm text-primary font-medium hover:underline">
                  Open board →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <Modal title="New Project" onClose={() => setShowModal(false)}>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Project name</label>
              <input required value={form.name}
                onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="e.g. Website Redesign" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea value={form.description}
                onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                placeholder="Optional description…" />
            </div>
            {users.length > 0 && (
              <div>
                <label className="block text-sm font-medium mb-1">Add members</label>
                <div className="max-h-36 overflow-y-auto border border-gray-200 rounded-lg divide-y divide-gray-100">
                  {users.filter(u => u._id !== user?.id).map(u => (
                    <label key={u._id} className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 cursor-pointer">
                      <input type="checkbox"
                        checked={form.members.includes(u._id)}
                        onChange={e => setForm(p => ({
                          ...p,
                          members: e.target.checked
                            ? [...p.members, u._id]
                            : p.members.filter(id => id !== u._id)
                        }))} />
                      <span className="text-sm">{u.name}</span>
                      <span className="text-xs text-gray-400 ml-auto capitalize">{u.role}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setShowModal(false)}
                className="flex-1 border border-gray-300 rounded-lg py-2 text-sm font-medium hover:bg-gray-50 transition-colors">
                Cancel
              </button>
              <button type="submit" disabled={saving}
                className="flex-1 bg-primary hover:bg-primary-hover text-white rounded-lg py-2 text-sm font-medium transition-colors disabled:opacity-60">
                {saving ? 'Creating…' : 'Create'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}