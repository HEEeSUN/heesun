export type ProductService = {
  getProducts: () => Promise<{
    product: Product[] | [];
    timesale: SaleProduct[] | [];
  }>;
  getSearchProduct: (
    searchWord: string,
    howToSort: string,
    pageNumber: number
  ) => Promise<{ product: Product[] | []; hasmore: boolean }>;
  getProduct: (
    product_code: string
  ) => Promise<{ product: ProductDetail[] | [] }>;
  addToCart: (product: {
    product_code: string;
    price: number | undefined;
    option_number: number | null;
    quantity: number;
  }) => Promise<{ quantityInCart: number }>;
  getReviews: (
    product_code: string,
    pageNumber: number
  ) => Promise<{ reviews: Reviews[] | []; reviewPageLength: number }>;
};

export type Product = {
  full_count?: number;
  product_code: string;
  main_img_src: string;
  name: string;
  price: number;
  sale?: boolean;
  sale_price: number;
  start: string;
  end: string;
};

export type ProductDetail = {
  product_code: string;
  option_number: number;
  name: string;
  price: number;
  main_img_src: string;
  description: string;
  option1: string;
  option2: string;
  stock: number;
  sale_price: number;
  start: string;
  end: string;
};

export type OptionList = {
  option_number?: number;
  option1?: string;
  option2?: string;
  stock?: number;
  salePrice?: number;
};

export type SaleProduct = {
  product_code: string;
  main_img_src: string;
  name: string;
  price: number;
  sale_price: number;
  start: string;
  end: string;
};

export type Reviews = {
  review_id: number;
  content: string;
  username: string;
  created: string;
  main_img_src?: string;
  product_name?: string;
  product_code?: string;
  detail_id?: number;
};
