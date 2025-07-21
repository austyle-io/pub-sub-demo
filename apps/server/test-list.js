// Use native fetch

async function testList() {
  // First login to get token
  const loginRes = await fetch('http://localhost:3001/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'testuser1753072350240@example.com',
      password: 'Secure123!'
    })
  });
  
  if (!loginRes.ok) {
    console.error('Login failed:', await loginRes.text());
    return;
  }
  
  const { accessToken } = await loginRes.json();
  console.log('Got token, listing documents...');
  
  // List documents
  const listRes = await fetch('http://localhost:3001/api/documents', {
    headers: { 
      'Authorization': `Bearer ${accessToken}`
    }
  });
  
  console.log('List response status:', listRes.status);
  const result = await listRes.text();
  console.log('List response:', result);
  
  try {
    const parsed = JSON.parse(result);
    console.log('Parsed:', parsed);
  } catch (e) {
    console.log('Not JSON');
  }
}

testList().catch(console.error);