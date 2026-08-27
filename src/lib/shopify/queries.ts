export const IMAGE_FRAGMENT = /* GraphQL */ `
  fragment ImageParts on Image {
    url
    altText
    width
    height
  }
`;

export const PRODUCT_FRAGMENT = /* GraphQL */ `
  fragment ProductParts on Product {
    id
    handle
    title
    description
    descriptionHtml
    availableForSale
    tags
    featuredImage {
      ...ImageParts
    }
    images(first: 10) {
      nodes {
        ...ImageParts
      }
    }
    options {
      id
      name
      values
    }
    priceRange {
      minVariantPrice {
        amount
        currencyCode
      }
      maxVariantPrice {
        amount
        currencyCode
      }
    }
    variants(first: 100) {
      nodes {
        id
        title
        availableForSale
        selectedOptions {
          name
          value
        }
        price {
          amount
          currencyCode
        }
        compareAtPrice {
          amount
          currencyCode
        }
        image {
          ...ImageParts
        }
      }
    }
  }
  ${IMAGE_FRAGMENT}
`;

export const CART_FRAGMENT = /* GraphQL */ `
  fragment CartParts on Cart {
    id
    checkoutUrl
    totalQuantity
    cost {
      subtotalAmount {
        amount
        currencyCode
      }
      totalAmount {
        amount
        currencyCode
      }
      totalTaxAmount {
        amount
        currencyCode
      }
    }
    lines(first: 100) {
      nodes {
        id
        quantity
        cost {
          totalAmount {
            amount
            currencyCode
          }
        }
        merchandise {
          ... on ProductVariant {
            id
            title
            selectedOptions {
              name
              value
            }
            image {
              ...ImageParts
            }
            product {
              handle
              title
              featuredImage {
                ...ImageParts
              }
            }
          }
        }
      }
    }
  }
  ${IMAGE_FRAGMENT}
`;

export const GET_PRODUCTS = /* GraphQL */ `
  query GetProducts($first: Int!, $query: String, $sortKey: ProductSortKeys, $reverse: Boolean)
  @inContext(country: US) {
    products(first: $first, query: $query, sortKey: $sortKey, reverse: $reverse) {
      nodes {
        ...ProductParts
      }
    }
  }
  ${PRODUCT_FRAGMENT}
`;

export const GET_PRODUCT_BY_HANDLE = /* GraphQL */ `
  query GetProductByHandle($handle: String!) @inContext(country: US) {
    product(handle: $handle) {
      ...ProductParts
    }
  }
  ${PRODUCT_FRAGMENT}
`;

export const GET_COLLECTION_PRODUCTS = /* GraphQL */ `
  query GetCollectionProducts($handle: String!, $first: Int!) @inContext(country: US) {
    collection(handle: $handle) {
      title
      description
      products(first: $first) {
        nodes {
          ...ProductParts
        }
      }
    }
  }
  ${PRODUCT_FRAGMENT}
`;

export const GET_CART = /* GraphQL */ `
  query GetCart($id: ID!) {
    cart(id: $id) {
      ...CartParts
    }
  }
  ${CART_FRAGMENT}
`;

export const CREATE_CART = /* GraphQL */ `
  mutation CreateCart($lines: [CartLineInput!], $buyerIdentity: CartBuyerIdentityInput) {
    cartCreate(input: { lines: $lines, buyerIdentity: $buyerIdentity }) {
      cart {
        ...CartParts
      }
      userErrors {
        field
        message
      }
    }
  }
  ${CART_FRAGMENT}
`;

export const ADD_CART_LINES = /* GraphQL */ `
  mutation AddCartLines($cartId: ID!, $lines: [CartLineInput!]!) {
    cartLinesAdd(cartId: $cartId, lines: $lines) {
      cart {
        ...CartParts
      }
      userErrors {
        field
        message
      }
    }
  }
  ${CART_FRAGMENT}
`;

export const UPDATE_CART_LINES = /* GraphQL */ `
  mutation UpdateCartLines($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
    cartLinesUpdate(cartId: $cartId, lines: $lines) {
      cart {
        ...CartParts
      }
      userErrors {
        field
        message
      }
    }
  }
  ${CART_FRAGMENT}
`;

export const REMOVE_CART_LINES = /* GraphQL */ `
  mutation RemoveCartLines($cartId: ID!, $lineIds: [ID!]!) {
    cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
      cart {
        ...CartParts
      }
      userErrors {
        field
        message
      }
    }
  }
  ${CART_FRAGMENT}
`;
