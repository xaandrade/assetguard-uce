import app from "./app";

const PORT = 3001;

app.listen(PORT, () => {
  console.log(`Inventory service listening on port ${PORT}`);
});
