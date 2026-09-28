# E-Commerce Analytics & Order Management API

> **Production-Grade Node.js + MongoDB Aggregation Pipeline + JWT Authentication API**  
> Built strictly adhering to RESTful standards, Role-Based Access Control (RBAC), layered architecture, and high-performance MongoDB indexing.

---

## 1. Project Overview & Architecture

This application is an enterprise-ready E-Commerce Analytics & Order Management REST API. Authenticated users can register, log in, browse products with multi-attribute filtering, place orders with atomic inventory deduction, and review their order history. Administrative users can manage products and access business analytics powered by optimized MongoDB aggregation pipelines.

### Architectural Pattern: Layered Modular Architecture

```
ecommerce-analytics-api/
├── src/
│   ├── config/              # Database connection & third-party configs
│   │   └── db.js
│   ├── constants/           # Global constants (e.g. ROLES enum)
│   │   └── roles.constant.js
│   ├── controllers/         # Singleton ES6 class controllers (HTTP handling)
│   │   ├── auth.controller.js
│   │   ├── product.controller.js
│   │   ├── order.controller.js
│   │   └── analytics.controller.js
│   ├── middlewares/         # Auth, RBAC, Rate Limiting, Error Handling
│   │   ├── auth.middleware.js
│   │   ├── rateLimit.middleware.js
│   │   └── error.middleware.js
│   ├── models/              # Mongoose schemas with compound indexes
│   │   ├── User.js
│   │   ├── Product.js
│   │   └── Order.js
│   ├── routes/              # Express named routers & central aggregator
│   │   ├── auth.routes.js
│   │   ├── product.routes.js
│   │   ├── order.routes.js
│   │   ├── analytics.routes.js
│   │   └── index.js
│   ├── services/            # Pure business logic & MongoDB aggregation pipelines
│   │   └── analytics.service.js
│   ├── utils/               # JWT helpers, Winston logger, HTTP status codes
│   │   ├── jwt.js
│   │   ├── logger.js
│   │   ├── httpStatusCodes.js
│   │   └── commonFields/
│   ├── validators/          # Joi schema validation layer
│   │   ├── index.js
│   │   ├── auth.validator.js
│   │   ├── product.validator.js
│   │   └── order.validator.js
│   └── app.js               # Express application configuration
├── server.js                # Server entry point
├── seed.js                  # Automated database seeder (50 orders, 142 items)
├── explain.js               # Index benchmark and executionStats test runner
├── .env.example             # Environment template
└── package.json
```

---

## 2. Setup & Installation

### Prerequisites

- Node.js (v18+ or v20+)
- MongoDB Atlas or Local MongoDB instance

### Step 1: Install Dependencies

```bash
npm install
```

### Step 2: Environment Configuration

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Ensure your `.env` contains:

```env
PORT=5000
MONGO_URL=your_mongodb_connection_string
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=7d
NODE_ENV=development
```

### Step 3: Populate Realistic Seed Data

Populate the database with 10 users, 20 products, 50 orders, and 140+ line items:

```bash
npm run seed
```

### Step 4: Start Development Server

```bash
npm run dev
```

The server will boot on `http://localhost:5000`.

### Step 5: Run Index Performance Benchmark

Run `.explain("executionStats")` to verify that all compound indexes are actively utilized:

```bash
npm run explain
```

---

## 3. Seed Credentials

| Role         | Email                       | Password         | Permissions                                    |
| ------------ | --------------------------- | ---------------- | ---------------------------------------------- |
| **Admin**    | `superadmin999@yopmail.com` | `Superadmin@999` | Create Products, View All Analytics Pipelines  |
| **Customer** | `sumandas1995@yopmail.com`  | `Test@1234`      | Browse Products, Place Orders, View Own Orders |

_(Additional 8 customer accounts seeded with `Password@123`)_

---

## 4. API Endpoints Catalog

### Authentication (`/api/auth`)

| Method | Endpoint             | Access | Description                                     |
| ------ | -------------------- | ------ | ----------------------------------------------- |
| `POST` | `/api/auth/register` | Public | Register new customer or admin account          |
| `POST` | `/api/auth/login`    | Public | Authenticate credentials and receive Bearer JWT |

### Products (`/api/products`)

