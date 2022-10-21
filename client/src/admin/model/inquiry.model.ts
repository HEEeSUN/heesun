export type adminInquiryService = {
  getInquiries: (
    pageNumber: number
  ) => Promise<{ inquiries: Inquiry[]; pageLength: number }>;
  getInquiry: (id: number) => Promise<{ inquiryDetail: Inquiry }>;
  answer: (
    inquiryId: number | undefined,
    email: string,
    text: string,
    contactOption: string
  ) => Promise<void>;
};

export type Inquiry = {
  id: number;
  content: string;
  name: string;
  answer: string;
  contactOption: string;
  contactInformation: string;
  createdAt: string;
};
