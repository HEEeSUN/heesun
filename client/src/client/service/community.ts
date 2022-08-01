import { AxiosRequestConfig } from "axios";
import HttpClient from "../../network/http";

export default class communityService {
  http: HttpClient;

  constructor(http: HttpClient) {
    this.http = http;
  }

  /* 게시글 목록 가져오기  */
  async getPosts(
    searchCategory: string,
    searchWord: string,
    clickedPageNum: number
  ): Promise<any> {
    const axiosAPI: AxiosRequestConfig = {
      method: "get",
      url: `/community?cat=${searchCategory}&search=${searchWord}&pageNum=${clickedPageNum}`,
    };

    return this.http.axiosAPI(axiosAPI);
  }

  /* 게시글 등록 */
  async post(title: string, content: string): Promise<any> {
    const axiosAPI: AxiosRequestConfig = {
      method: "post",
      url: `/community`,
      data: {
        title,
        content,
      },
    };

    return this.http.axiosAPI(axiosAPI);
  }

  /* 특정 게시글 가져오기 */
  async getPost(postId: string): Promise<any> {
    const axiosAPI: AxiosRequestConfig = {
      method: "get",
      url: `/community/${postId}`,
    };

    return this.http.axiosAPI(axiosAPI);
  }

  /* 기존 게시글 수정 */
  async modifyPost(
    postId: string,
    title: string,
    content: string
  ): Promise<any> {
    const axiosAPI: AxiosRequestConfig = {
      method: "patch",
      url: `/community/${postId}`,
      data: {
        title,
        content,
      },
    };

    return this.http.axiosAPI(axiosAPI);
  }

  /* 게시글 삭제 */
  async deletePost(postId: string): Promise<any> {
    const axiosAPI: AxiosRequestConfig = {
      method: "delete",
      url: `/community/${postId}`,
    };

    return this.http.axiosAPI(axiosAPI);
  }

  /* 특정 게시글의 댓글 목록 가져오기 */
  async getComments(postId: string, commentPage: number): Promise<any> {
    const axiosAPI: AxiosRequestConfig = {
      method: "get",
      url: `/community/comment?postId=${postId}&pageNum=${commentPage}`,
    };

    return this.http.axiosAPI(axiosAPI);
  }

  /* 특정 게시글에 댓글 등록 */
  async writeComment(postId: string, comment: string): Promise<any> {
    const axiosAPI: AxiosRequestConfig = {
      method: "post",
      url: `/community/${postId}`,
      data: {
        comment,
      },
    };

    return this.http.axiosAPI(axiosAPI);
  }

  /* 게시글에 달린 댓글 지우기 */
  async deleteComment(comment_id: number): Promise<any> {
    const axiosAPI: AxiosRequestConfig = {
      method: "delete",
      url: `/community/comment/${comment_id}`,
    };

    return this.http.axiosAPI(axiosAPI);
  }
}
