const express = require('express');
const path = require('path');
const productsRouter = require('./routes/products');

const app = express();
const PORT = process.env.PORT || 8123;

app.use('/api', productsRouter);
app.use(express.static(path.join(__dirname, '..')));

app.listen(PORT, () => {
  console.log(`PakoDirect działa na http://localhost:${PORT}`);
});
