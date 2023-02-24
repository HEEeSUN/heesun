<br>

#    :shopping: 쇼핑몰 서비스 [HEESUN]
### 🔗 사이트 URL: [heesun.store](http://heesun.store/home)
#### <p> 기본적인 쇼핑몰의 기능을 갖추고 있는 서비스입니다. <br> 경로에 따라 고객 페이지와 관리자 페이지로 구분되며 상단 URL 클릭시 쇼핑몰 서비스의 고객 페이지로 연결됩니다. <br><br> 
- <strong>고객페이지</strong> <br> - <strong>URL</strong> : [heesun.store/home](http://heesun.store/home) <br> - <strong>테스트계정</strong> : ID : guest1 / PW : guest1@@ <br> 
- <strong>관리자페이지</strong> <br> - <strong>URL</strong> : [heesun.store/admin](http://heesun.store/admin)   <br> - <strong>테스트계정</strong> : ID : master / PW : 1234 <br>  </p>

##### <p> </p>
<br>

### 💡  주요 기능
- 상품의 등록, 수정, 삭제, 할인 등 상품 관리 및 실제 결제가 가능한 쇼핑몰 서비스
- 주문에 대한 처리 및 환불
- 회원간의 소통이 가능한 웹 커뮤니티(게시판) 서비스
- 관리자와 고객의 빠른 소통을 위한 실시간 채팅 서비스
- 일반 회원가입을 이용한 회원 서비스 및 카카오톡 소셜로그인을 통한 간편한 회원가입

<br>

---

## ⚒기술정보

<div align=center> 
    <img src="https://img.shields.io/badge/javascript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black">
    <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=TypeScript&logoColor=black">
    <img src="https://img.shields.io/badge/html-E34F26?style=for-the-badge&logo=html5&logoColor=white">
    <img src="https://img.shields.io/badge/css-1572B6?style=for-the-badge&logo=css3&logoColor=white">
    <img src="https://img.shields.io/badge/react-61DAFB?style=for-the-badge&logo=react&logoColor=black">
  <br>
    <img src="https://img.shields.io/badge/node-339933?style=for-the-badge&logo=Node.js&logoColor=white">
    <img src="https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=Express&logoColor=white">
    <img src="https://img.shields.io/badge/NODE MAILER-30B980?style=for-the-badge&logo=Minutemailer&logoColor=white">
    <img src="https://img.shields.io/badge/MySQL-4479A1?style=for-the-badge&logo=MySQL&logoColor=white">
    <img src="https://img.shields.io/badge/JSON Web Tokens-000000?style=for-the-badge&logo=JSON Web Tokens&logoColor=white"> 
    <img src="https://img.shields.io/badge/Socket.io-010101?style=for-the-badge&logo=Socket.io&logoColor=white">
  <br>
    <img src="https://img.shields.io/badge/Amazon AWS-232F3E?style=for-the-badge&logo=Amazon AWS&logoColor=white">
    <img src="https://img.shields.io/badge/Git-F05032?style=for-the-badge&logo=Git&logoColor=white">
    <img src="https://img.shields.io/badge/github-181717?style=for-the-badge&logo=github&logoColor=white">
    <img src="https://img.shields.io/badge/Jest-C21325?style=for-the-badge&logo=Jest&logoColor=white">
    <img src="https://img.shields.io/badge/Prettier-F7B93E?style=for-the-badge&logo=Prettier&logoColor=white">
    <img src="https://img.shields.io/badge/kakao login-FFCD00?style=for-the-badge&logo=kakao&logoColor=black">
    <img src="https://img.shields.io/badge/PM2-2B037A?style=for-the-badge&logo=PM2&logoColor=white"> 
  <br>

</div>
    <!-- -->
    <!-- <img src="https://img.shields.io/badge/AWS Lambda-FF9900?style=for-the-badge&logo=AWS Lambda&logoColor=white"> -->
    <!--기타-->

## 

### 📖 주요 라이브러리
<table>
<thead>
<td align="center" width="200px"><strong>이름</strong></td>
<td align="center"><strong>기능</strong></td>
</thead>
<tbody>
<tr>
   <td align="center">
      <strong> google-cloud/storage </strong>
   </td>
   <td>
      파일을 GCP로 업로드하기 위하여 적용하였습니다.
   </td>
</tr>
<tr>
   <td align="center">
      <strong> bcrypt </strong>
   </td>
   <td>
      고객의 비밀번호를 암호화하여 저장하기 위해 적용하였습니다.
   </td>
</tr>
<tr>
   <td align="center">
      <strong> express-rate-limit </strong>
   </td>
   <td>
      누군가 서버에 악의적으로 대량의 요청을 보내 서버를 마비시키는 행위를 방지하기 위하여 요청의 횟수를 제한하기 위해 적용하였습니다.
   </td>
</tr>
<tr>
   <td align="center">
      <strong> jsonwebtoken </strong>
   </td>
   <td>
      가장 기본적인 인증 방식인 Session을 이용한 방식과 JWT 인증방식 중 고민하였으나  
      별도의 저장소가 필요없는 JWT 방식이 서버자원 절약 및 성능에도 유리하다고 판단하여 적용하였습니다.
      (※ 적용후 CSRF 공격에 대비하기 위해 refresh 토큰과 access 토큰을 별도로 두는 방법으로 보완하고자 하였으나 이 경우 반드시 토큰을 저장해야만 하고 결국 별도의 저장소가 필요하다는 점이 JWT를 사용할 이유가 없어진다고 생각되어져 일단 보류함)
   </td>
</tr>
<tr>
   <td align="center">
      <strong> multer </strong>
   </td>
   <td>
      파일 업로드를 위해 사용되는 multipart/form-data 를 다루기 위한 미들웨어로 상품 이미지 파일을 업로드하기 위해 사용하였습니다.
   </td>
</tr>
<tr>
   <td align="center">
      <strong> mysql2 </strong>
   </td>
   <td>
      불필요한 데이터의 중복을 최소화하기 위해 데이터를 저장하고 관리하기 위한 방식으로 관계형 데이터베이스를 사용하고자 하였고 이 중 가장 대표적이라고 생각되는 mysql을 사용하였습니다.
     실시간 채팅과 같이 빠르게 서비스해야 하는 경우 redis등을 이용하지만 현재 진행중인 프로젝트 규모가 크지 않아 mysql로도 충분히 커버가 가능할 것으로 판단하여 mysql만을 사용하였습니다.
   </td>
</tr>
<tr>
   <td align="center">
      <strong> nodemailer </strong>
   </td>
   <td>
      고객이 아이디 또는 비밀번호를 찾고자 할 때 고객의 이메일로 전송하기 위해 적용하였습니다.
   </td>
</tr>
<tr>
   <td align="center">
      <strong> pm2 </strong>
   </td>
   <td>
      예기치 못한 오류로 인하여 서버가 꺼지는 경우를 대비하여 서버를 재시작 할 수 있도록 적용하였습니다.
   </td>
</tr>
<tr>
   <td align="center">
      <strong> socket.io </strong>
   </td>
   <td>
      실시간 채팅 서비스 구현을 위하여 양방향 통신을 지원하는 Socket 통신 방식을 적용하였습니다.
   </td>
</tr>
<tr>
   <td align="center">
      <strong> swagger-ui-express </strong>
   </td>
   <td>
      API를 명세화하고 쉽게 테스트를 할 수 있게 해주는 swagger-ui를 사용하기 위해 적용하였습니다.
   </td>
</tr>
<tr>
   <td align="center">
      <strong> yamljs </strong>
   </td>
   <td>
      자바스크립트 언어 자체에서는 xml이나 json 밖에 지원하지 않아 yaml을 json으로 변환하여 사용하기 위해 적용하였습니다.
   </td>
</tr>
<tr>
   <td align="center">
      <strong> jest </strong>
   </td>
   <td>
      작성한 코드가 예상대로 실행되는지 체크하기 위한 테스트 코드를 작성하기 위하여 사용하였습니다. 
   </td>
</tr>
</tbody>
</table>

<br>

---

## 📌 트러블슈팅
### 1. mysql2 라이브러리 사용중 에러
### (1) 문제
sql문을 실행하기 위해 execute 함수를 이용하게끔 로직을 구현함 → 이 때, 전달되는 값이 undefined 등 에러를 발생시키는 값인 경우 에러가 발생하는데 이걸 try catch로 잡아주지 못하고 서버가 꺼지는 현상이 발생함 (mysql2 이슈에서 확인 #1505(https://github.com/sidorares/node-mysql2/issues/1505))
### (2) 원인
execute 함수를 사용하면 execute 함수 내부에서 getConnection을 실행하기 때문에 별도로 getConnection을 해주지 않아도 되는데 이 때 execute를 실행하는 방식은 getConnection의 콜백으로 실행하고 있음. 이 때 콜백함수에서 에러가 발생하는 경우 서버가 꺼지는 걸 확인함
### (3) 해결을 위한 가설 
① try catch의 위치를 변경 : 라이브러리를 수정하지 않고 해당하는 로직 내부에서 try catch의 영역을 점점 넓히거나 좁혀보았음에도 try catch로는 잡히지 않고 'process.on('uncaughtException');' 으로만 잡힘. <br>
② execute가 아닌 query문을 실행 :  보안을 위해 execute 사용을 권장하기 때문에 execute를 사용하고자 함. <br>
③ 라이브러리에서 에러가 발생하는 부분을 수정한다면 : 이슈에서는 라이브러리의 문제가 발생하는 지점인 throw e를 return cb(e)로 수정하는걸 얘기하고 있으나 라이브러리 수정시 어떤 부수 효과가 발생할지 모르기때문에 함부로 수정하지 않음.
### (4) 해결방법 
execute 함수의 내부를 보니 getConnection을 이용해 가져온 conenction에 있는 execute를 사용하는 구조로 되어 있는 걸 확인함 → connection을 가져오는 행위와 execute문을 실행하는 행위를 별도로 구현. (getconnection을 하고 execute를 사용하도록 함)

<br>

---

## 📎 참조문서
###### 프로젝트 산출 문서

### 1. API명세서
#### [http://api.heesun.store](http://api.heesun.store/api-docs)
Swagger를 이용하여 API를 명세화하였습니다. 상단 URL 클릭시 API를 테스트 할 수 있는 사이트로 이동합니다.

## 

### 2. ERD / 테이블정의서 
#### [ERD / 테이블정의서 ](https://github.com/HEEeSUN/heesun/wiki/ERD--%EB%B0%8F-%ED%85%8C%EC%9D%B4%EB%B8%94-%EC%A0%95%EC%9D%98%EC%84%9C)
<P> 서비스에서 사용되어지는 데이터와 관련하여 각 테이블간의 관계 및 각 테이블 및 컬럼에 대한 정보를 정리한 문서입니다. </P>

## 

### 3. 테스트케이스 
#### [테스트케이스](https://github.com/HEEeSUN/heesun/wiki/%ED%85%8C%EC%8A%A4%ED%8A%B8%EC%BC%80%EC%9D%B4%EC%8A%A4)
<P> 구현한 서비스의 기능이 예상한 결과를 도출해 내는지 확인하기 위해 테스트 진행시 필요한 테스트 케이스를 작성하였습니다. </P>

## 

### 4. 사용자매뉴얼
#### [사용자매뉴얼](https://github.com/HEEeSUN/heesun/wiki/%EC%82%AC%EC%9A%A9%EC%9E%90%EB%A7%A4%EB%89%B4%EC%96%BC)
<P> 서비스를 직접 이용하지 않고도 화면과 주요 기능들을 확인할 수 있도록 작성한 문서입니다. </P>

## 

### 5. 오류코드정의서 
#### [오류코드정의서](https://github.com/HEEeSUN/heesun/wiki/%EC%98%A4%EB%A5%98%EC%BD%94%EB%93%9C%EC%A0%95%EC%9D%98%EC%84%9C)
<P> 서비스 이용중 발생할 수 있는 오류코드에 대해 정리한 문서입니다. <br> 서버는 오류가 발생하게 되면 오류에 해당하는 코드를 클라이언트로 보내게 되고 클라이언트는 해당 표를 이용해 오류를 식별합니다. </P>

## 


---

## ✍ 기타
###  1. 커밋 메세지 규칙
#### 버전관리의 용이성 및 추후 다른 이들과의 협업시 커밋 메시지를 보기 좋게 하는 것이 중요하다고 판단하여 미리 규칙을 정하였습니다.
#### <P> - feat : 새로운 기능 추가 <br> - fix : 버그 수정 <br> - docs : 문서 수정 <br> - style : 코드 포맷, 세미콜론 누락 등 스타일 변경 (로직 변경 x) <br> - refactor : 코드 리팩토링 <br> - test : 테스트 코드 추가 <br> - chore : 빌드 업무 수정, 패키지 매니저 수정</P>
