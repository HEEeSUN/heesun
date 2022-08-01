type Props = {
  title: string;
  alt: string;
  iconSrc: string;
  extraClass: string;
  count: number | string;
  clickEventHandler?: () => void;
};

function MiniAlert(props: Props) {
  const { title, alt, iconSrc, extraClass, count, clickEventHandler } = props;
  return (
    <div className={`alert ${extraClass}`} onClick={clickEventHandler}>
      <div>
        <span>{title}</span>
        <span>{count}</span>
      </div>
      <img src={iconSrc} alt={alt}></img>
    </div>
  );
}

export default MiniAlert;
