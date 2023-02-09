import nodemailer from "nodemailer";

export default class ContactController {
  constructor(contactRepository) {
    this.contact = contactRepository;
  }

  /* 문의 가져오기 */
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

  /* 특정 문의 가져오기 */
  getInquiry = async (req, res) => {
    try {
      const { id } = req.params;

      if (!id) {
        return res.sendStatus(400);
      }

      const inquiryDetail = await this.contact.getInquiry(id);

      if (!inquiryDetail) {
        return res.sendStatus(404)
      }

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

  /* 문의에 대한 답변 작성 */
  answer = async (req, res) => {
    try {
      const { id } = req.params;
      const { text } = req.body;

      if (!id) {
        return res.sendStatus(404);
      }

      const inquiryDetail = await this.contact.getInquiry(id);

      if (!inquiryDetail) {
        return res.sendStatus(404)
      }

      const date = new Date();

      if (inquiryDetail.contactOption === 'phone') {
        await this.contact.answer(id, text, date);
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
        to: inquiryDetail.contactInformation,
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
        throw new Error('ERROR60003')
      }

      if (!info) {
        throw new Error('ERROR60004');
      }

      await this.contact.answer(id, text, date);

      res.sendStatus(200);
    } catch (error) {
      console.log(error);
      return res.status(400).json({ code: error.message });
    }
  };
}
