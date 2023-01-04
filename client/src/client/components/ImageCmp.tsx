import { useState } from "react";

type Props = {
  imgSrc: string | undefined;
  alt: string;
  className?: string;
};

function ImageCmp({ imgSrc, alt, className }: Props) {
  let [imgLoadErr, setImgLoadErr] = useState<boolean>(false);
  const NO_IMAGE_SRC = `${process.env.PUBLIC_URL}/image/icon/no-photo.png`;
  const NO_IMAGE_ALT = "no image";

  const failedLoadImage = () => {
    setImgLoadErr(true);
  };

  return (
    <>
      {imgSrc && !imgLoadErr ? (
        <img className={className} src={imgSrc} onError={failedLoadImage} alt={alt} />
      ) : (
        <img className={className} src={NO_IMAGE_SRC} alt={NO_IMAGE_ALT} />
      )}
    </>
  );
}

export default ImageCmp;