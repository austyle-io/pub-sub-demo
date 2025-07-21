const testAuth = async () => {
  console.log('Testing auth endpoint...');
  
  try {
    const response = await fetch('http://localhost:3001/api/auth/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: `test${Date.now()}@example.com`,
        password: 'TestPassword123',
        role: 'editor'
      })
    });
    
    const text = await response.text();
    console.log('Status:', response.status);
    console.log('Response:', text);
    
    if (response.status === 500) {
      // Try to parse error details
      try {
        const error = JSON.parse(text);
        console.log('Error details:', error);
      } catch (e) {
        console.log('Raw error text:', text);
      }
    }
  } catch (error) {
    console.error('Fetch error:', error);
  }
};

testAuth();