import mongoose from "mongoose";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import dns from "node:dns";
import User from "./src/models/User.js";
import Product from "./src/models/Product.js";
import Order from "./src/models/Order.js";

dotenv.config();
dns.setServers(["8.8.8.8", "1.1.1.1"]);

const seedDatabase = async () => {
  try {
    console.log("Connecting to database...");
    await mongoose.connect(process.env.MONGO_URL);
    console.log("Connected to MongoDB!");

    // 1. Clear existing test data
    console.log("Clearing existing collections...");
    await Promise.all([
      User.deleteMany({}),
      Product.deleteMany({}),
      Order.deleteMany({}),
    ]);

    // 2. Hash passwords
    console.log("Hashing passwords...");
    const adminPasswordHash = await bcrypt.hash("Superadmin@999", 10);
    const primaryCustomerHash = await bcrypt.hash("Test@1234", 10);
    const standardCustomerHash = await bcrypt.hash("Password@123", 10);

    // 3. Create 10 Users (1 Admin, 9 Customers)
    console.log("Seeding 10 users...");
    const users = await User.create([
      {
        name: "Super Admin",
        email: "superadmin999@yopmail.com",
        password: adminPasswordHash,
        role: "admin",
        isActive: true,
      },
      {
        name: "Suman Das",
        email: "sumandas1995@yopmail.com",
        password: primaryCustomerHash,
        role: "customer",
        isActive: true,
      },
      {
        name: "Rahul Sharma",
        email: "rahul.sharma@example.com",
        password: standardCustomerHash,
        role: "customer",
        isActive: true,
      },
      {
        name: "Priya Patel",
        email: "priya.patel@example.com",
        password: standardCustomerHash,
        role: "customer",
        isActive: true,
      },
      {
        name: "Amit Kumar",
        email: "amit.kumar@example.com",
        password: standardCustomerHash,
        role: "customer",
        isActive: true,
      },
      {
        name: "Sneha Sen",
        email: "sneha.sen@example.com",
        password: standardCustomerHash,
        role: "customer",
        isActive: true,
      },
      {
        name: "Vikram Verma",
        email: "vikram.verma@example.com",
        password: standardCustomerHash,
        role: "customer",
        isActive: true,
      },
      {
        name: "Ananya Roy",
        email: "ananya.roy@example.com",
        password: standardCustomerHash,
        role: "customer",
        isActive: true,
      },
      {
        name: "Rohit Singh",
        email: "rohit.singh@example.com",
        password: standardCustomerHash,
        role: "customer",
        isActive: true,
      },
      {
        name: "Pooja Das",
        email: "pooja.das@example.com",
        password: standardCustomerHash,
        role: "customer",
        isActive: true,
      },
    ]);

    const customerUsers = users.filter((u) => u.role === "customer");

    // 4. Create 20 Products across 5 categories
    console.log("Seeding 20 products...");
    const products = await Product.create([
      // Laptops
      {
        name: "MacBook Pro 16 M3 Max",
        category: "Laptops",
        price: 249999,
        stock: 25,
        isActive: true,
      },
      {
        name: "Dell XPS 15",
        category: "Laptops",
        price: 135000,
        stock: 30,
        isActive: true,
      },
      {
        name: "Lenovo ThinkPad X1 Carbon",
        category: "Laptops",
        price: 120000,
        stock: 20,
        isActive: true,
      },
      {
        name: "ASUS ROG Zephyrus G14",
        category: "Laptops",
        price: 145000,
        stock: 15,
        isActive: true,
      },

      // Electronics
      {
        name: "iPhone 15 Pro Max",
        category: "Electronics",
        price: 149900,
        stock: 40,
        isActive: true,
      },
      {
        name: "Samsung Galaxy S24 Ultra",
        category: "Electronics",
        price: 129999,
        stock: 35,
        isActive: true,
      },
      {
        name: "iPad Pro 12.9 M2",
        category: "Electronics",
        price: 112900,
        stock: 25,
        isActive: true,
      },
      {
        name: "Sony Bravia 55-inch 4K TV",
        category: "Electronics",
        price: 79990,
        stock: 18,
        isActive: true,
      },

      // Audio
      {
        name: "Sony WH-1000XM5 Headphones",
        category: "Audio",
        price: 29990,
        stock: 50,
        isActive: true,
      },
      {
        name: "Apple AirPods Pro 2nd Gen",
        category: "Audio",
        price: 24900,
        stock: 60,
        isActive: true,
      },
      {
        name: "Bose QuietComfort 45",
        category: "Audio",
        price: 26900,
        stock: 35,
        isActive: true,
      },
      {
        name: "JBL Flip 6 Bluetooth Speaker",
        category: "Audio",
        price: 9999,
        stock: 70,
        isActive: true,
      },

      // Accessories
      {
        name: "Keychron Q1 Pro Mechanical Keyboard",
        category: "Accessories",
        price: 16999,
        stock: 45,
        isActive: true,
      },
      {
        name: "Logitech MX Master 3S Mouse",
        category: "Accessories",
        price: 8995,
        stock: 80,
        isActive: true,
      },
      {
        name: "Dell UltraSharp 27 4K Monitor",
        category: "Accessories",
        price: 42999,
        stock: 25,
        isActive: true,
      },
      {
        name: "Anker 737 Power Bank 24000mAh",
        category: "Accessories",
        price: 12999,
        stock: 50,
        isActive: true,
      },

      // Wearables
      {
        name: "Apple Watch Ultra 2",
        category: "Wearables",
        price: 89900,
        stock: 30,
        isActive: true,
      },
      {
        name: "Samsung Galaxy Watch 6 Classic",
        category: "Wearables",
        price: 36999,
        stock: 40,
        isActive: true,
      },
      {
        name: "Garmin Forerunner 965",
        category: "Wearables",
        price: 67490,
        stock: 20,
        isActive: true,
      },
      {
        name: "Fitbit Charge 6",
        category: "Wearables",
        price: 14999,
        stock: 65,
        isActive: true,
      },
    ]);

    // 5. Generate 50 Orders with 130+ Order Items spanning the last 6 months
    console.log("Seeding 50 orders (130+ items)...");
    const statuses = [
      "delivered",
      "delivered",
      "delivered",
      "shipped",
      "confirmed",
      "pending",
      "cancelled",
    ];
    const ordersData = [];

    // Helper to generate a random date in the last 6 months (April - September 2026)
    const now = new Date();
    const getRandomPastDate = (daysAgoMax = 180) => {
      const past = new Date(
        now.getTime() -
          Math.floor(Math.random() * daysAgoMax * 24 * 60 * 60 * 1000),
      );
      return past;
    };

    for (let i = 0; i < 50; i++) {
      // Pick a customer (give Suman Das a good share so GET /api/orders has plenty of data)
      const customer =
        i % 3 === 0
          ? customerUsers[0]
          : customerUsers[i % customerUsers.length];

      // Each order has 2 to 4 distinct items
      const itemCount = 2 + Math.floor(Math.random() * 3); // 2, 3, or 4
      const shuffledProducts = [...products].sort(() => 0.5 - Math.random());
      const selectedProducts = shuffledProducts.slice(0, itemCount);

      let totalAmount = 0;
      const items = selectedProducts.map((prod) => {
        const quantity = 1 + Math.floor(Math.random() * 2); // 1 or 2
        totalAmount += prod.price * quantity;
        return {
          product: prod._id,
          quantity,
          price: prod.price,
        };
      });

      const status = statuses[i % statuses.length];
      const orderDate = getRandomPastDate(180);

      ordersData.push({
        user: customer._id,
        items,
        totalAmount,
        status,
        createdAt: orderDate,
        updatedAt: orderDate,
      });
    }

    await Order.insertMany(ordersData);

    const totalItemsCount = ordersData.reduce(
      (sum, o) => sum + o.items.length,
      0,
    );

    console.log("\n=================================");
    console.log("DATABASE SEEDING COMPLETE!");
    console.log("=================================");
    console.log(`Users seeded    : ${users.length}`);
    console.log(`Products seeded : ${products.length}`);
    console.log(`Orders seeded   : ${ordersData.length}`);
    console.log(`Order items     : ${totalItemsCount}`);
    console.log("=================================");
    console.log("Admin Login     : superadmin999@yopmail.com / Superadmin@999");
    console.log("Customer Login  : sumandas1995@yopmail.com / Test@1234");
    console.log("=================================\n");

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error("Seeding failed:", error);
    process.exit(1);
  }
};

seedDatabase();
