const express = require('express');
const path = require('path');
const swaggerUi = require('swagger-ui-express');
const productsRouter = require('./routes/products');
const swaggerSpec = require('./swagger');

const app = express();
const PORT = process.env.PORT || 8123;

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use('/api', productsRouter);
app.use(express.static(path.join(__dirname, '..')));

app.listen(PORT, () => {
  console.log(`PakoDirect działa na http://localhost:${PORT}`);
  console.log(`Dokumentacja API (Swagger): http://localhost:${PORT}/api-docs`);
});
