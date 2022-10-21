import nodemailer from "nodemailer";

export default class ContactController {
  constructor(contactRepository) {
    this.contact = contactRepository;
  }

  preventNullException = async () => {
    // 검사할 객체 받아옴
    // 키값 뽑아냄
    // 키의 갯수만큼 반복을 돌며 null이 있는지 확인
    throw new Error();
  };

  getInquiries = async (req, res) => {
    try {
      const { page } = req.query;
      const amountOfSendData = 20;
      let prevPage = (page - 1) * amountOfSendData;

      const amountOfInquiry = await this.contact.getAmountOfInquiry();

      if (amountOfInquiry === 0) {
        return res.status(200).json({ inquiries: [], pageLength: 1 });
      }

      let pageLength = 1;
      if (amountOfInquiry % amountOfSendData > 0) {
        pageLength = Math.ceil(amountOfInquiry / amountOfSendData);
      } else {
        pageLength = amountOfInquiry / amountOfSendData;
      }

      const inquiries = await this.contact.getInquiries(
        prevPage,
        amountOfSendData
      );

      return res.status(200).json({ inquiries, pageLength });
    } catch (error) {
      console.log(error);
      return res.sendStatus(400);
    }
  };

  getInquiry = async (req, res) => {
    try {
      const { id } = req.params;

      const inquiryDetail = await this.contact.getInquiry(id);

      return res.status(200).json({ inquiryDetail });
    } catch (error) {
      console.log(error);
      return res.sendStatus(400);
    }
  };

  /* 문의 내역 작성하기 */
  writeInquiry = async (req, res) => {
    try {
      const { inquiryInformation } = req.body;
      const { name, content, option, contactInformation, locking } =
        inquiryInformation;

      const date = new Date();

      await this.contact.writeInquiry(
        name,
        content,
        option,
        contactInformation,
        locking,
        date
      );

      res.sendStatus(200);
    } catch (error) {
      console.log(error);
      return res.sendStatus(400);
    }
  };

  answer = async (req, res) => {
    try {
      const { id } = req.params;
      const { email, text, contactOption } = req.body;

      const date = new Date();

      if (contactOption) {
        await this.contact.answer(id, contactOption, date);
        return res.sendStatus(200);
      }

      let transporter = nodemailer.createTransport({
        service: process.env.MAILER_SERVICE,
        auth: {
          user: process.env.MAILER_USERNAME,
          pass: process.env.MAILER_PASSWORD,
        },
      });

      const mailOptions = {
        from: process.env.MAILER_USERNAME,
        to: email,
        subject: "[heesun] 문의하신 내용에 대한 답변입니다",
        html: `<h4></h4>
                <div>
                  <p>${text}</p>
                </div>`,
      };

      let info;
      try {
        info = await transporter.sendMail(mailOptions);
      } catch (error) {
        // 메일 전송자체가 실패한경우
        // 수신자 확인할 것
        return res.sendStatus(400);
      }

      if (!info) {
        return res.sendStatus(400);
      }

      await this.contact.answer(id, text, date);

      res.sendStatus(200);
    } catch (error) {
      console.log(error);
      return res.sendStatus(400);
    }
  };
}
