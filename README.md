# catalog-backend

Backend Node.js + TypeScript + Express + Sequelize + MySQL.

## Instalar

```bash
npm install
```

## Configuracion

Copia `.env.example` a `.env` y completa:

- PORT
- DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD
- JWT_SECRET
- AWS_REGION, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_BUCKET_NAME

Opcional:
- DB_SYNC=true para crear tablas automaticamente en dev.

## Correr en desarrollo

```bash
npm run dev
```

## Build y start

```bash
npm run build
npm start
```

## Seed (datos de prueba)

```bash
npm run seed
```

Usuario admin de seed:

```
email: admin@catalogo.com
password: admin123
```

## Healthcheck

```bash
curl http://localhost:3000/api/health
curl http://localhost:3000/api/health/db
```

## Auth (JWT)

- POST /api/auth/register
- POST /api/auth/login
- GET /api/auth/me (requiere Bearer token)

Payload register/login:

```json
{
  "email": "test@mail.com",
  "password": "secret123"
}
```

## Catalogos

Todos los endpoints requieren auth.

- POST /api/catalogos
- GET /api/catalogos?page&limit
- GET /api/catalogos/:id
- PUT /api/catalogos/:id
- DELETE /api/catalogos/:id

Ejemplo create:

```json
{
  "title": "Mi catalogo",
  "description": "Demo",
  "logoUrl": null,
  "price": "10.00",
  "backgroundColor": "#FFFFFF",
  "isPublished": false
}
```

## Imagenes de catalogo (S3)

- POST /api/catalogos/:id/images
- GET /api/catalogos/:id/images
- PUT /api/catalogos/:id/images/:imageId
- DELETE /api/catalogos/:id/images/:imageId

Upload (multipart/form-data):
- Campo `images` (1 a 10 archivos)
- Campo opcional `folder` (por defecto `catalogos`)

## Postman

Hay una coleccion en `postman_collection.json` para probar los endpoints.
