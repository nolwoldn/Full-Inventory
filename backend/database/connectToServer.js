const mongoose = require("mongoose");

const connect = async () => {
    const mongoURI = process.env.mongoURI;

    if (!mongoURI) {
        throw new Error("Mongo uri isn't defined in the env");
    } 

    try {
        const connection = mongoURI.connect(mongoURI);

        console.log("Database connection succsessful")
    } catch (error) {
        console.log(`Error ${error}  happenned during connection attempt`)
        process.exit(1);
    }

};

export default connect;