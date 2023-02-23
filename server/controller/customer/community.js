export default class CommunityController {
  constructor(communityRepository) {
    this.community = communityRepository;
  }

  /* postId로 접근하는 것들에 대해 유효한 값인지 사전에 검사 */
  checkUniqueId = async (req, res, next) => {
    const postId = req.params.id;

    const existence = await this.community.checkExistPost(postId);

    if (!existence) {
      return res.sendStatus(404)
    }

    next();
  }

  /* 게시글 작성 */
  writePost = async (req, res) => {
    try {
      const { username } = req;
      const { title, content } = req.body;

      if (title.length < 1 || title.length > 100) {
        throw new Error('ERROR61001');
      }

      if (content.length < 1) {
        throw new Error('ERROR61001');
      }

      const postId = await this.community.writePost(title, content, username);

      res.status(201).json({ postId });
    } catch (error) {
      console.log(error);
      return res.status(400).json({code: error.message || ''});
    }
  };

  /* 게시글 수정 */
  modifyPost = async (req, res) => {
    try {
      const { username } = req;
      const postId = req.params.id;
      const { title, content } = req.body;

      if (title.length < 1 || title.length > 100) {
        throw new Error('ERROR61001');
      }

      if (content.length < 1) {
        throw new Error('ERROR61001');
      }

      const affectedRows  = await this.community.modifyPost(postId, username, title, content);

      if (!affectedRows) {
        return res.sendStatus(403);
      }

      res.sendStatus(204);
    } catch (error) {
      console.log(error);
      return res.status(400).json({code: error.message || ''});
    }
  };

  /* 댓글 작성 */
  writeComment = async (req, res) => {
    try {
      const { username } = req;
      const postId = req.params.id;
      const { comment } = req.body;

      if (comment.length < 1) {
        throw new Error('ERROR61001');
      }

      await this.community.writeComment(postId, comment, username);

      res.sendStatus(204);
    } catch (error) {
      console.log(error);
      return res.status(400).json({code: error.message || ''});
    }
  };

  /* 댓글 삭제 */
  deleteComment = async (req, res) => {
    try {
      const { username } = req;
      const commentId = req.query.commentId;

      const affectedRows = await this.community.deleteComment(commentId, username);

      if (!affectedRows) {
        return res.sendStatus(403);
      }

      res.sendStatus(204);
    } catch (error) {
      console.log(error);
      return res.sendStatus(400);
    }
  };

  /* 게시글 삭제 */
  deletePost = async (req, res) => {
    try {
      const postId = req.params.id;
      const username = req.username;

      const affectedRow = await this.community.deletePost(postId, username);

      if (!affectedRow) {
        return res.sendStatus(403);
      }

      res.sendStatus(204);
    } catch (error) {
      console.log(error);
      return res.sendStatus(400);
    }
  };

  /* 게시글에 달려있는 댓글 불러오기 */
  getComments = async (req, res) => {
    try {
      const postId = req.params.id;
      let { pageNum } = req.query;

      if (isNaN(Number(pageNum))) return res.sendStatus(404);

      const amountOfSendData = 5; // 한번에 보낼 댓글의 개수
      let prevPage = (pageNum - 1) * amountOfSendData;
      let commentPageLength = 1;

      const amountOfComments = await this.community.getAmountOfComments(postId);

      if (amountOfComments === 0) {
        return res.status(200).json({ comments: [], commentPageLength });
      }

      let comments = await this.community.getComments(
        postId,
        amountOfSendData,
        prevPage
      );

      if (amountOfComments % amountOfSendData > 0) {
        commentPageLength = Math.ceil(amountOfComments / amountOfSendData);
      } else {
        commentPageLength = amountOfComments / amountOfSendData;
      }

      res.status(200).json({ comments, commentPageLength });
    } catch (error) {
      console.log(error);
      return res.sendStatus(400);
    }
  };

  /* 선택한 게시글 불러오기 */
  getPost = async (req, res) => {
    try {
      const postId = req.params.id;

      const post = await this.community.getPostById(postId)

      res.status(200).json({ post });
    } catch (error) {
      console.log(error);
      return res.sendStatus(400);
    }
  };

  /* community 게시글 목록 불러오기 */
  getAllPosts = async (req, res) => {
    try {
      let { cat, search, pageNum } = req.query;

      if (isNaN(Number(pageNum))) return res.sendStatus(404);

      const amountOfSendData = 10; // 한번에 보낼 게시글의 개수
      let prevPage = (pageNum - 1) * amountOfSendData;
      let posts;
      let postPageLength = 1;
      let amountOfPosts = 0;

      if (!search) {
        amountOfPosts = await this.community.getAmountOfPosts();
      } else {
        if (!cat) {
          amountOfPosts = await this.community.getAmountOfPostsByWord(search);
        } else {
          amountOfPosts =
            await this.community.getAmountOfPostsByWordAndCategory(cat, search);
        }
      }

      if (amountOfPosts === 0) {
        return res.status(200).json({ posts: [], postPageLength });
      }

      if (!search) {
        posts = await this.community.getAllPosts(amountOfSendData, prevPage);
      } else {
        if (!cat) {
          posts = await this.community.getAllPostsByWord(
            search,
            amountOfSendData,
            prevPage
          );
        } else {
          posts = await this.community.getAllPostsByWordAndCategory(
            cat,
            search,
            amountOfSendData,
            prevPage
          );
        }
      }

      if (amountOfPosts % amountOfSendData > 0) {
        postPageLength = Math.ceil(amountOfPosts / amountOfSendData);
      } else {
        postPageLength = amountOfPosts / amountOfSendData;
      }

      res.status(200).json({ posts, postPageLength });
    } catch (error) {
      console.log(error);
      return res.sendStatus(400);
    }
  };
}
