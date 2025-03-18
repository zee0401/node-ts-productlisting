import express from "express";
import cors from "cors";

const PORT = process.env.PORT || 3000;

const app = express();

app.use(cors());

app.use(express.json());

app.get("/", (req, res) => {
    res.send("Hello  from Express");
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
