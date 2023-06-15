const express = require('express');
const multer = require('multer');
const AWS = require('aws-sdk');
const app = express();
const port = process.env.PORT || 3000;
const awsRegion = process.env.REGION || 'ap-south-1';

AWS.config.update({ region: awsRegion });

const s3 = new AWS.S3({ apiVersion: '2006-03-01', region: awsRegion });

const upload = multer({
    limits: { fileSize: 50 * 1024 * 1024 }, // Limit file size to 50MB
});

// home 
app.get('/', (req, res) => {
    res.send('Welcome to home!');
});

// POST /upload endpoint to handle file upload
// images: is the name of input file type. 
// Eg.: <input type="file" name="images" />
app.post('/upload', upload.single('images'), (req, res) => {
    const file = req.file;

    if (!file) {
        return res.status(400).send('No file uploaded.');
    }

    const params = {
        Bucket: 'my-bucket-name',
        Key: file.originalname,
        Body: file.buffer,
    };

    s3.upload(params, (err, data) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Failed to upload the file.');
        }

        const imagePath = data.Location; // The S3 object URL

        // Return the image path, you can use this path to store any db
        res.send(`Image uploaded successfully. Path: ${imagePath}`);
    });

});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
