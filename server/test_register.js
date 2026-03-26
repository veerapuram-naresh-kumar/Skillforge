
const axios = require('axios');

async function testRegister() {
    console.log("Testing Registration...");
    const testUser = {
        name: "Test User",
        email: `test${Date.now()}@example.com`,
        password: "password123"
    };

    try {
        const response = await axios.post('http://localhost:5000/api/auth/register', testUser);
        console.log("Registration Success:", response.data);
    } catch (error) {
        console.error("Registration Failed:", error.response ? error.response.data : error.message);
    }
}

testRegister();
