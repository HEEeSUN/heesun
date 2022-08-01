type Props = {
  message: string;
  extraClass?: string;
};

function NoticeNoContent({ message, extraClass }: Props) {
  return <div className={`notice-no-content ${extraClass}`}>{message}</div>;
}

export default NoticeNoContent;
