// server.js
const express = require('express');
const request = require('request');
const cheerio = require('cheerio');
const app = express();
const port = 3000;

// Middleware to serve static files
app.use(express.static('public'));

app.get('/proxy', (req, res) => {
    const targetUrl = req.query.url;

    if (!targetUrl) {
        return res.status(400).send('No URL provided');
    }

    request(targetUrl, (error, response, body) => {
        if (error) {
            return res.status(500).send('Error retrieving the URL');
        }

        // Parse the HTML with Cheerio
        const $ = cheerio.load(body);

        // Modify all relative URLs
        $('a, img, script, link').each(function() {
            const attr = $(this).attr('href') || $(this).attr('src');
            if (attr && !attr.startsWith('http')) {
                const fullUrl = new URL(attr, targetUrl).href;
                if ($(this).attr('href')) $(this).attr('href', fullUrl);
                if ($(this).attr('src')) $(this).attr('src', fullUrl);
            }
        });

        res.send($.html());
    });
});

app.listen(port, () => {
    console.log(`Proxy server listening at http://localhost:${port}`);
});
