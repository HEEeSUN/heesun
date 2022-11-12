export type Product = {
  option1: string;
  option2: string;
  stock: number;
};

export type SalesOfPerMonth = {
  month: string;
  sales: number;
  refund: number;
  cost: number;
};

export type SalesQuantity = {
  product_code: string;
  option1: string;
  option2: string;
  count: number;
};

export type ProductSummary = {
  product_code: string; //
  name: string; //
  price: number; //
  main_img_src: string; //
  description: string; //
  cost: number; //
};

export type SelectedProduct = {
  code: string;
  name: string;
  price: number;
  cost: number;
  imgSrc: string;
  description: string;
};

export type Option = {
  option_id?: number;
  product_code?: string;
  option_number?: number;
  option1: string;
  option2: string;
  stock: number;
  disabled: boolean;
  price?: number;
  cost?: number;
};

export type DashboardAlerts = {
  title: string;
  alt: string;
  iconSrc: string;
  extraClass: string;
  count: number | string;
  clickEventHandler?: () => void;
}[];

export type AdminProductService = {
  //dashboard
  getInitialData: () => Promise<{
    message: number;
    order: number;
    refund: number;
    sales: number;
    salesOf6month: SalesOfPerMonth[] | [];
  }>;
  //products
  duplicateCheck: (product_code: string) => Promise<void>;
  addProduct: (formData: FormData) => Promise<void>;
  //managePorudts
  getProduct: (
    category: string,
    searchText: string,
    pageNumber: number
  ) => Promise<{
    productList: ProductSummary[] | [];
    productPageLength: number;
  }>;
  deleteProduct: (code: string) => Promise<void>;
  updateProduct: (code: string, formData: FormData) => Promise<void>;
  getDetail: (
    code: string
  ) => Promise<{ options1: Option[] | []; options2: Option[] | [] }>;
};
