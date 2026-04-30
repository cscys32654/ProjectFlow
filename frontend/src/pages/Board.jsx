import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { projectAPI, taskAPI, authAPI } from '../api/endpoints';
import { useAuth } from '../context/AuthContext';
import { format, isPast, parseISO } from 'date-fns';
import toast from 'react-hot-toast';

const COLUMNS = ['Todo', 'In Progress', 'Done'];

const statusColors = {
  'Todo':        'bg-gray-100 text-gray-700',
  'In Progress': 'bg-blue-100 text-blue-700',
  'Done':        'bg-green-100 text-green-700',
};

const Modal = ({ title, onClose, children }) => (
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg">
      <div className="flex items-center justify-between p-6 border-b border-gray-200">
        <h3 className="font-semibold text-lg">{title}</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">×</button>
      </div>
      <div className="p-6">{children}</div>
    </div>
  </div>
);

const TaskCard = ({ task, index, isAdmin, onEdit, onDelete }) => {
  const overdue = task.dueDate && task.status !== 'Done' && isPast(parseISO(task.dueDate));
  return (
    <Draggable draggableId={task._id} index={index} isDragDisabled={!isAdmin}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`bg-white rounded-xl border p-4 mb-3 cursor-default transition-shadow ${
            snapshot.isDragging ? 'shadow-lg border-primary' : 'border-gray-200 hover:shadow-sm'
          }`}
        >
          <div className="flex items-start justify-between gap-2 mb-2">
            <p className="text-sm font-medium text-gray-900 leading-snug">{task.title}</p>
            {isAdmin && (
              <div className="flex gap-1 shrink-0">
                <button onClick={() => onEdit(task)} className="text-gray-300 hover:text-blue-400 transition-colors text-xs px-1">✏️</button>
                <button onClick={() => onDelete(task._id)} className="text-gray-300 hover:text-red-400 transition-colors text-xs px-1">🗑️</button>
              </div>
            )}
          </div>
          {task.description && (
            <p className="text-xs text-gray-500 mb-3 line-clamp-2">{task.description}</p>
          )}
          <div className="flex items-center justify-between">
            {task.assignedTo ? (
              <div className="flex items-center gap-1.5">
                <div className="w-5 h-5 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-bold text-primary">
                  {task.assignedTo.name?.[0]?.toUpperCase()}
                </div>
                <span className="text-xs text-gray-500">{task.assignedTo.name}</span>
              </div>
            ) : <span className="text-xs text-gray-300">Unassigned</span>}
            {task.dueDate && (
              <span className={`text-xs font-medium ${overdue ? 'text-red-500' : 'text-gray-400'}`}>
                {overdue ? '⚠ ' : ''}{format(parseISO(task.dueDate), 'MMM d')}
              </span>
            )}
          </div>
        </div>
      )}
    </Draggable>
  );
};

