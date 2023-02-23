import { useState } from "react";
import Resizer from "react-image-file-resizer";
import "./products.css";
import { AdminProductService, Product } from "../../model/product.model";
import ProductInfoInput from "./components/ProductInfoInput";

type Props = {
  adminProductService: AdminProductService;
};

export function Products({ adminProductService }: Props) {
  let [products, setProducts] = useState<Product[]>([]);
  let [name, setName] = useState<string>("");
  let [code, setCode] = useState<string>("");
  let [cost, setCost] = useState<string>("");
  let [price, setPrice] = useState<string>("");
  let [option1, setOption1] = useState<string>("");
  let [option2, setOption2] = useState<string>("");
  let [stock, setStock] = useState<string>("");
  let [imageFile, setImageFile] = useState<File | null>(null);
  let [description, setDescription] = useState<string>("");
  let [codeCheck, setCodeCheck] = useState<boolean>(false);
  let [modify, setModify] = useState<boolean>(false);
  let [previewSrc, setPreviewSrc] = useState<string>("");
  let [previewInput, setPreviewInput] = useState<HTMLInputElement>();
  let [noOption, setNoOption] = useState<boolean>(false);

  /* 상품코드 중복 체크 */
  const duplicateCheck = async () => {
    if (!code || code.length > 20) {
      alert("상품코드를 확인해주세요");
      return;
    }

    try {
      await adminProductService.duplicateCheck(code);

      setCodeCheck(true);
      alert("사용가능한 상품코드 입니다");
    } catch (error: any) {
      alert(error.message);
    }
  };

  const requiredProductInfoList = [
    {
      name: "code",
      required: true,
      value: code,
      disabled: codeCheck,
      op: duplicateCheck,
    },
    {
      name: "name",
      required: true,
      value: name,
      disabled: modify,
    },
    {
      name: "cost",
      required: true,
      value: cost,
      disabled: modify,
    },
    {
      name: "price",
      required: true,
      value: price,
      disabled: modify,
    },
    {
      name: "option1",
      required: false,
      value: option1,
      disabled: noOption,
    },
    {
      name: "option2",
      required: false,
      value: option2,
      disabled: !option1,
    },
    {
      name: "stock",
      required: true,
      value: stock,
      disabled: noOption,
    },
  ];

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

  /* 상품 추가 */
  const addProduct = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    let formData = new FormData();

    if (!products[0]) {
      alert("상품 (옵션) 추가후 등록해 주세요");
    } else {
      if (imageFile) {
        formData.append("uploadedImage", imageFile, imageFile.name);
      }

      const productInfo = {
        productCode: code,
        name,
        description,
        cost,
        price,
        options: products
      }

      formData.append("products", JSON.stringify(productInfo));

      try {
        await adminProductService.addProduct(formData);

        alert("상품이 등록되었습니다");
        clearAfterAdd();
      } catch (error: any) {
        alert(error.message);
        return;
      }
    }
  };

  /* 상품등록후 state 초기화 */
  const clearAfterAdd = async () => {
    setProducts([]);
    setCode("");
    setName("");
    setCost("");
    setPrice("");
    setOption1("");
    setOption2("");
    setStock("");
    setImageFile(null);
    setPreviewSrc("");
    setDescription("");
    setCodeCheck(false);
    setModify(false);
    setNoOption(false);
  };

  /* 상품 등록전 각 항목 검증 */
  function validationCheck() {
    if (!(code && name && price && stock && cost)) {
      alert("필수 입력 항목을 확인해 주세요");
      return false;
    }

    if (code.length > 50) {
      alert("상품코드를 확인해 주세요");
      return false;
    }

    if (!codeCheck) {
      alert("상품코드 중복 여부를 확인해 주세요");
      return false;
    }

    if (name.length > 50) {
      alert("상품명을 확인해 주세요");
      return false;
    }

    if (
      !Number(cost) ||
      !Number(price) ||
      !Number(stock) ||
      Number(cost) > 100000000 ||
      Number(price) > 100000000 ||
      Number(stock) < 1
    ) {
      alert(
        "상품 재고와 가격, 원가는 1~100,000,000 사이의 숫자만 입력해 주세요"
      );
      return false;
    }

    if (option1 && option1.length > 20) {
      alert("옵션1 을 확인해 주세요");
      return false;
    }

    if (option2 && option2.length > 20) {
      alert("옵션2 를 확인해 주세요");
      return false;
    }

    return true;
  }

  /* 임시로 상품 옵션 추가 */
  function addProduct_temp() {
    if (validationCheck()) {
      if (!option1 && !option2 && products[0]) {
        alert("상품 옵션을 입력하지 않았습니다");
        return;
      }

      if (!option1 && !option2) {
        const result = window.confirm(
          "상품 옵션을 입력하지 않아 추가로 옵션을 입력하실 수 없습니다\n단일품목으로 등록하시겠습니까?"
        );

        if (!result) {
          return;
        } else {
          setNoOption(true);
        }
      }

      const newProduct: Product = {
        option1,
        option2,
        stock: Number(stock),
      };

      const newArray = [...products];
      newArray.push(newProduct);
      setProducts(newArray);
      setModify(true);

      setOption1("");
      setOption2("");
      setStock("");
    }
  }

  /* 임시로 추가해 놓은 옵션 삭제 */
  function deleteOption(key: number) {
    const tempArray1 = [...products];
    const tempArray2 = tempArray1.splice(0, key);
    tempArray1.shift();
    const newArray = tempArray2.concat(tempArray1);
    setProducts(newArray);

    if (newArray.length < 1) {
      setNoOption(false);
    }
  }

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

  /* input 항목에 따라 해당 state 변경 */
  function settings(event: React.ChangeEvent<HTMLInputElement>) {
    const type = event.target.type;
    const value = event.target.value;
    let targetName;

    if (type === "file") {
      setPreviewInput(event.target);
      if (event.target.files) {
        if (event.target.files[0].size >= 5242880) {
          alert("5MB 이하 이미지만 업로드 가능합니다");
          return;
        }
        preview(event.target.files[0]);
        resizeImageFile(event.target.files[0]);
      }
    } else {
      targetName = event.target.name;
    }

    switch (targetName) {
      case "code":
        setCode(value);
        setCodeCheck(false);
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

  return (
    <div className="add-product">
      <form className="add-form" name="add-form" onSubmit={addProduct}>
        <p className="add-product-notice">
          *이 표시된 항목을 필수 입력사항입니다.
        </p>
        <div className="add-product-top">
          <div className="product-table">
            {requiredProductInfoList.map((info, key) => {
              return (
                <ProductInfoInput
                  name={info.name}
                  required={info.required}
                  value={info.value}
                  settings={settings}
                  disabled={info.disabled}
                  op={info.op}
                />
              );
            })}
            <div className="product-info-input">
              <div className="product-label">
                <label>IMAGE</label>
              </div>
              <div className="product-input">
                <div className="image-input-wrapper">
                  {previewSrc ? (
                    <img
                      className="image-preview"
                      alt="preview image"
                      src={previewSrc}
                    ></img>
                  ) : (
                    <div className="image-preview"></div>
                  )}
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
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                ></textarea>
              </div>
            </div>
          </div>
          <div className="temp-btn-wrapper">
            <span> {">>>"} </span>
            <button type="button" onClick={addProduct_temp} disabled={noOption}>
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
              {products.map((item, key) => {
                return (
                  <tr className="product-option" key={key}>
                    <td>
                      <span
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
                    <td>{item.stock}</td>
                  </tr>
                );
              })}
            </table>
          </div>
        </div>
        <div className="add-btn-wrapper">
          <button type="submit" disabled={!products[0]}>
            상품등록
          </button>
        </div>
      </form>
    </div>
  );
}

export default Products;
