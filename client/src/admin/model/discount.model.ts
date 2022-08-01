export type AdminDiscountService = {
  getSaleList: () => Promise<{
    saleGroup: SaleList[] | [];
  }>;
  updateSaleProduct: (
    timeId: number,
    changeList: ChangeProduct[],
    deleteList: number[]
  ) => Promise<{
    productList: SaleProduct[] | [];
  }>;
  deleteSaleGroup: (timeId?: number) => Promise<void>;
  addSaleProduct: (
    productList: Product[],
    saleTime: SaleTime | undefined
  ) => Promise<void>;
  getProductWithOption: (
    category: string,
    searchText: string,
    pageNumber: number
  ) => Promise<{
    productList: Product[] | [];
    productPageLength: number;
  }>;
};

export type SaleTime = {
  saleStartTime: string;
  saleEndTime: string;
};

export type Product = {
  product_code: string;
  option_number: number;
  product_id: number;
  name: string;
  price: number;
  main_img_src: string;
  description: string;
  createdAt: string;
  cost: number;
  option_id: number;
  option1: string;
  option2: string;
  stock: number;
  disabled: boolean;
  time_id: number;
  sale_id: number;
  sale_price: number;
  start: string;
  end: string;
  full_count: number;
  selected?: boolean;
};

export type ChangeProduct = {
  sale_id: number;
  sale_price: number;
  change_price: number;
};

export type SaleProduct = {
  product_code: string;
  option_number: string;
  product_id: number;
  name: string;
  price: number;
  main_img_src: string;
  description: string;
  createdAt: string;
  cost: number;
  option_id: number;
  option1: string;
  option2: string;
  stock: number;
  disabled: boolean;
  time_id: number;
  sale_id: number;
  sale_price: number;
  start: string;
  end: string;
};

export type SaleList = SaleProduct[];
