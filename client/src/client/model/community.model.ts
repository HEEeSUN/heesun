export type CommunityService = {
  post: (title: string, content: string) => Promise<{ postId: number }>;
  getPosts: (
    searchCategory: string,
    staticSearchWord: string,
    pageNumber: number
  ) => Promise<{ posts: PostSummary[]; postPageLength: number }>;
  getPost: (postId: string) => Promise<{ post: Posts }>;
  deletePost: (postId: string) => Promise<void>;
  modifyPost: (postId: string, title: string, content: string) => Promise<void>;
  getComments: (
    postId: string,
    pageNumber: number
  ) => Promise<{ comments: Comments[]; commentPageLength: number }>;
  writeComment: (postId: string, comment: string) => Promise<void>;
  deleteComment: (postId: string, commentId: number) => Promise<void>;
};

export type Comments = {
  comment_id: number;
  content: string;
  username: string;
  originUsername: string;
  createdAt: string;
};

export type PostSummary = {
  post_id?: number;
  title?: string;
  username?: string;
  createdAt?: string;
};

export type Posts = {
  postId: number;
  title: string;
  username: string;
  originUsername: string;
  createdAt: string;
  content: string;
};
