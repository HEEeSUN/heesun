import { useEffect, useState } from "react";
import "./inquiry.css";
import { adminInquiryService, Inquiry } from "../../model/inquiry.model";
import Page from "../../components/Page";
import InquiryDetail from "./components/InquiryDetail";

type Props = {
  adminInquiryService: adminInquiryService;
};

function Inquiries({ adminInquiryService }: Props) {
  let [inquiryList, setInquiryList] = useState<Inquiry[]>([]);
  let [pageNumber, setPageNumber] = useState<number>(1);
  let [pageLength, setPageLength] = useState<number>(1);
  let [change, setChange] = useState<boolean>(false);
  let [inquiryId, setInquiryId] = useState<number>();

  const getInquiries = async () => {
    try {
      const { inquiries, pageLength } = await adminInquiryService.getInquiries(
        pageNumber
      );

      setInquiryList(inquiries);
      setPageLength(pageLength);
      setChange(true);
    } catch (error: any) {
      alert(error.message);
    }
  };

  useEffect(() => {
    if (pageNumber === 0) {
      setPageNumber(1);
    } else {
      getInquiries();
    }
  }, [pageNumber]);

  return (
    <div className="inquiry-list">
      <table>
        <thead>
          <tr>
            <th className="num">번호</th>
            <th className="content">내용</th>
            <th className="createdAT">작성일자</th>
            <th className="name">작성자</th>
            <th className="answer">답변상태</th>
          </tr>
        </thead>
        <tbody>
          {inquiryList.length < 1 ? (
            <td colSpan={5}>문의내역이 없습니다</td>
          ) : (
            inquiryList.map((inquiry, key) => {
              return (
                <InquiryDetail
                  adminInquiryService={adminInquiryService}
                  inquiry={inquiry}
                  inquiryId={inquiryId}
                  setInquiryId={setInquiryId}
                />
              );
            })
          )}
        </tbody>
      </table>
      <Page
        amountOfPerPage={5}
        change={change}
        setChange={setChange}
        pageLength={pageLength}
        pageNumber={pageNumber}
        setPageNumber={setPageNumber}
      />
    </div>
  );
}

export default Inquiries;
