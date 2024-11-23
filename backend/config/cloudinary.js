const cloudinary = require("cloudinary").v2;

cloudinary.config({ 
    cloud_name: 'djszhmqap', 
    api_key: '431749398524594', 
    api_secret: 'cAovzvBtw6F8VrpcVSmAo150jJc',
});

module.exports = cloudinary;