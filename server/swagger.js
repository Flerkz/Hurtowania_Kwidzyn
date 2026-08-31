const swaggerJsdoc = require('swagger-jsdoc');

const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'PakoDirect API',
      version: '1.0.0',
      description: 'API produktów PakoDirect. Dane trzymane obecnie w pamięci (server/db/products.js) — docelowo backend przez PostgreSQL.',
    },
    servers: [{ url: '/api' }],
    components: {
      securitySchemes: {
        bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      },
      schemas: {
        Product: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            category: { type: 'string', example: 'kubki' },
            name: { type: 'string', example: 'Kubki papierowe do kawy 250 ml (50 szt.)' },
            description: { type: 'string', example: 'Jednorazowe kubki papierowe z podwójną powłoką.' },
            price: { type: 'number', format: 'float', example: 24.9 },
            stock: { type: 'integer', example: 340, description: 'Ile sztuk zostało w magazynie' },
            image: { type: 'string', example: 'https://images.unsplash.com/photo-...' },
            badge: { type: 'string', enum: ['new', 'promo'] },
          },
        },
        Category: {
          type: 'object',
          properties: {
            slug: { type: 'string', example: 'kubki' },
            name: { type: 'string', example: 'Kubki i naczynia' },
          },
        },
      },
    },
  },
  apis: ['./routes/*.js'],
});

module.exports = swaggerSpec;
