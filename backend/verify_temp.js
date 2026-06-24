// using native fetch

async function testRegister() {
    try {
        console.log("Attempting registration...");
        const response = await fetch('http://localhost:3000/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: "Test User",
                email: "test" + Date.now() + "@example.com",
                password: "password123"
            })
        });
        
        const data = await response.json();
        console.log("Status:", response.status);
        console.log("Response:", data);
        
        if (response.status === 201) {
            console.log("SUCCESS: Registration worked!");
        } else {
            console.log("FAILURE: Registration failed.");
        }
    } catch (e) {
        console.error("ERROR:", e.message);
    }
}

testRegister();
