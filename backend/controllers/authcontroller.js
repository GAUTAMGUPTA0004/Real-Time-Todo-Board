const User = require('../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Controller for user registration.
exports.register = async (req, res) => {
    // Destructure username and password from the request body.
    const { username, password } = req.body;
    try {
        // Hash the password for security before storing it.
        // The '10' is the salt round, a measure of how computationally expensive the hash is.
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create a new user instance with the username and hashed password.
        const newUser = new User({ username, password: hashedPassword });
        
        // Save the new user to the database.
        await newUser.save();
        
        // Send a success response.
        res.status(201).send("User registered successfully");
    } catch (error) {
        // Handle potential errors, such as a duplicate username.
        res.status(500).json({ message: "Error registering user", error });
    }
};

// Controller for user login.
exports.login = async (req, res) => {
    // Destructure username and password from the request body.
    const { username, password } = req.body;
    try {
        // Find a user in the database with the provided username.
        const user = await User.findOne({ username });
        if (!user) {
            // If no user is found, send a 404 Not Found response.
            return res.status(404).send("User not found");
        }

        // Compare the provided password with the hashed password stored in the database.
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            // If passwords don't match, send a 400 Bad Request response.
            return res.status(400).send("Invalid credentials");
        }

        // If credentials are correct, create a JSON Web Token (JWT).
        // The token payload contains the user's ID.
        // It's signed with a secret key from environment variables and expires in 1 hour.
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        
        // Send the token and some user info back to the client.
        res.json({ token, userId: user._id, username: user.username });
    } catch (error) {
        res.status(500).json({ message: "Error logging in", error });
    }
};