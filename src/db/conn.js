require('dotenv').config();
const { MongoClient, ObjectId, ServerApiVersion } = require('mongodb'); // Importa ObjectId
const uri = `mongodb+srv://${process.env.MONGODB_USER}:${process.env.MONGODB_PASSWORD}@moodify.g75fs.mongodb.net/?retryWrites=true&w=majority&appName=moodify`;

const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

let dbConnection;

module.exports = {
    connectToDatabase: async () => {
        try {
            await client.connect();
            dbConnection = client.db('moodify');
            console.log("Successfully connected to database");
        } catch (e) {
            console.error(e);
            process.exit();
        }
    },

    getDb: function () {
        return dbConnection;
    },

    ObjectId, // Exporta ObjectId
};
