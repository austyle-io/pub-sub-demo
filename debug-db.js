import { MongoClient } from 'mongodb';

async function debugDb() {
  const client = new MongoClient('mongodb://localhost:27017/collab_demo');
  
  try {
    await client.connect();
    const db = client.db();
    
    // Check ShareDB documents collection
    const docs = await db.collection('o_documents').find({}).toArray();
    console.log('Total documents:', docs.length);
    
    if (docs.length > 0) {
      console.log('\nFirst document structure:');
      console.log(JSON.stringify(docs[0], null, 2));
    }
    
    // Check if documents are being created correctly
    const latestDoc = await db.collection('o_documents').findOne({}, { sort: { '_m.mtime': -1 } });
    if (latestDoc) {
      console.log('\nLatest document:');
      console.log(JSON.stringify(latestDoc, null, 2));
    }
    
  } finally {
    await client.close();
  }
}

debugDb().catch(console.error);