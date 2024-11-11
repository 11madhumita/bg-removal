import axios from "axios";
import fs from 'fs';
import FormData from 'form-data';
import userModel from "../models/userModel.js";

const removeBgImage = async (req, res) => {
    try {
        const { clerkId } = req.body;

        // Find the user
        const user = await userModel.findOne({ clerkId });
        if (!user) {
            return res.status(404).json({ success: false, message: 'User Not Found' });
        }

        // Ensure the user has enough credits
        if (user.creditBalance === 0) {
            return res.status(400).json({ success: false, message: 'No Credit Balance', creditBalance: user.creditBalance });
        }

        const imagePath = req.file.path;

        // Read the image file
        const imageFile = fs.createReadStream(imagePath);
        const formdata = new FormData();
        formdata.append('image_file', imageFile);

        // Send request to ClipDrop API
        const { data } = await axios.post('https://clipdrop-api.co/remove-background/v1', formdata, {
            headers: {
                'x-api-key': process.env.CLIPDROP_API,
                ...formdata.getHeaders()
            },
            responseType: 'arraybuffer'
        });

        // Convert the response to base64
        const base64Image = Buffer.from(data, 'binary').toString('base64');
        const resultImage = `data:${req.file.mimetype};base64,${base64Image}`;

        // Deduct 1 credit from the user's balance and save
        const newCreditBalance = user.creditBalance - 1;
        await userModel.findByIdAndUpdate(user._id, { creditBalance: newCreditBalance });

        // Optionally delete the uploaded file after processing (free up space)
        fs.unlink(imagePath, (err) => {
            if (err) console.error(`Failed to delete image file: ${err}`);
        });

        // Send the response back to the client
        res.status(200).json({ success: true, resultImage, creditBalance: newCreditBalance, message: 'Background Removed' });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};

export { removeBgImage };
