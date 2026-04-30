import Task from '../models/Task.js';

export const getDashboardStats = async (req, res) => {
  try {
    const isAdmin = req.user.role === 'admin';
    const matchQuery = isAdmin ? {} : { assignedTo: req.user._id };
    const now = new Date();

    const stats = await Task.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: null,
          total:      { $sum: 1 },
          completed:  { $sum: { $cond: [{ $eq: ['$status', 'Done'] }, 1, 0] } },
          inProgress: { $sum: { $cond: [{ $eq: ['$status', 'In Progress'] }, 1, 0] } },
          overdue: {
            $sum: {
              $cond: [
                { $and: [{ $lt: ['$dueDate', now] }, { $ne: ['$status', 'Done'] }] },
                1, 0
              ]
            }
          }
        }
      }
    ]);

    const result = stats[0] || { total: 0, completed: 0, inProgress: 0, overdue: 0 };
    result.pending = result.total - result.completed;
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};