const express = require('express');
const path = require('path');
const swaggerUi = require('swagger-ui-express');
const productsRouter = require('./routes/products');
const ordersRouter = require('./routes/orders');
const swaggerSpec = require('./swagger');

const app = express();
const PORT = process.env.PORT || 8123;

app.use(express.json());
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use('/api', productsRouter);
app.use('/api', ordersRouter);
app.use(express.static(path.join(__dirname, '..')));

app.listen(PORT, () => {
  console.log(`PakoDirect działa na http://localhost:${PORT}`);
  console.log(`Dokumentacja API (Swagger): http://localhost:${PORT}/api-docs`);
});
