import axios from "axios";

/* 결제대행 IAMPORT에 환불 요청 */
export const requestRefundToIMP = async (imp_uid, amount) => {
  try {
    const getToken = await axios({
      url: process.env.IMP_GET_TOKEN_URL,
      method: "post",
      headers: { "Content-Type": "application/json" },
      data: {
        imp_key: process.env.IMP_KEY,
        imp_secret: process.env.IMP_SECRET,
      },
    });

    const { access_token } = getToken.data.response;
    const getCancelData = await axios({
      url: process.env.IMP_REFUND_URL,
      method: "post",
      headers: {
        "Content-Type": "application/json",
        Authorization: access_token, // 아임포트 서버로부터 발급받은 엑세스 토큰
      },
      data: {
        imp_uid, // imp_uid를 환불 `unique key`로 입력
        amount // 가맹점 클라이언트로부터 받은 환불금액
      },
    });

    const { response } = getCancelData.data; // 환불 결과

    if (!response) {
      // 환불 실패시 response 는 null 로 오게됨
      throw new Error(error);
    }

    return true;
  } catch (error) {
    console.log(error);
    throw new Error(error);
  }
};
