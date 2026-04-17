const { MongoClient, ObjectId } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = 'cafecito';
const COLLECTION_NAME = 'facturas';

let cachedClient = null;

async function connectToDatabase() {
  if (cachedClient) {
    return cachedClient;
  }

  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  cachedClient = client;
  return client;
}

async function getFacturas() {
  const client = await connectToDatabase();
  const db = client.db(DB_NAME);
  const facturas = await db.collection(COLLECTION_NAME).find({}).toArray();
  return facturas;
}

async function saveFactura(invoice) {
  const client = await connectToDatabase();
  const db = client.db(DB_NAME);
  const result = await db.collection(COLLECTION_NAME).insertOne(invoice);
  return { ...invoice, id: result.insertedId };
}

async function deleteFactura(id) {
  const client = await connectToDatabase();
  const db = client.db(DB_NAME);
  const result = await db.collection(COLLECTION_NAME).deleteOne({ _id: new ObjectId(id) });
  return result.deletedCount > 0;
}

exports.handler = async (event) => {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  };

  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  try {
    const { action, invoice, id } = JSON.parse(event.body || '{}');

    if (event.httpMethod === 'GET' || action === 'get') {
      const facturas = await getFacturas();
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(facturas)
      };
    }

    if (event.httpMethod === 'POST' || action === 'save') {
      const result = await saveFactura(invoice);
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(result)
      };
    }

    if (event.httpMethod === 'DELETE' || action === 'delete') {
      const success = await deleteFactura(id);
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success })
      };
    }

    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: 'Acción no válida' })
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message })
    };
  }
};
