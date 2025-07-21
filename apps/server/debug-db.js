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

    // Get all unique user IDs
    const allUsers = new Set();
    docs.forEach((doc) => {
      if (doc.create?.data?.acl?.owner) {
        allUsers.add(doc.create.data.acl.owner);
      }
    });
    console.log('\nUnique user IDs in database:', Array.from(allUsers));

    // Check specific test user's documents
    const testUserId = Array.from(allUsers)[0] || 'no-users';
    const query = {
      $or: [
        { 'create.data.acl.owner': testUserId },
        { 'create.data.acl.editors': testUserId },
        { 'create.data.acl.viewers': testUserId },
      ],
    };

    const userDocs = await db
      .collection('o_documents')
      .find(query)
      .project({
        _id: 0,
        'create.data.id': 1,
        'create.data.title': 1,
        'create.data.createdAt': 1,
        'create.data.updatedAt': 1,
        'create.data.acl.owner': 1,
      })
      .toArray();

    console.log('\nDocuments for test user:', testUserId);
    console.log('Found:', userDocs.length);
    if (userDocs.length > 0) {
      console.log('User documents:', JSON.stringify(userDocs, null, 2));
    }
  } finally {
    await client.close();
  }
}

debugDb().catch(console.error);
