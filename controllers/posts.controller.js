// Models
const { Post } = require('../models/post.model');
const { User } = require('../models/user.model');
const { Comment } = require('../models/comment.model');
const { PostImg } = require('../models/postImg.model');

//utils
const { catchAsyng } = require('../utils/catchAsync.util');
const {uploadPostImgs , getPostImgsUrls} = require('../utils/firebase.util');
//const { async } = require('@firebase/util');

const getAllPosts = catchAsyng(async (req, res, next) => {
  const postnew = await Post.findAll({
    attributes: ['id', 'title', 'content', 'createdAt'],
    include: [
      { model: User, attributes: ['id', 'name'] },
      {
        model: Comment,
        required: false, //aply  OUTER JOIN
        where: { status: 'active' },
        attributes: ['id', 'comment', 'status', 'createdAt'],
      },

      { model: PostImg },
    ],
  });

   const postsWithImgs = await getPostImgsUrls(postnew)   

  res.status(200).json({
    status: 'success',
    data: {
      postnew: postsWithImgs,
    },
  });
});

const createPost = catchAsyng(async (req, res, next) => {
  const { title, content } = req.body;
  const { sessionUser } = req;

  const newPost = await Post.create({
    title,
    content,
    userId: sessionUser.id,
  });

  await uploadPostImgs(req.files, newPost.id);

  res.status(201).json({
    status: 'success',
    data: { newPost },
  });
});

const updatePost = catchAsyng(async (req, res, next) => {
  const { title, content } = req.body;
  const { post } = req;

  await post.update({ title, content });

  res.status(200).json({
    status: 'success',
    data: { post },
  });
});

const deletePost = catchAsyng(async (req, res, next) => {
  const { post } = req;

  await post.update({ status: 'deleted' });

  res.status(200).json({
    status: 'success',
  });
});

module.exports = {
  getAllPosts,
  createPost,
  updatePost,
  deletePost,
};
