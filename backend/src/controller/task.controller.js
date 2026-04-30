import Task from '../models/Task.js';
import Project from '../models/Project.js';

const assertProjectAccess = async (projectId, userId, role) => {
  const project = await Project.findById(projectId);
  if (!project) throw { status: 404, message: 'Project not found' };
  if (role !== 'admin') {
    const isMember = project.members.some((m) => m.toString() === userId.toString());
    if (!isMember) throw { status: 403, message: 'Access denied' };
  }
  return project;
};

export const createTask = async (req, res) => {
  try {
    await assertProjectAccess(req.params.projectId, req.user._id, req.user.role);
    const { title, description, assignedTo, dueDate, status } = req.body;
    const task = await Task.create({
      title, description, assignedTo, dueDate, status,
      projectId: req.params.projectId,
      createdBy: req.user._id,
    });
    await task.populate('assignedTo', 'name email');
    res.status(201).json(task);
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
};

export const getTasksByProject = async (req, res) => {
  try {
    await assertProjectAccess(req.params.projectId, req.user._id, req.user.role);
    const filter = { projectId: req.params.projectId };
    if (req.user.role === 'member') filter.assignedTo = req.user._id;
    if (req.query.status) filter.status = req.query.status;

    const tasks = await Task.find(filter)
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name')
      .sort('-createdAt');
    res.json(tasks);
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
};

export const getTaskById = async (req, res) => {
  try {
    const task = await Task.findById(req.params.taskId)
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name');
    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.json(task);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateTask = async (req, res) => {
  try {
    const task = await Task.findByIdAndUpdate(
      req.params.taskId,
      { $set: req.body },
      { new: true, runValidators: true }
    ).populate('assignedTo', 'name email');
    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.json(task);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteTask = async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.taskId);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.json({ message: 'Task deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateTaskStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['Todo', 'In Progress', 'Done'];
    if (!validStatuses.includes(status))
      return res.status(400).json({ message: 'Invalid status' });

    const task = await Task.findById(req.params.taskId);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    const isAdmin = req.user.role === 'admin';
    const isAssigned = task.assignedTo?.toString() === req.user._id.toString();
    if (!isAdmin && !isAssigned)
      return res.status(403).json({ message: 'Not assigned to this task' });

    task.status = status;
    await task.save();
    await task.populate('assignedTo', 'name email');
    res.json(task);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};