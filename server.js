require('dotenv').config();
const app = require('./src/app');
const { testConnection } = require('./src/config/db');

const PORT = process.env.PORT || 3000;

const startServer = async () => {
    try {
        // Verify MySQL connection before starting the server
        await testConnection();

        app.listen(PORT, () => {
            console.log(`Server is running on http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error('Failed to start server. Please check your database configuration.');
        process.exit(1);
    }
};

startServer();
