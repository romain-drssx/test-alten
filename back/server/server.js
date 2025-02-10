const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");

const app = express();
const PORT = 3000;
const DATA_FILE = "products.json";

app.use(bodyParser.json());
app.use(require("cors")());

const loadProducts = () => {
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
  } catch (err) {
    return [];
  }
};

const saveProducts = (products) => {
  fs.writeFileSync(DATA_FILE, JSON.stringify(products, null, 2));
};


// TO TEST //
//    Linux/macOS : 
// curl -X GET http://localhost:3000/products 
//    Windows : 
// Invoke-RestMethod -Uri "http://localhost:3000/products" -Method Get
app.get("/products", (req, res) => {
  res.json(loadProducts());
});

// TO TEST //
//    Linux/macOS : 
// curl -X POST http://localhost:3000/products -H "Content-Type: application/json" -d '{
//   "code": "P123",
//   "name": "Ordinateur",
//   "description": "PC portable",
//   "image": "lien.png",
//   "category": "Électronique",
//   "price": 1500,
//   "quantity": 5,
//   "internalReference": "REF123",
//   "shellId": 1,
//   "inventoryStatus": "INSTOCK",
//   "rating": 4.5
// }'
//    Windows : 
// $body = @{
//   code = "P123"
//   name = "Ordinateur"
//   description = "PC portable"
//   image = "lien.png"
//   category = "Electronique"
//   price = 1500
//   quantity = 5
//   internalReference = "REF123"
//   shellId = 1
//   inventoryStatus = "INSTOCK"
//   rating = 4.5
// } | ConvertTo-Json -Depth 10
// Invoke-RestMethod -Uri "http://localhost:3000/products" -Method Post -ContentType "application/json" -Body $body
app.post("/products", (req, res) => {
  const products = loadProducts();
  const newProduct = { id: Date.now(), ...req.body, createdAt: Date.now(), updatedAt: Date.now() };
  
  products.push(newProduct);
  saveProducts(products);

  res.status(201).json(newProduct);
});

// TO TEST //
//    Linux/macOS : 
// curl -X GET http://localhost:3000/products/:id
//    Windows : 
// Invoke-RestMethod -Uri "http://localhost:3000/products/:id" -Method Get
app.get("/products/:id", (req, res) => {
  const products = loadProducts();
  const product = products.find((p) => p.id == req.params.id);

  if (!product) return res.status(404).json({ message: "Produit non trouvé" });
  res.json(product);
});

// TO TEST //
//    Linux/macOS : 
// curl -X PUT http://localhost:3000/products/:id -H "Content-Type: application/json" -d '{
//   "price": 1400,
//   "quantity": 3
// }'
//    Windows : 
// $body = @{
//   price = 1400
//   quantity = 3
// } | ConvertTo-Json -Depth 10
// Invoke-RestMethod -Uri "http://localhost:3000/products/:id" `
//                 -Method Put `
//                 -ContentType "application/json" `
//                 -Body $body
app.put("/products/:id", (req, res) => {
  const products = loadProducts();
  const index = products.findIndex((p) => p.id == req.params.id);

  if (index === -1) return res.status(404).json({ message: "Produit non trouvé" });

  products[index] = { ...products[index], ...req.body, updatedAt: Date.now() };
  saveProducts(products);

  res.json(products[index]);
});

// TO TEST //
//    Linux/macOS : 
// curl -X DELETE http://localhost:3000/products/:id
//    Windows : 
// Invoke-RestMethod -Uri "http://localhost:3000/products/:id" -Method Delete
app.delete("/products/:id", (req, res) => {
  let products = loadProducts();
  const filteredProducts = products.filter((p) => p.id != req.params.id);

  if (products.length === filteredProducts.length) return res.status(404).json({ message: "Produit non trouvé" });

  saveProducts(filteredProducts);
  res.status(204).send();
});

app.listen(PORT, () => console.log(`Serveur démarré sur http://localhost:${PORT}`));
