// Import required modules
const express = require('express'); // Express framework for building web servers
const mongoose = require('mongoose'); // MongoDB object modeling tool
const cors = require('cors'); // Middleware for enabling Cross-Origin Resource Sharing
const multer = require('multer'); // Middleware for handling file uploads
const path = require('path'); // Node.js module for handling file paths

const app = express(); // Initialize an Express application

// Middleware configuration
app.use(cors()); // Allow cross-origin requests from different domains
app.use(express.json()); // Parse incoming JSON payloads
app.use(express.static('public')); // Serve static files (e.g., images, CSS) from the 'public' directory

// MongoDB connection
mongoose.connect('mongodb+srv://vixit2016:5Q4cXNGyEWSlmPN9@cluster0.roggs.mongodb.net/Localevents', {
    useNewUrlParser: true, // Use the new URL string parser
    useUnifiedTopology: true // Use the new Server Discover and Monitoring engine
}).then(() => {
    console.log('Connected to MongoDB'); // Log success message
}).catch((err) => {
    console.error('MongoDB connection error:', err); // Log connection error
});

// Define the Event schema
const eventSchema = new mongoose.Schema({
    color: {
        primary: String, // Primary color for the event
        secondary: String // Secondary color for the event
    },
    name: String, // Name of the event
    description: String, // Description of the event
    date: String, // Date of the event
    familyFriendly: Boolean, // Whether the event is family-friendly
    contactInfo: String, // Contact information for the event
    location: String, // Location of the event
    price: String, // Price of the event (as a string)
    eventPhoto: String, // URL of the uploaded event photo
    eventCost: Number, // Cost of the event (as a number)
    createdAt: { type: Date, default: Date.now } // Auto-generated timestamp for event creation
});

// Create a Mongoose model for events
const Event = mongoose.model('Event', eventSchema);

// Configure file upload with Multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/uploads/'); // Set upload destination folder
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Set file name to current timestamp + original extension
    }
});

const upload = multer({ storage: storage }); // Initialize Multer with the configured storage

// Routes

// Route to handle file uploads
app.post('/api/upload', upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' }); // Handle case where no file is uploaded
    }
    res.json({ filePath: `/uploads/${req.file.filename}` }); // Return the file path of the uploaded file
});

// Route to fetch all events
app.get('/api/events', async (req, res) => {
    try {
        const events = await Event.find().sort({ createdAt: -1 }); // Fetch events sorted by creation date (newest first)
        res.json(events); // Send the events as a JSON response
    } catch (error) {
        res.status(500).json({ message: error.message }); // Handle server errors
    }
});

// Route to fetch a single event by ID
app.get('/api/events/:id', async (req, res) => {
    try {
        const event = await Event.findById(req.params.id); // Find the event by its ID
        if (!event) {
            return res.status(404).json({ message: 'Event not found' }); // Handle case where event does not exist
        }
        res.json(event); // Send the event as a JSON response
    } catch (error) {
        res.status(500).json({ message: error.message }); // Handle server errors
    }
});

// Route to create a new event
app.post('/api/events', async (req, res) => {
    const event = new Event({
        color: req.body.color,
        name: req.body.name,
        description: req.body.description,
        date: req.body.date,
        familyFriendly: req.body.familyFriendly,
        contactInfo: req.body.contactInfo,
        location: req.body.location,
        price: req.body.price,
        eventPhoto: req.body.eventPhoto, // URL of the uploaded photo
        eventCost: req.body.eventCost
    });

    try {
        const newEvent = await event.save(); // Save the event to the database
        res.status(201).json(newEvent); // Send the created event as a JSON response
    } catch (error) {
        res.status(400).json({ message: error.message }); // Handle validation or request errors
    }
});

// Route to update an existing event by ID
app.put('/api/events/:id', async (req, res) => {
    try {
        const event = await Event.findById(req.params.id); // Find the event by its ID
        if (!event) {
            return res.status(404).json({ message: 'Event not found' }); // Handle case where event does not exist
        }

        Object.assign(event, req.body); // Update the event with new data
        const updatedEvent = await event.save(); // Save the updated event to the database
        res.json(updatedEvent); // Send the updated event as a JSON response
    } catch (error) {
        res.status(400).json({ message: error.message }); // Handle validation or request errors
    }
});

// Route to delete an event by ID
app.delete('/api/events/:id', async (req, res) => {
    try {
        const event = await Event.findById(req.params.id); // Find the event by its ID
        if (!event) {
            return res.status(404).json({ message: 'Event not found' }); // Handle case where event does not exist
        }
        await Event.deleteOne({ _id: req.params.id }); // Delete the event
        res.json({ message: 'Event deleted' }); // Send a success message
    } catch (error) {
        res.status(500).json({ message: error.message }); // Handle server errors
    }
});

// Start the server
const PORT = process.env.PORT || 8000; // Use environment PORT or default to 8000
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`); // Log server start message
});
