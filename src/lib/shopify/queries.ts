export const IMAGE_FRAGMENT = /* GraphQL */ `
  fragment ImageParts on Image {
    url
    altText
    width
    height
  }
`;

/**
 * Card level fields. Listings use only this, so paging through a large
 * catalogue never drags every variant of every product along with it.
 */
export const PRODUCT_SUMMARY_FRAGMENT = /* GraphQL */ `
  fragment ProductSummaryParts on Product {
    id
    handle
    title
    productType
    availableForSale
    tags
    featuredImage {
      ...ImageParts
    }
    options {
      id
      name
      values
    }
    collections(first: 20) {
      nodes {
        handle
        title
      }
    }
    # Just enough of each variant to draw design swatches on a card.
    swatchVariants: variants(first: 100) {
      nodes {
        selectedOptions {
          name
          value
        }
        image {
          ...ImageParts
        }
      }
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
  }
`;

/**
 * The product page. 250 is the most a single Storefront API page returns,
 * which covers color x size x design listings with room to spare.
 */
export const PRODUCT_FRAGMENT = /* GraphQL */ `
  fragment ProductParts on Product {
    ...ProductSummaryParts
    description
    descriptionHtml
    images(first: 50) {
      nodes {
        ...ImageParts
      }
    }
    variants(first: 250) {
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
  ${PRODUCT_SUMMARY_FRAGMENT}
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

const PAGE_INFO = /* GraphQL */ `
  pageInfo {
    hasNextPage
    endCursor
  }
`;

export const GET_PRODUCTS = /* GraphQL */ `
  query GetProducts(
    $first: Int!
    $after: String
    $sortKey: ProductSortKeys
    $reverse: Boolean
  ) @inContext(country: US) {
    products(first: $first, after: $after, sortKey: $sortKey, reverse: $reverse) {
      ${PAGE_INFO}
      nodes {
        ...ProductSummaryParts
      }
    }
  }
  ${PRODUCT_SUMMARY_FRAGMENT}
  ${IMAGE_FRAGMENT}
`;

export const GET_PRODUCT_BY_HANDLE = /* GraphQL */ `
  query GetProductByHandle($handle: String!) @inContext(country: US) {
    product(handle: $handle) {
      ...ProductParts
    }
  }
  ${PRODUCT_FRAGMENT}
`;

/**
 * A collection in the order set in Shopify (Products > Collections > Sort).
 * Paged, so a collection of any size comes back whole.
 */
export const GET_COLLECTION_PRODUCTS = /* GraphQL */ `
  query GetCollectionProducts($handle: String!, $first: Int!, $after: String)
  @inContext(country: US) {
    collection(handle: $handle) {
      title
      description
      products(first: $first, after: $after) {
        ${PAGE_INFO}
        nodes {
          ...ProductSummaryParts
        }
      }
    }
  }
  ${PRODUCT_SUMMARY_FRAGMENT}
  ${IMAGE_FRAGMENT}
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
