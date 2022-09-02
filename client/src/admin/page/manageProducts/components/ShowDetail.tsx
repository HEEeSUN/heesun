import { useEffect, useState } from "react";
import Resizer from "react-image-file-resizer";
import {
  SelectedProduct,
  Option,
  AdminProductService,
} from "../../../model/product.model";

type Props = {
  adminProductService: AdminProductService;
  selectedProduct: SelectedProduct;
  setShowDetail: React.Dispatch<React.SetStateAction<boolean>>;
  setModifyProduct: React.Dispatch<React.SetStateAction<boolean>>;
};

function ShowDetail(props: Props) {
  let [code, setCode] = useState<string>("");
  let [name, setName] = useState<string>("");
  let [price, setPrice] = useState<string>("");
  let [cost, setCost] = useState<string>("");
  let [optionList, setOptionList] = useState<Option[]>([]);

  let [initialName, setInitialName] = useState<string>("");
  let [initialPrice, setInitialPrice] = useState<string>("");
  let [initialCost, setInitialCost] = useState<string>("");
  let [initialImageSrc, setInitialImageSrc] = useState<string | Blob>("");
  let [initialDescription, setInitialDescription] = useState<string>("");
  let [initialOptionList, setInitialOptionList] = useState<Option[]>([]);

  let [option1, setOption1] = useState<string>("");
  let [option2, setOption2] = useState<string>("");
  let [stock, setStock] = useState<string>("");
  let [imageFile, setImageFile] = useState<File | null>(null);
  let [description, setDescription] = useState<string>("");
  let [modify, setModify] = useState<boolean>(false);
  let formData = new FormData();

  let [previewSrc, setPreviewSrc] = useState<string>("");
  let [previewInput, setPreviewInput] = useState<HTMLInputElement>();

  /* 상품 상세보기 */
  const getDetail = async () => {
    try {
      const { options1, options2 } = await props.adminProductService.getDetail(
        props.selectedProduct.code
      );

      const a = [...options1];
      const b = [...options2];

      setOptionList(a);
      setInitialOptionList(b);
    } catch (error: any) {
      alert(error.message);
    }
  };

  useEffect(() => {
    console.log(props.selectedProduct);
    getDetail();
  }, []);

  /* 업로드할 상품 이미지 미리보기 구현 */
  const preview = async (files: File) => {
    const file = files;

    if (!file) {
      setPreviewSrc("");
    } else {
      setPreviewSrc(URL.createObjectURL(file));
    }
  };

  /* 이미지 제거 */
  const removeImage = async () => {
    if (imageFile && previewInput) {
      previewInput.value = "";
    }

    setImageFile(null);
    setPreviewSrc("");
  };

  const updateProduct = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (
      initialName === name &&
      initialPrice === price &&
      initialCost === cost &&
      JSON.stringify(optionList) === JSON.stringify(initialOptionList) &&
      initialDescription === description &&
      initialImageSrc === previewSrc
    ) {
      alert("변경사항이 없습니다");
    } else if (optionList.length < 1) {
      let result = window.confirm(
        "옵션 및 재고가 모두 삭제되었습니다.\n상품을 삭제 하시겠습니까?"
      );
      if (!result) {
        return;
      }

      try {
        await props.adminProductService.deleteProduct(code);

        alert("삭제되었습니다");
        props.setShowDetail(false);
        props.setModifyProduct(true);
      } catch (error: any) {
        alert(error.message);
      }
    } else {
      if (imageFile) {
        formData.append("uploadedImage", imageFile, imageFile.name);
      } else if (!imageFile && previewSrc) {
        formData.append("imageSrc", initialImageSrc);
      } else {
        formData.append("imageSrc", "");
      }
      // image 변동없는데 보내주는이유 :  sql문 새로 안만드려고..(image변동있든 없든 하나의 sql문으로 넣으려고,, 그러면
      //무조건 image를 넣어야 되니까..)

      formData.append("code", code);
      formData.append("name", name);
      formData.append("price", price);
      formData.append("cost", cost);
      formData.append("description", description);
      formData.append("optionList", JSON.stringify(optionList));

      try {
        await props.adminProductService.updateProduct(code, formData);

        alert("수정되었습니다");
        props.setShowDetail(false);
        props.setModifyProduct(true);
      } catch (error: any) {
        alert(error.message);
      }
    }
  };

  const addProduct_temp = () => {
    if (validationCheck()) {
      const newProduct = {
        option1,
        option2,
        cost: Number(cost),
        price: Number(price),
        stock: Number(stock),
        disabled: false,
      };

      const newArray = [...optionList];

      newArray.push(newProduct);
      setOptionList(newArray);
      setModify(true);

      setOption1("");
      setOption2("");
      setStock("");
    }
  };

  function validationCheck() {
    const find1 = optionList.find(
      (option) => option.option1 === option1 && option.option2 === option2
    );
    const find2 = optionList.find(
      (option) =>
        option.option1 === "" && option.option2 === "" && !option.disabled
    );

    if (!(name && price && stock)) {
      alert("필수 입력 항목을 확인해 주세요");
    } else if (
      isNaN(Number(stock)) ||
      isNaN(Number(price)) ||
      isNaN(Number(cost))
    ) {
      alert("상품재고 또는 가격은 숫자만 입력해 주세요");
    } else if (!option1 && !option2) {
      alert(
        "옵션을 입력하지 않으셨습니다\n옵션을 추가하지 않으시려면 상품등록을 눌러주세요"
      );
    } else if (find1) {
      alert("중복되는 옵션이 존재합니다");
    } else if (find2) {
      alert(
        "단일옵션상품입니다\n옵션 추가를 원하실 경우 기존옵션 삭제후 추가해주십시오\n(옵션 좌측 x 클릭)"
      );
    } else {
      return true;
    }
  }

  function deleteOption(key: number) {
    const tempArray = [...optionList];

    if (tempArray[key].disabled) {
      tempArray[key].disabled = false;
    } else {
      tempArray[key].disabled = true;
    }
    setOptionList(tempArray);
    // const tempArray1 = [...optionList];
    // const tempArray2 = tempArray1.splice(0, key);
    // tempArray1.shift();
    // const newArray = tempArray2.concat(tempArray1);
    // setOptionList(newArray);
    // const tempArray1 = [...optionList];
    // tempArray1[key].state = true;
    // const tempArray2 = tempArray1.splice(0, key);
    // tempArray1.shift();
    // const newArray = tempArray2.concat(tempArray1);
  }

  const changeStock = async (
    event: React.ChangeEvent<HTMLInputElement>,
    key: number
  ) => {
    const tempArray = [...optionList];
    tempArray[key].stock = parseInt(event.target.value);
    setOptionList(tempArray);
  };

  const setReseizedImageFile = (dataURI: any) => {
    setImageFile(dataURI);
  };

  const resizeImageFile = async (file: File) => {
    Resizer.imageFileResizer(
      file,
      300,
      300,
      "JPEG",
      100,
      0,
      (uri) => {
        setReseizedImageFile(uri);
      },
      "file"
    );
  };

  function settings(event: React.ChangeEvent<HTMLInputElement>) {
    const type = event.target.type;
    const value = event.target.value;
    let targetName;

    if (type === "file") {
      if (event.target.files) {
        if (event.target.files[0].size >= 5242880) {
          alert("5MB 이하 이미지만 업로드 가능합니다");
          return;
        }
        setPreviewInput(event.target);
        preview(event.target.files[0]);
        resizeImageFile(event.target.files[0]);
      }
    } else {
      targetName = event.target.name;
    }

    switch (targetName) {
      case "code":
        setCode(value);
        break;
      case "name":
        setName(value);
        break;
      case "cost":
        setCost(value);
        break;
      case "price":
        setPrice(value);
        break;
      case "option1":
        setOption1(value);
        if (!value) {
          setOption2(value);
        }
        break;
      case "option2":
        setOption2(value);
        break;
      case "stock":
        setStock(value);
        break;
    }
  }

  useEffect(() => {
    setInitialName(props.selectedProduct.name);
    setInitialPrice(String(props.selectedProduct.price));
    setInitialCost(String(props.selectedProduct.cost));
    setInitialImageSrc(props.selectedProduct.imgSrc);
    setPreviewSrc(props.selectedProduct.imgSrc);
    setInitialDescription(props.selectedProduct.description);

    setDescription(props.selectedProduct.description);
    setCode(props.selectedProduct.code);
    setName(props.selectedProduct.name);
    setCost(String(props.selectedProduct.cost));
    setPrice(String(props.selectedProduct.price));
  }, []);

  return (
    <div className="add-product">
      <div className="topBar">
        <span onClick={() => props.setShowDetail(false)}>
          목록으로 돌아가기
        </span>
      </div>
      <form className="add-form" name="add-form" onSubmit={updateProduct}>
        <div className="add-product-top">
          <div className="product-table">
            <div className="product-info-input">
              <div className="product-label">
                <label>NAME</label>
              </div>
              <div className="product-input">
                <input
                  type="text"
                  name="name"
                  onChange={settings}
                  defaultValue={name}
                  disabled={modify}
                ></input>
              </div>
            </div>
            <div className="product-info-input">
              <div className="product-label">
                <label>COST</label>
              </div>
              <div className="product-input">
                <input
                  type="text"
                  name="cost"
                  onChange={settings}
                  defaultValue={cost}
                  disabled={modify}
                ></input>
              </div>
            </div>
            <div className="product-info-input">
              <div className="product-label">
                <label>PRICE</label>
              </div>
              <div className="product-input">
                <input
                  type="text"
                  name="price"
                  onChange={settings}
                  defaultValue={price}
                  disabled={modify}
                ></input>
              </div>
            </div>
            <div className="product-info-input">
              <div className="product-label">
                <label>OPTION 1</label>
              </div>
              <div className="product-input">
                <input
                  type="text"
                  name="option1"
                  onChange={settings}
                  value={option1}
                ></input>
              </div>
            </div>
            <div className="product-info-input">
              <div className="product-label">
                <label>OPTION 2</label>
              </div>
              <div className="product-input">
                <input
                  type="text"
                  name="option2"
                  onChange={settings}
                  value={option2}
                  disabled={!option1}
                ></input>
              </div>
            </div>
            <div className="product-info-input">
              <div className="product-label">
                <label>STOCK</label>
              </div>
              <div className="product-input">
                <input
                  type="text"
                  name="stock"
                  onChange={settings}
                  value={stock}
                ></input>
              </div>
            </div>
            <div className="product-info-input">
              <div className="product-label">
                <label>IMAGE</label>
              </div>
              <div className="product-input">
                <div className="image-input-wrapper">
                  <img
                    className="image-preview"
                    alt="preview image"
                    src={previewSrc}
                  ></img>
                  <span className="image-remove-btn" onClick={removeImage}>
                    X
                  </span>
                  <input
                    className="image-add-btn"
                    type="file"
                    name="image"
                    accept="image/*"
                    onChange={settings}
                  ></input>
                  <button className="image-fake-add-btn" type="button">
                    이미지선택
                  </button>
                </div>
              </div>
            </div>
            <div className="product-info-input">
              <div className="product-label">
                <label>DESCRIPTION</label>
              </div>
              <div className="product-input">
                <textarea
                  className="product_desc"
                  name="desc"
                  defaultValue={initialDescription}
                  onChange={(e) => setDescription(e.target.value)}
                ></textarea>
              </div>
            </div>
          </div>
          <div className="temp-btn-wrapper">
            <span> {">>>"} </span>
            <button type="button" onClick={addProduct_temp}>
              추가
            </button>
            <span> {">>>"} </span>
          </div>
          <div className="product-option-list">
            <table>
              <tr className="product-option">
                <td>삭제</td>
                <td>번호</td>
                <td>색상</td>
                <td>사이즈</td>
                <td>재고</td>
              </tr>
              {optionList.map((item, key) => {
                return (
                  <tr
                    className={
                      item.disabled
                        ? "product-option delete-option"
                        : "product-option"
                    }
                    key={key}
                  >
                    <td>
                      <span
                        className="removeBtn"
                        onClick={() => {
                          deleteOption(key);
                        }}
                      >
                        x
                      </span>
                    </td>
                    <td>{key + 1}</td>
                    <td>{item.option1}</td>
                    <td>{item.option2}</td>
                    <td>
                      <input
                        className="stock-input"
                        defaultValue={item.stock}
                        onChange={(e) => changeStock(e, key)}
                      ></input>
                    </td>
                  </tr>
                );
              })}
            </table>
          </div>
        </div>
        <div className="add-btn-wrapper">
          <button type="submit">상품수정</button>
        </div>
      </form>
    </div>
  );
}

export default ShowDetail;
