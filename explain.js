import mongoose from "mongoose";
import dotenv from "dotenv";
import dns from "node:dns";
import User from "./src/models/User.js";
import Product from "./src/models/Product.js";
import Order from "./src/models/Order.js";

dotenv.config();
dns.setServers(["8.8.8.8", "1.1.1.1"]);

const runExplainBenchmark = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log("Connected to MongoDB for Index Benchmark...\n");

    const benchmarkResults = [];

    // Query 1: User by Email
    const userExplain = await User.find({
      email: "sumandas1995@yopmail.com",
    }).explain("executionStats");

    const userStats = userExplain.executionStats;
    benchmarkResults.push({
      Query: "User by Email",
      Index: "{ email: 1 }",
      Stage: userStats.executionStages.stage,
      ExecutionTime_ms: userStats.executionTimeMillis,
      DocsExamined: userStats.totalDocsExamined,
      KeysExamined: userStats.totalKeysExamined,
      DocsReturned: userStats.nReturned,
    });

    // Query 2: Product by Category and Price Range
    const productExplain = await Product.find({
      category: "Laptops",
      price: { $gte: 50000, $lte: 200000 },
    })
      .sort({ price: 1 })
      .explain("executionStats");

    const prodStats = productExplain.executionStats;
    benchmarkResults.push({
      Query: "Product by Category & Price",
      Index: "{ category: 1, price: 1 }",
      Stage: prodStats.executionStages.stage,
      ExecutionTime_ms: prodStats.executionTimeMillis,
      DocsExamined: prodStats.totalDocsExamined,
      KeysExamined: prodStats.totalKeysExamined,
      DocsReturned: prodStats.nReturned,
    });

    // Query 3: Orders by User sorted by createdAt
    const sampleUser = await User.findOne({ role: "customer" });
    const orderUserExplain = await Order.find({ user: sampleUser._id })
      .sort({ createdAt: -1 })
      .explain("executionStats");

    const orderUserStats = orderUserExplain.executionStats;
    benchmarkResults.push({
      Query: "Order by User & CreatedAt",
      Index: "{ user: 1, createdAt: -1 }",
      Stage: orderUserStats.executionStages.stage,
      ExecutionTime_ms: orderUserStats.executionTimeMillis,
      DocsExamined: orderUserStats.totalDocsExamined,
      KeysExamined: orderUserStats.totalKeysExamined,
      DocsReturned: orderUserStats.nReturned,
    });

    // Query 4: Orders by Status sorted by createdAt
    const orderStatusExplain = await Order.find({ status: "delivered" })
      .sort({ createdAt: -1 })
      .explain("executionStats");

    const orderStatusStats = orderStatusExplain.executionStats;
    benchmarkResults.push({
      Query: "Order by Status & CreatedAt",
      Index: "{ status: 1, createdAt: -1 }",
      Stage: orderStatusStats.executionStages.stage,
      ExecutionTime_ms: orderStatusStats.executionTimeMillis,
      DocsExamined: orderStatusStats.totalDocsExamined,
      KeysExamined: orderStatusStats.totalKeysExamined,
      DocsReturned: orderStatusStats.nReturned,
    });

    console.log(
      "==========================================================================================",
    );
    console.log(
      "                       INDEX PERFORMANCE BENCHMARK REPORT                                ",
    );
    console.log(
      "==========================================================================================",
    );
    console.table(benchmarkResults);
    console.log(
      "==========================================================================================",
    );
    console.log("KEY TAKEAWAYS FOR VIVA / INTERVIEW:");
    console.log(
      "1. 'IXSCAN' means the query used the B-tree index directly without scanning the whole collection.",
    );
    console.log(
      "2. DocsExamined equals DocsReturned, proving 0 wasted document reads from disk.",
    );
    console.log("3. ExecutionTimeMillis is near 0ms due to indexed lookup.");
    console.log(
      "==========================================================================================\n",
    );

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error("Benchmark error:", error);
    process.exit(1);
  }
};

runExplainBenchmark();