export default function Board() {
  const { id: projectId } = useParams();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [project, setProject]   = useState(null);
  const [tasks, setTasks]       = useState([]);
  const [members, setMembers]   = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [filter, setFilter]     = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [editTask, setEditTask]   = useState(null);
  const [form, setForm] = useState({ title: '', description: '', assignedTo: '', dueDate: '', status: 'Todo' });
  const [saving, setSaving] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [pRes, tRes] = await Promise.all([
        projectAPI.getById(projectId),
        taskAPI.getByProject(projectId),
      ]);
      setProject(pRes.data);
      setTasks(tRes.data);
      setMembers(pRes.data.members || []);
      if (isAdmin) {
        const uRes = await authAPI.users();
        setAllUsers(uRes.data);
      }
    } catch { toast.error('Failed to load board'); }
    finally { setLoading(false); }
  }, [projectId, isAdmin]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openCreate = () => {
    setEditTask(null);
    setForm({ title: '', description: '', assignedTo: '', dueDate: '', status: 'Todo' });
    setShowModal(true);
  };

  const openEdit = (task) => {
    setEditTask(task);
    setForm({
      title: task.title,
      description: task.description || '',
      assignedTo: task.assignedTo?._id || '',
      dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
      status: task.status,
    });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form, assignedTo: form.assignedTo || null, dueDate: form.dueDate || null };
      if (editTask) {
        const { data } = await taskAPI.update(projectId, editTask._id, payload);
        setTasks(t => t.map(x => x._id === data._id ? data : x));
        toast.success('Task updated');
      } else {
        const { data } = await taskAPI.create(projectId, payload);
        setTasks(t => [data, ...t]);
        toast.success('Task created');
      }
      setShowModal(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save task');
    } finally { setSaving(false); }
  };

  const handleDelete = async (taskId) => {
    if (!confirm('Delete this task?')) return;
    try {
      await taskAPI.delete(projectId, taskId);
      setTasks(t => t.filter(x => x._id !== taskId));
      toast.success('Task deleted');
    } catch { toast.error('Failed to delete'); }
  };

  const onDragEnd = async ({ draggableId, destination, source }) => {
    if (!destination || destination.droppableId === source.droppableId) return;
    const newStatus = destination.droppableId;
    setTasks(t => t.map(x => x._id === draggableId ? { ...x, status: newStatus } : x));
    try {
      await taskAPI.updateStatus(projectId, draggableId, newStatus);
    } catch {
      toast.error('Failed to update status');
      fetchData();
    }
  };

  const filteredTasks = filter === 'All' ? tasks : tasks.filter(t => t.status === filter);
  const getColumnTasks = (col) => filteredTasks.filter(t => t.status === col);

  if (loading) return (
    <div className="p-8">
      <div className="animate-pulse mb-8"><div className="h-7 bg-gray-200 rounded w-48 mb-2" /><div className="h-4 bg-gray-200 rounded w-32" /></div>
      <div className="grid grid-cols-3 gap-4">
        {COLUMNS.map(c => <div key={c} className="bg-white rounded-xl border border-gray-200 p-4 h-64 animate-pulse" />)}
      </div>
    </div>
  );

  return (
    <div className="p-8 min-h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">{project?.name}</h2>
          <p className="text-gray-500 text-sm mt-0.5">{tasks.length} tasks · {members.length} members</p>
        </div>
        {isAdmin && (
          <button onClick={openCreate}
            className="bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            + Add Task
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6">
        {['All', ...COLUMNS].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              filter === f ? 'bg-primary text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}>
            {f}
            <span className="ml-1.5 text-xs opacity-70">
              {f === 'All' ? tasks.length : tasks.filter(t => t.status === f).length}
            </span>
          </button>
        ))}
      </div>

      {/* Kanban */}
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {COLUMNS.map(col => (
            <div key={col} className="bg-gray-100 rounded-xl p-3">
              <div className="flex items-center justify-between mb-3 px-1">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded-md text-xs font-medium ${statusColors[col]}`}>{col}</span>
                </div>
                <span className="text-xs text-gray-400 font-medium">{getColumnTasks(col).length}</span>
              </div>
              <Droppable droppableId={col}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`min-h-24 rounded-lg transition-colors ${snapshot.isDraggingOver ? 'bg-indigo-50' : ''}`}
                  >
                    {getColumnTasks(col).map((task, i) => (
                      <TaskCard key={task._id} task={task} index={i}
                        isAdmin={isAdmin} onEdit={openEdit} onDelete={handleDelete} />
                    ))}
                    {provided.placeholder}
                    {getColumnTasks(col).length === 0 && !snapshot.isDraggingOver && (
                      <p className="text-center text-xs text-gray-400 py-6">No tasks</p>
                    )}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>

      {/* Task Modal */}
      {showModal && (
        <Modal title={editTask ? 'Edit Task' : 'New Task'} onClose={() => setShowModal(false)}>
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Title *</label>
              <input required value={form.title}
                onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Task title" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea value={form.description} rows={3}
                onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                placeholder="Optional details…" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1">Assign to</label>
                <select value={form.assignedTo}
                  onChange={e => setForm(p => ({ ...p, assignedTo: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                  <option value="">Unassigned</option>
                  {members.map(m => (
                    <option key={m._id} value={m._id}>{m.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Status</label>
                <select value={form.status}
                  onChange={e => setForm(p => ({ ...p, status: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                  {COLUMNS.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Due date</label>
              <input type="date" value={form.dueDate}
                onChange={e => setForm(p => ({ ...p, dueDate: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setShowModal(false)}
                className="flex-1 border border-gray-300 rounded-lg py-2 text-sm font-medium hover:bg-gray-50 transition-colors">
                Cancel
              </button>
              <button type="submit" disabled={saving}
                className="flex-1 bg-primary hover:bg-primary-hover text-white rounded-lg py-2 text-sm font-medium transition-colors disabled:opacity-60">
                {saving ? 'Saving…' : editTask ? 'Update' : 'Create'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}