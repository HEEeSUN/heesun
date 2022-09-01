import CommunityController from "../../controller/customer/community";
import httpMocks from "node-mocks-http";

describe("community", () => {
  let communityRepository;
  let communityController;

  beforeEach(() => {
    communityRepository = {};
    communityController = new CommunityController(communityRepository);
  });

  describe("checkUniqueId", () => {
    it("성공", async () => {
      const request = httpMocks.createRequest({
        params: {
          id: 1,
        },
      });
      const response = httpMocks.createResponse();
      const next = jest.fn();

      await communityController.checkUniqueId(request, response, next);

      expect(next).toHaveBeenCalledTimes(1);
    });

    it("실패 : 게시글 id가 없는 경우", async () => {
      const request = httpMocks.createRequest();
      const response = httpMocks.createResponse();
      const next = jest.fn();

      await communityController.checkUniqueId(request, response, next);

      expect(response.statusCode).toBe(404);
      expect(response._getJSONData().message).toBe(
        "No unique id of post or comment"
      );
      expect(next).not.toBeCalled();
    });
  });

  describe("writePost", () => {
    it("성공", async () => {
      const request = httpMocks.createRequest({
        body: {
          title: "title..",
          content: "content..",
        },
      });
      const response = httpMocks.createResponse();
      const postId = 1;
      communityRepository.writePost = () => postId;

      await communityController.writePost(request, response);

      expect(response.statusCode).toBe(201);
      expect(response._getJSONData()).toEqual({ postId: postId });
    });

    it("실패 : 내용이 없는 경우", async () => {
      const request = httpMocks.createRequest({
        body: {
          title: "title..",
        },
      });
      const response = httpMocks.createResponse();

      await communityController.writePost(request, response);

      expect(response.statusCode).toBe(400);
    });

    it("실패 : 제목이 없는 경우", async () => {
      const request = httpMocks.createRequest({
        body: {
          content: "content..",
        },
      });
      const response = httpMocks.createResponse();

      await communityController.writePost(request, response);

      expect(response.statusCode).toBe(400);
    });

    it("실패 : 내용 및 제목이 없는 경우", async () => {
      const request = httpMocks.createRequest({
        body: {},
      });
      const response = httpMocks.createResponse();

      await communityController.writePost(request, response);

      expect(response.statusCode).toBe(400);
    });

    it("실패 : catch error", async () => {
      // const username = 'user'
      const request = httpMocks.createRequest({
        body: {
          title: "title..",
          content: "content..",
        },
      });
      const response = httpMocks.createResponse();

      communityRepository.writePost = () => {
        throw new Error("err");
      };

      await communityController.writePost(request, response);

      expect(response.statusCode).toBe(400);
    });
  });

  describe("modifyPost", () => {
    it("성공", async () => {
      const title = "modify title..";
      const content = "modify content..";
      const reqeust = httpMocks.createRequest({
        params: {
          id: 1,
        },
        body: {
          title,
          content,
        },
      });
      const response = httpMocks.createResponse();
      const post = { post_id: 1, title: "post title", content: "post content" };
      communityRepository.getPostById = () => post;
      communityRepository.modifyPost = jest.fn();

      await communityController.modifyPost(reqeust, response);

      expect(response.statusCode).toBe(204);
    });

    it("실패 : 존재하지 않는 게시글일 경우", async () => {
      const title = "modify title..";
      const content = "modify content..";
      const request = httpMocks.createRequest({
        params: {
          id: 1,
        },
        body: {
          title,
          content,
        },
      });
      const response = httpMocks.createResponse();
      communityRepository.getPostById = () => {};

      await communityController.modifyPost(request, response);

      expect(response.statusCode).toBe(404);
      expect(response._getJSONData().message).toBe("no exists post");
    });

    it("실패 : catch error", async () => {
      const title = "modify title..";
      const content = "modify content..";
      const reqeust = httpMocks.createRequest({
        params: {
          id: 1,
        },
        body: {
          title,
          content,
        },
      });
      const response = httpMocks.createResponse();
      const post = { post_id: 1, title: "post title", content: "post content" };
      communityRepository.getPostById = () => post;
      communityRepository.modifyPost = () => {
        throw new Error();
      };

      await communityController.modifyPost(reqeust, response);

      expect(response.statusCode).toBe(400);
    });
  });

  describe("writeComment", () => {
    it("성공", async () => {
      const reqeust = httpMocks.createRequest({
        query: {
          postId: 1,
        },
        body: {
          comment: "comment...",
        },
      });
      const response = httpMocks.createResponse();
      const post = { post_id: 1, title: "post title", content: "post content" };
      communityRepository.getPostById = () => post;
      communityRepository.writeComment = jest.fn();

      await communityController.writeComment(reqeust, response);

      expect(response.statusCode).toBe(204);
    });

    it("실패 : 존재하지 않는 게시글일 경우", async () => {
      const reqeust = httpMocks.createRequest({
        query: {
          postId: 1,
        },
        body: {
          comment: "comment...",
        },
      });
      const response = httpMocks.createResponse();
      communityRepository.getPostById = () => {};

      await communityController.writeComment(reqeust, response);

      expect(response.statusCode).toBe(404);
      expect(response._getJSONData().message).toBe("no exists post");
    });

    it("실패 : catch error", async () => {
      const reqeust = httpMocks.createRequest({
        query: {
          postId: 1,
        },
        body: {
          comment: "comment...",
        },
      });
      const response = httpMocks.createResponse();
      const post = { post_id: 1, title: "post title", content: "post content" };
      communityRepository.getPostById = () => post;
      communityRepository.writeComment = () => {
        throw new Error();
      };

      await communityController.writeComment(reqeust, response);

      expect(response.statusCode).toBe(400);
    });
  });

  describe("deleteComment", () => {
    it("성공", async () => {
      const reqeust = httpMocks.createRequest({
        params: {
          id: 1,
        },
      });
      const response = httpMocks.createResponse();

      communityRepository.deleteComment = jest.fn();

      await communityController.deleteComment(reqeust, response);

      expect(response.statusCode).toBe(204);
    });

    it("실패 : catch error", async () => {
      const reqeust = httpMocks.createRequest({
        params: {
          id: 1,
        },
      });
      const response = httpMocks.createResponse();
      communityRepository.deleteComment = () => {
        throw new Error();
      };

      await communityController.deleteComment(reqeust, response);

      expect(response.statusCode).toBe(400);
    });
  });

  describe("deletePost", () => {
    it("성공", async () => {
      const reqeust = httpMocks.createRequest({
        params: {
          id: 1,
        },
      });
      const response = httpMocks.createResponse();

      communityRepository.deletePost = jest.fn();

      await communityController.deletePost(reqeust, response);

      expect(response.statusCode).toBe(204);
    });

    it("실패 : catch error", async () => {
      const reqeust = httpMocks.createRequest({
        params: {
          id: 1,
        },
      });
      const response = httpMocks.createResponse();
      communityRepository.deletePost = () => {
        throw new Error();
      };

      await communityController.deletePost(reqeust, response);

      expect(response.statusCode).toBe(400);
    });
  });

  describe("getComments", () => {
    it("성공", async () => {
      const request = httpMocks.createRequest({
        query: {
          postId: 1,
          pageNum: 1,
        },
      });
      const response = httpMocks.createResponse();
      const comments = [
        {
          comment_id: 1,
          content: "1st comment",
          username: "user",
          createdAt: "2022-04-01",
        },
      ];
      const amountOfComments = comments.length;
      communityRepository.getAmountOfComments = () => amountOfComments;
      communityRepository.getComments = () => comments;

      await communityController.getComments(request, response);

      expect(response.statusCode).toBe(200);
      expect(response._getJSONData()).toEqual({
        comments,
        commentPageLength: 1,
      });
    });

    it("성공 : 전송할 댓글의 개수가 정해진 개수보다 클 경우", async () => {
      const request = httpMocks.createRequest({
        query: {
          postId: 1,
          pageNum: 1,
        },
      });
      const response = httpMocks.createResponse();
      const comments = [
        {
          comment_id: 1,
          content: "1st comment",
          username: "user",
          createdAt: "2022-04-01",
        },
        {
          comment_id: 2,
          content: "2nd comment",
          username: "user",
          createdAt: "2022-04-02",
        },
        {
          comment_id: 3,
          content: "3rd comment",
          username: "user",
          createdAt: "2022-04-03",
        },
        {
          comment_id: 4,
          content: "4th comment",
          username: "user",
          createdAt: "2022-04-04",
        },
        {
          comment_id: 5,
          content: "5st comment",
          username: "user",
          createdAt: "2022-04-05",
        },
        {
          comment_id: 6,
          content: "6st comment",
          username: "user",
          createdAt: "2022-04-06",
        },
      ];
      const amountOfComments = comments.length;
      communityRepository.getAmountOfComments = () => amountOfComments;
      communityRepository.getComments = () => comments;

      await communityController.getComments(request, response);

      expect(response.statusCode).toBe(200);
      expect(response._getJSONData()).toEqual({
        comments,
        commentPageLength: 2,
      });
    });

    it("성공 : 댓글이 없을 경우", async () => {
      const request = httpMocks.createRequest({
        query: {
          postId: 1,
          pageNum: 1,
        },
      });
      const response = httpMocks.createResponse();
      const amountOfComments = 0;
      communityRepository.getAmountOfComments = () => amountOfComments;

      await communityController.getComments(request, response);

      expect(response.statusCode).toBe(200);
      expect(response._getJSONData()).toEqual({
        comments: [],
        commentPageLength: 1,
      });
    });

    it("실패 : 페이지 번호가 없을 경우", async () => {
      const request = httpMocks.createRequest();
      const response = httpMocks.createResponse();

      await communityController.getComments(request, response);

      expect(response.statusCode).toBe(404);
    });

    it("실패 : catch error", async () => {
      const request = httpMocks.createRequest({
        query: {
          postId: 1,
          pageNum: 1,
        },
      });
      const response = httpMocks.createResponse();
      const amountOfComments = 1;
      communityRepository.getAmountOfComments = () => amountOfComments;

      communityRepository.getComments = () => {
        throw new Error();
      };

      await communityController.getComments(request, response);

      expect(response.statusCode).toBe(400);
    });
  });

  describe("getPost", () => {
    it("성공", async () => {
      const request = httpMocks.createRequest({
        params: {
          id: 1,
        },
      });
      const response = httpMocks.createResponse();
      const post = {
        post_id: 1,
        title: "post title",
        content: "post content",
        createdAt: "2022-04-01",
      };

      communityRepository.getPostById = () => post;

      await communityController.getPost(request, response);

      expect(response.statusCode).toBe(200);
      expect(response._getJSONData()).toEqual({ post });
    });

    it("실패 : 존재하지 않는 게시글일 경우", async () => {
      const request = httpMocks.createRequest({
        params: {
          id: 1,
        },
      });
      const response = httpMocks.createResponse();

      communityRepository.getPostById = () => {};

      await communityController.getPost(request, response);

      expect(response.statusCode).toBe(404);
      expect(response._getJSONData().message).toBe("no exists post");
    });

    it("실패 : catch error", async () => {
      const request = httpMocks.createRequest({
        params: {
          id: 1,
        },
      });
      const response = httpMocks.createResponse();

      communityRepository.getPostById = () => {
        throw new Error();
      };

      await communityController.getPost(request, response);

      expect(response.statusCode).toBe(400);
    });
  });

  describe("getAllPosts", () => {
    it("성공 : 카테고리x && 검색어x", async () => {
      const request = httpMocks.createRequest({
        query: {
          pageNum: 1,
        },
      });
      const response = httpMocks.createResponse();
      const posts = [
        { post_id: 1, username: "user", createdAt: "2022-04-01" },
        { post_id: 2, username: "user", createdAt: "2022-04-02" },
        { post_id: 3, username: "user", createdAt: "2022-04-03" },
      ];
      const amountOfPosts = posts.length;
      communityRepository.getAmountOfPosts = jest.fn(() => amountOfPosts);
      communityRepository.getAmountOfPostsByWord = jest.fn(() => amountOfPosts);
      communityRepository.getAmountOfPostsByWordAndCategory = jest.fn(
        () => amountOfPosts
      );
      communityRepository.getAllPosts = jest.fn(() => posts);
      communityRepository.getAllPostsByWord = jest.fn(() => posts);
      communityRepository.getAllPostsByWordAndCategory = jest.fn(() => posts);

      await communityController.getAllPosts(request, response);

      expect(response.statusCode).toBe(200);
      expect(communityRepository.getAmountOfPosts).toHaveBeenCalledTimes(1);
      expect(communityRepository.getAmountOfPostsByWord).toHaveBeenCalledTimes(
        0
      );
      expect(
        communityRepository.getAmountOfPostsByWordAndCategory
      ).toHaveBeenCalledTimes(0);
      expect(communityRepository.getAllPosts).toHaveBeenCalledTimes(1);
      expect(communityRepository.getAllPostsByWord).toHaveBeenCalledTimes(0);
      expect(
        communityRepository.getAllPostsByWordAndCategory
      ).toHaveBeenCalledTimes(0);
    });

    it("성공 : 카테고리o && 검색어o", async () => {
      const request = httpMocks.createRequest({
        query: {
          cat: "title",
          search: "title is..",
          pageNum: 1,
        },
      });
      const response = httpMocks.createResponse();
      const posts = [
        { post_id: 1, username: "user", createdAt: "2022-04-01" },
        { post_id: 2, username: "user", createdAt: "2022-04-02" },
        { post_id: 3, username: "user", createdAt: "2022-04-03" },
      ];
      const amountOfPosts = posts.length;
      communityRepository.getAmountOfPosts = jest.fn(() => amountOfPosts);
      communityRepository.getAmountOfPostsByWord = jest.fn(() => amountOfPosts);
      communityRepository.getAmountOfPostsByWordAndCategory = jest.fn(
        () => amountOfPosts
      );
      communityRepository.getAllPosts = jest.fn(() => posts);
      communityRepository.getAllPostsByWord = jest.fn(() => posts);
      communityRepository.getAllPostsByWordAndCategory = jest.fn(() => posts);

      await communityController.getAllPosts(request, response);

      expect(response.statusCode).toBe(200);
      expect(communityRepository.getAmountOfPosts).toHaveBeenCalledTimes(0);
      expect(communityRepository.getAmountOfPostsByWord).toHaveBeenCalledTimes(
        0
      );
      expect(
        communityRepository.getAmountOfPostsByWordAndCategory
      ).toHaveBeenCalledTimes(1);
      expect(communityRepository.getAllPosts).toHaveBeenCalledTimes(0);
      expect(communityRepository.getAllPostsByWord).toHaveBeenCalledTimes(0);
      expect(
        communityRepository.getAllPostsByWordAndCategory
      ).toHaveBeenCalledTimes(1);
    });

    it("성공 : 카테고리x && 검색어o", async () => {
      const request = httpMocks.createRequest({
        query: {
          search: "title is...",
          pageNum: 1,
        },
      });
      const response = httpMocks.createResponse();
      const posts = [
        { post_id: 1, username: "user", createdAt: "2022-04-01" },
        { post_id: 2, username: "user", createdAt: "2022-04-02" },
        { post_id: 3, username: "user", createdAt: "2022-04-03" },
      ];
      const amountOfPosts = posts.length;
      communityRepository.getAmountOfPosts = jest.fn(() => amountOfPosts);
      communityRepository.getAmountOfPostsByWord = jest.fn(() => amountOfPosts);
      communityRepository.getAmountOfPostsByWordAndCategory = jest.fn(
        () => amountOfPosts
      );
      communityRepository.getAllPosts = jest.fn(() => posts);
      communityRepository.getAllPostsByWord = jest.fn(() => posts);
      communityRepository.getAllPostsByWordAndCategory = jest.fn(() => posts);

      await communityController.getAllPosts(request, response);

      expect(response.statusCode).toBe(200);
      expect(communityRepository.getAmountOfPosts).toHaveBeenCalledTimes(0);
      expect(communityRepository.getAmountOfPostsByWord).toHaveBeenCalledTimes(
        1
      );
      expect(
        communityRepository.getAmountOfPostsByWordAndCategory
      ).toHaveBeenCalledTimes(0);
      expect(communityRepository.getAllPosts).toHaveBeenCalledTimes(0);
      expect(communityRepository.getAllPostsByWord).toHaveBeenCalledTimes(1);
      expect(
        communityRepository.getAllPostsByWordAndCategory
      ).toHaveBeenCalledTimes(0);
    });

    it("성공 : 게시글이 없을 경우", async () => {
      const request = httpMocks.createRequest({
        query: {
          pageNum: 1,
        },
      });
      const response = httpMocks.createResponse();
      const posts = [];
      const amountOfPosts = posts.length;
      communityRepository.getAmountOfPosts = () => amountOfPosts;
      communityRepository.getAmountOfPostsByWord = () => amountOfPosts;
      communityRepository.getAmountOfPostsByWordAndCategory = () =>
        amountOfPosts;
      communityRepository.getAllPosts = () => posts;
      communityRepository.getAllPostsByWord = () => posts;
      communityRepository.getAllPostsByWordAndCategory = () => posts;

      await communityController.getAllPosts(request, response);

      expect(response.statusCode).toBe(200);
    });

    it("실패 : 페이지 번호가 없을 경우", async () => {
      const request = httpMocks.createRequest();
      const response = httpMocks.createResponse();

      await communityController.getAllPosts(request, response);

      expect(response.statusCode).toBe(404);
    });

    it("실패 : catch error", async () => {
      const request = httpMocks.createRequest({
        query: {
          pageNum: 1,
        },
      });
      const response = httpMocks.createResponse();

      communityRepository.getAmountOfPosts = () => {
        throw new Error();
      };

      await communityController.getAllPosts(request, response);

      expect(response.statusCode).toBe(400);
    });
  });
});
