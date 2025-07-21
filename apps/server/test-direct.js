// Direct test of the list documents API
const baseUrl = 'http://localhost:3001';

async function test() {
  // Create a new user
  const timestamp = Date.now();
  const email = `testuser${timestamp}@example.com`;
  
  console.log('1. Registering user:', email);
  const regRes = await fetch(`${baseUrl}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email,
      password: 'Secure123!',
      role: 'editor'
    })
  });
  
  if (!regRes.ok) {
    console.error('Registration failed:', await regRes.text());
    return;
  }
  
  const { accessToken, user } = await regRes.json();
  console.log('   ✓ Registered, userId:', user.id);
  
  // Create a document
  console.log('\n2. Creating document...');
  const createRes = await fetch(`${baseUrl}/documents`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`
    },
    body: JSON.stringify({
      title: 'Test Doc',
      content: 'Test content'
    })
  });
  
  if (!createRes.ok) {
    console.error('Create failed:', await createRes.text());
    return;
  }
  
  const doc = await createRes.json();
  console.log('   ✓ Created document:', doc.id);
  
  // List documents
  console.log('\n3. Listing documents...');
  const listRes = await fetch(`${baseUrl}/documents`, {
    headers: { 
      'Authorization': `Bearer ${accessToken}`
    }
  });
  
  console.log('   Status:', listRes.status);
  const listText = await listRes.text();
  console.log('   Response:', listText);
  
  try {
    const list = JSON.parse(listText);
    console.log('   Parsed count:', list.length);
    if (list.length > 0) {
      console.log('   First doc:', list[0]);
    }
  } catch (e) {
    console.error('   Failed to parse:', e.message);
  }
}

test().catch(console.error);