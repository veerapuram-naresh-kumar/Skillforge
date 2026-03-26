
const axios = require('axios');

async function testFullFlow() {
    console.log("Testing Full Registration & Login Flow...");
    const uniqueId = Date.now();
    const testUser = {
        name: "Test User",
        email: `test${uniqueId}@example.com`,
        password: "password123"
    };

    try {
        // Register
        console.log("1. Registering...");
        const regResponse = await axios.post('http://localhost:5000/api/auth/register', testUser);
        console.log("   Registration Success. ID:", regResponse.data._id);

        // Login
        console.log("2. Logging in...");
        const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
            email: testUser.email,
            password: testUser.password
        });
        console.log("   Login Success. Token received:", !!loginResponse.data.token);

    } catch (error) {
        console.error("Test Failed:", error.response ? error.response.data : error.message);
    }
}

testFullFlow();
