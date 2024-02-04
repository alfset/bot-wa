const express = require('express');
const { Client } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const axios = require('axios');
const cron = require('node-cron');

const app = express();
app.use(express.json());

const client = new Client();

client.on('qr', qr => {
    qrcode.generate(qr, {small: true});
});

client.on('ready', () => {
    console.log('Client is ready!');
});

client.initialize();

const websitesToCheck = [
    '{website to check},
     '{website to check}
    // Add more websites as needed
];

const whatsappNumber = 'whatsapp:{Number to sennd}'; // Include country code

async function checkWebsiteStatusAndNotify() {
    for (const websiteUrl of websitesToCheck) {
        try {
            await axios.get(websiteUrl);
            console.log(`${websiteUrl} is up.`);
        } catch (error) {
            let message = `${websiteUrl} is down!`;
            if (error.response) {
                message += ` Status code: ${error.response.status}.`;
            } else if (error.request) {
                message += ' No response was received.';
            } else {
                message += ` Error: ${error.message}`;
            }
            console.error(message);
            await client.sendMessage(whatsappNumber, message);
        }
    }
}

cron.schedule('*/1 * * * *', () => {
    console.log('Running scheduled website status check');
    checkWebsiteStatusAndNotify();
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
