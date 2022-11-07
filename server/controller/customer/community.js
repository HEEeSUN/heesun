export default class CommunityController {
  constructor(communityRepository) {
    this.community = communityRepository;
  }

  /* postId로 접근하는 것들에 대해 유효한 값인지 사전에 검사 */
  checkUniqueId = async (req, res, next) => {
    const id = req.params.id;

    if (!id) {
      return res
        .status(404)
        .json({ message: "No unique id of post or comment" });
    }

    next();
  };

  /* 게시글 작성 */
  writePost = async (req, res) => {
    try {
      const { username } = req;
      const { title, content } = req.body;

      if (!title | !content) {
        return res
          .status(400)
          .json({ message: "failed to write post. fill your post." });
      }

      const postId = await this.community.writePost(title, content, username);

      res.status(201).json({ postId });
    } catch (error) {
      console.log(error);
      return res.sendStatus(400);
    }
  };

  /* 게시물 수정 */
  modifyPost = async (req, res) => {
    try {
      const postId = req.params.id;
      const { title, content } = req.body;

      const post = await this.community.getPostById(postId);

      if (!post) {
        return res.status(404).json({ message: "no exists post" });
      }

      await this.community.modifyPost(postId, title, content);

      res.sendStatus(204);
    } catch (error) {
      console.log(error);
      return res.sendStatus(400);
    }
  };

  /* 댓글 작성 */
  writeComment = async (req, res) => {
    try {
      const { username } = req;
      const postId = req.params.id;
      const { comment } = req.body;

      const post = await this.community.getPostById(postId);

      if (!post) {
        return res.status(404).json({ message: "no exists post" });
        // return res.status(409).json({ code: "ERROR40007" });
      }

      await this.community.writeComment(postId, comment, username);

      res.sendStatus(204);
    } catch (error) {
      console.log(error);
      return res.sendStatus(400);
    }
  };

  /* 게시글 및 댓글 삭제 */
  deleteComment = async (req, res) => {
    try {
      const { username } = req;
      const commentId = req.query.commentId;

      await this.community.deleteComment(commentId, username);

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

      await this.community.deletePost(postId, username);

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

  /* 선택한 게시글 및 댓글 불러오기 */
  getPost = async (req, res) => {
    try {
      const postId = req.params.id;

      const post = await this.community.getPostById(postId);

      if (!post) {
        return res.status(404).json({ message: "no exists post" });
      }

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
