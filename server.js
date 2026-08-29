import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";
import products from "./products.json" with { type: "json" };

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.get("/api/products", (req,res) => res.json(products));

app.post("/api/chat", async (req,res) => {
  const message = req.body.message || "";
  const catalog = products.map(p =>
    `${p.name} | ₹${p.price} | ${p.category} | ${p.stock ? "In stock" : "Out of stock"}`
  ).join("\n");

  try {
    const response = await client.responses.create({
      model: "gpt-5.6-luna",
      input: [
        {
          role: "system",
          content: `You are SalesBot AI, a helpful 24/7 e-commerce sales agent.
Your goal is to understand customer needs, recommend suitable products from the catalog,
answer clearly, and suggest complementary products when genuinely useful.
Never invent products, prices, discounts, stock, delivery times, or policies.
Catalog:
${catalog}`
        },
        { role: "user", content: message }
      ]
    });

    res.json({ reply: response.output_text });
  } catch (error) {
    console.error(error);
    res.status(500).json({ reply: "Sorry, the AI service is temporarily unavailable." });
  }
});

app.listen(process.env.PORT || 3000, () =>
  console.log(`SalesBot AI running on http://localhost:${process.env.PORT || 3000}`)
);