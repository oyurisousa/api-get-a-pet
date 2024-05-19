const express = require("express");
const cors = require("cors");
const conn = require("./db/conn");
const app = express();
const UserRoutes = require("./routes/UserRoutes");
const PetRoutes = require("./routes/PetsRoutes");
const env = require("./env");


app.use(express.json());

app.use(
  cors({
    origin: '*',
  })
);

app.use(express.static("public"));

//routes
app.use("/users", UserRoutes);
app.use("/pets", PetRoutes);
app.listen(5000);
