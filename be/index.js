import express from "express";
import cors from "cors";
const app = express();
const port = process.env.PORT || 8000;
import "dotenv/config";
import postRoute from "./route/postRoute.js";
import authRoute from "./route/authRoute.js";
import userRoute from "./route/userRoute.js";
import customerRoute from "./route/customerRoute.js";
import productRoute from "./route/productRoute.js";
import subscriptionRoute from "./route/subscriptionRoute.js";
import packageRoute from "./route/packageRoute.js";

app.use(express.json());

app.use(
  cors({
    origin: "*",
    allowedHeaders: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  })
);

app.use("/post", postRoute);
app.use("/", authRoute);
app.use("/", userRoute);
app.use("/customer", customerRoute);
app.use("/product", productRoute);
app.use("/subscription", subscriptionRoute);
app.use("/package", packageRoute);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