| Method | Endpoint        | Access         | Description                                                                                    |
| ------ | --------------- | -------------- | ---------------------------------------------------------------------------------------------- |
| `POST` | `/api/products` | **Admin Only** | Create a new product (`name, category, price, stock`)                                          |
| `GET`  | `/api/products` | Public         | Browse products with `$facet` aggregation (category, price range, search, pagination, sorting) |

_Query Example:_  
`GET /api/products?category=Laptops&minPrice=50000&maxPrice=150000&page=1&limit=10&sort=-price`

### Orders (`/api/orders`)

| Method | Endpoint      | Access               | Description                                                      |
| ------ | ------------- | -------------------- | ---------------------------------------------------------------- |
| `POST` | `/api/orders` | **Customer / Admin** | Place an order with server-side pricing & atomic stock deduction |
| `GET`  | `/api/orders` | **Customer / Admin** | View authenticated user's order history                          |

### MongoDB Business Analytics (`/api/analytics`) — _Admin Only_

| Method | Endpoint                         | Key Operators                               | Output Metrics                                                                 |
| ------ | -------------------------------- | ------------------------------------------- | ------------------------------------------------------------------------------ |
| `GET`  | `/api/analytics/dashboard`       | `$match, $group, $sum, $avg, $cond`         | Total orders, gross revenue, average order value, completed & cancelled counts |
| `GET`  | `/api/analytics/category-sales`  | `$unwind, $lookup, $group, $project, $sort` | Revenue, units sold, and unique order count grouped by product category        |
| `GET`  | `/api/analytics/top-products`    | `$unwind, $group, $sort, $limit, $lookup`   | Top 5 products by revenue and quantity sold                                    |
| `GET`  | `/api/analytics/customers`       | `$group, $lookup, $unwind, $project, $sort` | Customer Lifetime Value (CLV): total orders & total spending per customer      |
| `GET`  | `/api/analytics/monthly-revenue` | `$group, $year, $month, $sum, $sort`        | Revenue and average order value breakdown grouped by year and month            |
| `GET`  | `/api/analytics/sales?from=&to=` | `$match, $group, $reduce, date filtering`   | Orders, gross revenue, and total items sold within a specific date range       |
| `GET`  | `/api/analytics/order-status`    | `$group, $sum, $sort`                       | Order counts, revenue, and average order value grouped by fulfillment status   |

---

## 5. MongoDB Aggregation Pipeline Architecture

### Pipeline Breakdown by Stage

1. **Dashboard Pipeline (`/dashboard`)**:
   - `$match`: Filters base orders.
   - `$group` (`_id: null`): Gathers all records into a single summary document. Uses `$cond` inside `$sum` and `$avg` to exclude cancelled orders from revenue calculations.
   - `$project`: Rounds decimals and suppresses `_id`.

2. **Category Sales Pipeline (`/category-sales`)**:
   - `$match`: Filters non-cancelled orders.
   - `$unwind` (`$items`): Flattens nested order line items into individual records.
   - `$lookup`: Performs a left outer join with `products` on `items.product == products._id`.
   - `$unwind` (`$productDetails`): Converts the joined 1-element array into a flat object.
   - `$group` (`_id: "$productDetails.category"`): Sums revenue, units sold, and tracks unique order IDs using `$addToSet: "$_id"`.
   - `$project`: Calculates unique orders using `{ $size: "$orderIds" }`.

3. **Top Products Pipeline (`/top-products`)**:
   - `$unwind` (`$items`): Deconstructs order items.
   - `$group` (`_id: "$items.product"`): Aggregates quantity and revenue **before** lookup.
   - `$sort` & `$limit: 5`: Restricts output to the top 5 products immediately.
   - `$lookup` & `$unwind`: Joins the `products` collection **only 5 times**, demonstrating optimal query performance.

4. **Customer Analytics Pipeline (`/customers`)**:
   - `$group` (`_id: "$user"`): Groups orders by customer ID to sum total lifetime spend and order count.
   - `$lookup`: Joins the `users` collection to pull name and email.
   - `$project` & `$sort`: Formats currency and sorts by highest spending customer first.

5. **Monthly Revenue Pipeline (`/monthly-revenue`)**:
   - `$group`: Uses compound key `{ year: { $year: "$createdAt" }, month: { $month: "$createdAt" } }` to prevent overlapping months across years.
   - `$sort`: Orders chronologically `{ "_id.year": -1, "_id.month": -1 }`.

