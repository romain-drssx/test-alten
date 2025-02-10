const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");

const app = express();
const PORT = 3000;
const DATA_FILE = "products.json";

app.use(bodyParser.json());
app.use(require("cors")());


// PART 1 //
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




// PART 2 //
const bcrypt = require("bcryptjs");
const jwt = require('jsonwebtoken');

const users = []; 
const SECRET_KEY = "ton_secret_key";

function authenticateToken(req, res, next) {
    const token = req.header("Authorization");
    if (!token) return res.status(401).json({ message: "Accès interdit" });

    jwt.verify(token.split(" ")[1], SECRET_KEY, (err, user) => {
        if (err) return res.status(403).json({ message: "Token invalide" });
        req.user = user;
        next();
    });
}

function isAdmin(req, res, next) {
    if (req.user.email !== "admin@admin.com") {
        return res.status(403).json({ message: "Accès réservé à l'administrateur" });
    }
    next();
}

app.post("/account", async (req, res) => {
  const { username, firstname, email, password } = req.body;
  
  if (!username || !firstname || !email || !password) {
      return res.status(400).json({ message: "Tous les champs sont obligatoires" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = { username, firstname, email, password: hashedPassword };
  
  users.push(newUser);
  res.status(201).json({ message: "Compte créé avec succès" });
});

app.post("/token", async (req, res) => {
  const { email, password } = req.body;
  const user = users.find(u => u.email === email);

  if (!user) {
      return res.status(400).json({ message: "Utilisateur non trouvé" });
  }

  const validPassword = await bcrypt.compare(password, user.password);
  if (!validPassword) {
      return res.status(401).json({ message: "Mot de passe incorrect" });
  }

  const token = jwt.sign({ email: user.email }, SECRET_KEY, { expiresIn: "1h" });
  res.json({ token });
});

app.post("/products", authenticateToken, isAdmin, (req, res) => {
  const product = { id: products.length + 1, ...req.body };
  products.push(product);
  res.status(201).json(product);
});

app.put("/products/:id", authenticateToken, isAdmin, (req, res) => {
  const product = products.find(p => p.id == req.params.id);
  if (!product) return res.status(404).json({ message: "Produit non trouvé" });

  Object.assign(product, req.body);
  res.json(product);
});

app.delete("/products/:id", authenticateToken, isAdmin, (req, res) => {
  const index = products.findIndex(p => p.id == req.params.id);
  if (index === -1) return res.status(404).json({ message: "Produit non trouvé" });

  products.splice(index, 1);
  res.json({ message: "Produit supprimé" });
});



// la possibilité pour un utilisateur de gérer un panier d'achat pouvant contenir des produits
app.post("/cart", authenticateToken, (req, res) => {
  const userCart = carts[req.user.email] || [];
  userCart.push(req.body);
  carts[req.user.email] = userCart;
  res.json({ message: "Produit ajouté au panier", cart: userCart });
});
app.get("/cart", authenticateToken, (req, res) => {
  res.json(carts[req.user.email] || []);
});


//  la possibilité pour un utilisateur de gérer une liste d'envie pouvant contenir des produits.
app.post("/wishlist", authenticateToken, (req, res) => {
  const userWishlist = wishlists[req.user.email] || [];
  userWishlist.push(req.body);
  wishlists[req.user.email] = userWishlist;
  res.json({ message: "Produit ajouté à la liste d'envie", wishlist: userWishlist });
});

app.get("/wishlist", authenticateToken, (req, res) => {
  res.json(wishlists[req.user.email] || []);
});