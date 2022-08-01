export const ErrorMessage = [
  {
    code: "ERROR00001",
    message: "Authentication Error",
    alertMessage: "로그인이 만료되었습니다\n다시 로그인 해주세요",
  },
  {
    code: "ERROR00002",
    message: "Invalid user or password",
    alertMessage: "아이디와 비밀번호를 확인해주세요",
  },
  {
    code: "ERROR00003",
    message: "already exists id",
    alertMessage: "이미 사용중인 아이디입니다",
  },
  {
    code: "ERROR00004",
    message: "can not find user information",
    alertMessage: "등록된 정보를 찾을 수 없습니다",
  },
  {
    code: "ERROR20001",
    message: "Failed to get Order List",
    alertMessage: "주문 정보 불러오기에 실패하였습니다",
  },
  /* cart 관련 error*/
  {
    code: "ERROR10003",
    message: "Failed to add in cart",
    alertMessage: "장바구니 담기에 실패하였습니다",
  },
  /*order 관련 error*/
  {
    code: "ERROR30001",
    message: "Failed to order",
    alertMessage: "주문 실패하였습니다",
  },
  {
    code: "ERROR30002",
    message: "Stock Shortage",
    alertMessage: "재고 부족 상품이 있어 주문이 취소되었습니다",
  },
  {
    code: "ERROR40007",
    message: "Failed to write comment",
    alertMessage: "댓글 작성에 실패하였습니다",
  },
  {
    code: "ERROR50001",
    message: "socket error",
    alertMessage: "잠시후 다시 시도해 주세요",
  },

  /* admin 관련 error */
  {
    code: "ERROR60001",
    message: "duplication error",
    alertMessage: "이미 존재하는 코드입니다",
  },
  {
    code: "ERROR60002",
    message: "can not find a product by code",
    alertMessage: "해당 상품이 존재하지 않습니다",
  },
];