6. **Date Range Sales Pipeline (`/sales?from=&to=`)**:
   - `$match`: Compares BSON date boundaries using `$gte` and `$lte`.
   - `$group`: Uses `$reduce` on `$items` to sum total line item quantities without needing `$unwind`, eliminating duplicate revenue calculations.

7. **Order Status Breakdown (`/order-status`)**:
   - `$group` (`_id: "$status"`): Segregates orders by lifecycle stage (`pending`, `confirmed`, `shipped`, `delivered`, `cancelled`).

---

## 6. Indexing & Performance Benchmark (`explain()`)

### Index Strategy

| Model     | Index Key                      | Purpose                                                                    |
| --------- | ------------------------------ | -------------------------------------------------------------------------- |
| `User`    | `{ email: 1 }`                 | Fast $O(\log N)$ unique index for login and registration verification      |
| `Product` | `{ category: 1, price: 1 }`    | Compound index powering category filtering and price sorting/range queries |
| `Order`   | `{ user: 1, createdAt: -1 }`   | Compound index optimizing customer order retrieval sorted newest-to-oldest |
| `Order`   | `{ status: 1, createdAt: -1 }` | Compound index accelerating order status queries and analytics matching    |

### Benchmark Results (from `npm run explain`)

```
==========================================================================================
                       INDEX PERFORMANCE BENCHMARK REPORT
==========================================================================================
┌─────────┬───────────────────────────────┬────────────────────────────────┬─────────┬──────────────────┬──────────────┬──────────────┬──────────────┐
│ (index) │ Query                         │ Index                          │ Stage   │ ExecutionTime_ms │ DocsExamined │ KeysExamined │ DocsReturned │
├─────────┼───────────────────────────────┼────────────────────────────────┼─────────┼──────────────────┼──────────────┼──────────────┼──────────────┤
│ 0       │ 'User by Email'               │ '{ email: 1 }'                 │ 'FETCH' │ 0                │ 1            │ 1            │ 1            │
│ 1       │ 'Product by Category & Price' │ '{ category: 1, price: 1 }'    │ 'FETCH' │ 0                │ 3            │ 3            │ 3            │
│ 2       │ 'Order by User & CreatedAt'   │ '{ user: 1, createdAt: -1 }'   │ 'FETCH' │ 0                │ 17           │ 17           │ 17           │
│ 3       │ 'Order by Status & CreatedAt' │ '{ status: 1, createdAt: -1 }' │ 'FETCH' │ 0                │ 22           │ 22           │ 22           │
└─────────┴───────────────────────────────┴────────────────────────────────┴─────────┴──────────────────┴──────────────┴──────────────┴──────────────┘
```

**Key Takeaways:**

1. **0ms Execution Time**: All indexed queries execute in sub-millisecond time.
2. **Zero Wasted Document Reads**: `DocsExamined == DocsReturned` in every test, proving optimal B-Tree index traversal with zero `COLLSCAN` overhead.

---

## 7. Master Viva / Interview Questions & Answers

### 1. Why should aggregation happen in MongoDB instead of Node.js?

**Answer:**  
Executing aggregations in MongoDB leverages the database engine's native C++ execution layer, memory management, and B-Tree indexes. If aggregation were done in Node.js, the application would need to transfer millions of raw documents over the network into Node's V8 single-threaded heap, leading to high network latency, CPU saturation, and garbage collection pauses. Performing aggregation on the database server filters and reduces data at the source, returning only the compact, final summary over the wire.

### 2. What is the difference between MongoDB `$lookup` and a SQL JOIN?

**Answer:**  
In relational databases, a SQL `JOIN` merges tabular rows into a flat Cartesian product row. In MongoDB, `$lookup` performs a left outer join on a separate collection and embeds the matched documents as a **nested array** inside the input document. Because documents in MongoDB are hierarchical, `$lookup` preserves parent-child document structures, which can subsequently be unwound with `$unwind` if flat projection is required.

### 3. Why is `$unwind` required for order items?

**Answer:**  
In our `Order` document, `items` is an array of subdocuments `[{ product, quantity, price }]`. MongoDB aggregation operators such as `$group`, `$sum`, and `$lookup` operate on top-level fields of individual documents, not directly across elements nested inside arrays. The `$unwind` stage deconstructs the `items` array, creating a distinct copy of the parent document for each element in the array. This allows subsequent stages to join product metadata and perform mathematical calculations on each item independently.

