# Cafecito o Miedo - Menú Global

Este proyecto usa MongoDB con Netlify Functions para tener un historial de facturas **global** (compartido entre todos los usuarios).

## Setup Local

1. **Instalar dependencias:**
```bash
npm install
```

2. **Configurar variables de entorno:**
   - Copia `.env.example` a `.env.local`
   - Coloca tu connection string de MongoDB en `MONGODB_URI`

3. **Ejecutar localmente:**
```bash
netlify dev
```

## Deploy a Netlify

1. **Sube el proyecto a GitHub**
2. **En Netlify:**
   - Conecta el repositorio
   - En **Site settings → Build & deploy → Environment**
   - Agrega la variable `MONGODB_URI` con tu connection string
3. **Netlify automáticamente deployará las funciones**

## Estructura

```
cafecito_netlify/
  cafecito/
    index.html
    js/javascript.js
    css/styles.css
  netlify/
    functions/
      facturas.js        (API de MongoDB)
  .env.local             (Credenciales - NO subir a git)
  package.json
  netlify.toml
```

## Cómo funciona

- Cada factura se guarda en MongoDB
- Todos los usuarios ven el mismo historial global
- Se pueden eliminar facturas una por una
- Los datos persisten aunque cierres la página
