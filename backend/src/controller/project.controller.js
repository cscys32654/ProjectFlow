import Project from '../models/Project.js';

export const createProject = async (req, res) => {
  try {
    const { name, description, members } = req.body;
    const project = await Project.create({
      name, description,
      adminId: req.user._id,
      members: members || [],
    });
    await project.populate('members', 'name email role');
    res.status(201).json(project);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getProjects = async (req, res) => {
  try {
    const query =
      req.user.role === 'admin'
        ? {}
        : { members: req.user._id };
    const projects = await Project.find(query)
      .populate('adminId', 'name email')
      .populate('members', 'name email role')
      .sort('-createdAt');
    res.json(projects);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('adminId', 'name email')
      .populate('members', 'name email role');
    if (!project)
      return res.status(404).json({ message: 'Project not found' });

    const isMember = project.members.some(
      (m) => m._id.toString() === req.user._id.toString()
    );
    if (req.user.role !== 'admin' && !isMember)
      return res.status(403).json({ message: 'Access denied' });

    res.json(project);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateProject = async (req, res) => {
  try {
    const project = await Project.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    ).populate('members', 'name email role');
    if (!project)
      return res.status(404).json({ message: 'Project not found' });
    res.json(project);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteProject = async (req, res) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);
    if (!project)
      return res.status(404).json({ message: 'Project not found' });
    res.json({ message: 'Project deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const addMember = async (req, res) => {
  try {
    const { userId } = req.body;
    const project = await Project.findByIdAndUpdate(
      req.params.id,
      { $addToSet: { members: userId } },
      { new: true }
    ).populate('members', 'name email role');
    if (!project)
      return res.status(404).json({ message: 'Project not found' });
    res.json(project);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const removeMember = async (req, res) => {
  try {
    const project = await Project.findByIdAndUpdate(
      req.params.id,
      { $pull: { members: req.params.userId } },
      { new: true }
    ).populate('members', 'name email role');
    if (!project)
      return res.status(404).json({ message: 'Project not found' });
    res.json(project);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};