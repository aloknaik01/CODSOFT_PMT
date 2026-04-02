import app from "./src/app.js";
import { config } from "dotenv";

config();

const port = process.env.PORT;
app.listen(port, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${port}`)
})