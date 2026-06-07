js
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();

app.use(cors());

// Exact headers you found in DevTools
const COMMON_HEADERS = {
    'accept': 'application/json, text/plain, */*',
    'accept-language': 'en-US,en;q=0.9,bn;q=0.8',
    'origin': 'https://hgnice.club',
    'referer': 'https://hgnice.club/',
    'user-agent': 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Mobile Safari/537.36',
    'sec-ch-ua': '"Chromium";v="148", "Google Chrome";v="148", "Not/A)Brand";v="99"',
    'sec-ch-ua-mobile': '?1',
    'sec-ch-ua-platform': '"Android"'
};

app.get('/api/wingo', async (req, res) => {
    try {
        // Updated URL for 30s Wingo
        const historyUrl = `https://draw.ar-lottery01.com/WinGo/WinGo_30S/GetHistoryIssuePage.json?ts=${Date.now()}`;

        const response = await axios.get(historyUrl, { 
            headers: COMMON_HEADERS,
            responseType: 'arraybuffer' // FIX: Handles the 'application/octet-stream' binary format
        });

        // Convert binary to JSON
        const jsonString = Buffer.from(response.data).toString('utf-8');
        const root = JSON.parse(jsonString);

        // Based on your hex dump: root -> data -> list
        const rawList = root.data.list;

        const formattedHistory = rawList.map(item => ({
            period: item.issue, // Matches "issue" from your hex dump
            number: parseInt(item.number || item.result || 0),
            result: (item.number || item.result) >= 5 ? 'BIG' : 'SMALL'
        }));

        res.json({
            success: true,
            history: formattedHistory,
            balance: 0 
        });

        console.log(`✅ Successfully fetched ${formattedHistory.length} records.`);
    } catch (error) {
        console.error("❌ Proxy Error:", error.message);
        res.status(500).json({ success: false, error: error.message });
    }
});

const PORT = 3001;
app.listen(PORT, () => {
    console.log(`🚀 Proxy running at http://localhost:${PORT}/api/wingo`);
    console.log(`📂 Working in folder: wingo-proxy`);
});
