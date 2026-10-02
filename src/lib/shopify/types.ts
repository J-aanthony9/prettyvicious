export type Money = {
  amount: string;
  currencyCode: string;
};

export type ShopifyImage = {
  url: string;
  altText: string | null;
  width: number | null;
  height: number | null;
};

export type SelectedOption = {
  name: string;
  value: string;
};

export type ProductVariant = {
  id: string;
  title: string;
  availableForSale: boolean;
  selectedOptions: SelectedOption[];
  price: Money;
  compareAtPrice: Money | null;
  image: ShopifyImage | null;
};

export type ProductOption = {
  id: string;
  name: string;
  values: string[];
};

export type CollectionRef = {
  handle: string;
  title: string;
};

/**
 * What a product card needs. Listings fetch only this, so a long catalogue
 * stays a light query: no variants, one image.
 */
export type ProductSummary = {
  id: string;
  handle: string;
  title: string;
  productType: string;
  availableForSale: boolean;
  tags: string[];
  featuredImage: ShopifyImage | null;
  options: ProductOption[];
  collections: CollectionRef[];
  priceRange: {
    minVariantPrice: Money;
    maxVariantPrice: Money;
  };
};

/** Everything the product page needs. */
export type Product = ProductSummary & {
  description: string;
  descriptionHtml: string;
  images: ShopifyImage[];
  variants: ProductVariant[];
};

export type CartLine = {
  id: string;
  quantity: number;
  cost: { totalAmount: Money };
  merchandise: {
    id: string;
    title: string;
    selectedOptions: SelectedOption[];
    image: ShopifyImage | null;
    product: {
      handle: string;
      title: string;
      featuredImage: ShopifyImage | null;
    };
  };
};

export type Cart = {
  id: string;
  checkoutUrl: string;
  totalQuantity: number;
  cost: {
    subtotalAmount: Money;
    totalAmount: Money;
    totalTaxAmount: Money | null;
  };
  lines: CartLine[];
};
