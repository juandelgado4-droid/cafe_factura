

const { MongoClient, ObjectId } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = 'cafecito';
const COLLECTION_NAME = 'facturas';

let cachedClient = null;

async function connectToDatabase() {
  if (cachedClient) return cachedClient;
  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  cachedClient = client;
  return client;
}

async function getFacturas() {
  const client = await connectToDatabase();
  return await client.db(DB_NAME).collection(COLLECTION_NAME).find({}).toArray();
}

async function saveFactura(invoice) {
  const client = await connectToDatabase();
  const result = await client.db(DB_NAME).collection(COLLECTION_NAME).insertOne(invoice);
  return { ...invoice, id: result.insertedId };
}

async function deleteFactura(id) {
  const client = await connectToDatabase();
  const result = await client.db(DB_NAME).collection(COLLECTION_NAME).deleteOne({ _id: new ObjectId(String(id)) });
  return result.deletedCount > 0;
}

async function updateFacturaPago(id, metodoPago) {
  const client = await connectToDatabase();
  let objectId;
  try { objectId = new ObjectId(String(id)); } catch(e) { return false; }
  const result = await client.db(DB_NAME).collection(COLLECTION_NAME).updateOne(
    { _id: objectId },
    { $set: { metodoPago } }
  );
  return result.modifiedCount > 0;
}

// ─── Vercel handler ───────────────────────────
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    if (req.method === 'GET') {
      const facturas = await getFacturas();
      return res.status(200).json(facturas);
    }

    if (req.method === 'POST') {
      const { action, invoice, id, metodoPago } = req.body;

      if (action === 'save') {
        const result = await saveFactura(invoice);
        return res.status(200).json(result);
      }
      if (action === 'updatePago') {
        const success = await updateFacturaPago(id, metodoPago);
        return res.status(200).json({ success });
      }
    }

    if (req.method === 'DELETE') {
      const { id } = req.body;
      const success = await deleteFactura(id);
      return res.status(200).json({ success });
    }

    return res.status(400).json({ error: 'Acción no válida' });
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: error.message });
  }
}







