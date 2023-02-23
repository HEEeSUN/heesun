export type ContactService = {
  writeInquiry: (inquiryInformation: inquiryInformation) => Promise<void>;
};

export type inquiryInformation = {
  name: string;
  content: string;
  option: string;
  contactInformation: string;
  locking: boolean;
}