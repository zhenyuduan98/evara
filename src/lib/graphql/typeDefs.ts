export const typeDefs = `#graphql
  type Product {
    id: ID!
    name: String!
    slug: String!
    description: String
    price: Float!
    images: [String!]!
    rating: Float!
    reviewCount: Int!
    category: Category
    seller: User
    brand: String
    compareAtPrice: Float
  }

  type Category {
    id: ID!
    name: String!
    slug: String!
  }

  type User {
    id: ID!
    name: String
    email: String
  }

  type Order {
    id: ID!
    status: String!
    total: Float!
    items: [OrderItem!]!
    createdAt: String!
  }

  type OrderItem {
    id: ID!
    title: String!
    price: Float!
    quantity: Int!
    imageUrl: String
  }

  type CartItem {
    id: ID!
    product: Product!
    quantity: Int!
  }

  type Review {
    id: ID!
    rating: Int!
    title: String!
    comment: String!
    user: User!
    createdAt: String!
  }

  type Cart {
    id: ID!
    items: [CartItem!]!
  }

  type Query {
    products(search: String, category: String, limit: Int, offset: Int): [Product!]!
    product(slug: String!): Product
    cart: Cart
    orders: [Order!]!
    reviews(productId: String!): [Review!]!
  }

  type Mutation {
    addToCart(productId: String!, quantity: Int): CartItem!
    removeFromCart(itemId: String!): Boolean!
    updateCartQuantity(itemId: String!, quantity: Int!): CartItem!
    createReview(productId: String!, rating: Int!, title: String!, comment: String!): Review!
  }
`;
