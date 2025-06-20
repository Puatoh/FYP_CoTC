const ForumT1 = require('../models/forumT1Model');
const ForumT1Comment = require('../models/forumT1CommentModel');
const ForumT1Reply = require('../models/forumT1ReplyModel');

exports.getRecentActivity = async (req, res) => {
  try {
    const latestComments = await ForumT1Comment.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('topicId', 'title')
      .select('authorUsername content createdAt topicId')
      .lean();

    const latestReplies = await ForumT1Reply.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate({
        path: 'comment',
        populate: { path: 'topicId', select: 'title' },
      })
      .select('authorUsername content createdAt comment')
      .lean();

    const mappedComments = latestComments.map(c => ({
      type: 'Comment',
      content: c.content,
      authorUsername: c.authorUsername,
      createdAt: c.createdAt,
      topicId: c.topicId?._id,
      topicTitle: c.topicId?.title,
      commentId: null,
    }));

    const mappedReplies = latestReplies.map(r => ({
      type: 'Reply',
      content: r.content,
      authorUsername: r.authorUsername,
      createdAt: r.createdAt,
      topicId: r.comment?.topicId?._id,
      topicTitle: r.comment?.topicId?.title,
      commentId: r.comment?._id,
    }));

    const combined = [...mappedComments, ...mappedReplies]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5); // limit to 5

    res.json(combined);
  } catch (err) {
    console.error('Error fetching forum activity:', err);
    res.status(500).json({ message: 'Server error fetching forum activity' });
  }
};