### 4. Why should `$match` generally be placed as early as possible?

**Answer:**  
Placing `$match` at the beginning of an aggregation pipeline has two critical benefits:

1. **Index Utilization**: MongoDB can only use indexes to filter documents if `$match` occurs as the first stage (or directly before/after `$sort`).
2. **Pipelined Data Reduction**: Filtering out irrelevant documents (e.g. cancelled orders or out-of-range dates) immediately reduces the volume of data that subsequent memory-intensive stages (`$unwind`, `$lookup`, `$group`) must process.

### 5. What is the purpose of `$facet`?

**Answer:**  
`$facet` allows executing multiple aggregation sub-pipelines in parallel within a single query on the exact same input stream. It is commonly used for multi-faceted search and server-side pagination: one sub-pipeline calculates the metadata (total document count via `[{ $count: "total" }]`), while a parallel sub-pipeline extracts the paginated records via `[{ $skip: skip }, { $limit: limit }]`. This replaces two separate database round-trips with a single atomic operation.

### 6. How does an index improve aggregation performance?

**Answer:**  
Indexes provide pre-sorted B-Tree data structures. When an aggregation starts with an indexed `$match` or `$sort`, MongoDB can perform an `IXSCAN` (Index Scan) to identify and jump directly to relevant documents instead of executing a `COLLSCAN` (Collection Scan) that reads every document off disk. Additionally, an index on the sort keys allows MongoDB to return sorted documents directly without having to perform an in-memory sort (which fails if memory exceeds MongoDB's 100MB RAM limit).

### 7. What happens when a JWT expires?

**Answer:**  
When `jwt.verify(token, secret)` is called on an expired token, the `jsonwebtoken` library throws a `TokenExpiredError`. In our centralized error handling middleware (`src/middlewares/error.middleware.js`), this error is intercepted and transformed into a standard `401 Unauthorized` HTTP response with `{ success: false, message: "Your token has expired. Please log in again." }`, prompting the client to re-authenticate or refresh their token.

### 8. What is the difference between authentication and authorization?

**Answer:**

- **Authentication (AuthN)**: Verifies **who the user is**. In our system, `authenticate` middleware inspects the JWT Bearer token, verifies its cryptographic signature, checks if the account is active, and attaches `req.user`.
- **Authorization (AuthZ)**: Verifies **what permissions or resources the authenticated user is allowed to access**. In our system, `authorize("admin")` inspects `req.user.role` to ensure customers cannot execute administrative operations like creating products or accessing business analytics.

### 9. Why should the order price be stored instead of always reading the current product price?

**Answer:**  
Product prices change over time due to inflation, catalog updates, or promotional campaigns. If an order did not snapshot the unit price at the time of purchase and instead dynamically looked up the product's current catalog price, all historical orders, invoices, tax calculations, and revenue analytics would retroactively mutate whenever a merchant updated a product's price. Storing the price inside the order preserves financial immutability.

### 10. Why should the client not send `totalAmount`?

**Answer:**  
Client-side input can never be trusted in secure web applications. If an API accepted `price` or `totalAmount` from the HTTP request body, an attacker could manipulate the request payload via Postman or DevTools to purchase a \$2,000 laptop for \$0.01. The server must be the sole authority: it fetches current product prices from the database, validates available stock, and calculates `totalAmount = sum(price * quantity)` on the server before persisting the order.

### 11. How would you implement refresh-token rotation and reuse detection in a production system?

**Answer:**

1. **Issuance**: Upon login, generate a short-lived access token (e.g., 15 minutes) and a long-lived refresh token (e.g., 7 days). Store a cryptographic hash of the refresh token in the database alongside a `family` identifier and a `isRevoked` flag.
2. **Rotation**: When the client requests a new access token using the refresh token, verify and invalidate (revoke) the current refresh token and issue a _new_ access token along with a _new_ refresh token.
3. **Reuse Detection**: If an incoming refresh token is presented that has already been marked as revoked/used, a token theft event is detected. The server immediately invalidates the entire token family associated with that user, forcing all active sessions to log out and preventing malicious access.
