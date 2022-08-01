import { useEffect } from "react";
import { useHistory } from "react-router";
import { MemberService } from "../../../model/member.model";

declare global {
  interface Window {
    Kakao: any;
  }
}

type Props = {
  memberService: MemberService;
};

function KakaoLogin({ memberService }: Props) {
  const history = useHistory();

  const kakaoLogin = async () => {
    if (!window.Kakao.isInitialized()) {
      window.Kakao.init("0064e10544824f8f123b810031106d20");
    }

    window.Kakao.Auth.loginForm({
      scope: `profile_nickname, account_email`,
      success: function (authObj: any) {
        window.Kakao.API.request({
          url: "/v2/user/me",
          success: async function (res: any) {
            const kakao_account = res.kakao_account.email;
            try {
              await memberService.kakaoLogin(kakao_account);
              history.push("/home");
            } catch (error: any) {
              alert("다시 시도해주세요");
            }
          },
          fail: function (error: any) {
            alert("다시 시도해주세요");
          },
        });
      },
    });
  };

  useEffect(() => {
    kakaoLogin();
  }, []);

  return null;
}

export default KakaoLogin;
