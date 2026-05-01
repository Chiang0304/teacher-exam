const https = require('https');

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') { res.status(200).end(); return; }

    const { prompt, system, apiKey } = req.body;
    const body = JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        max_tokens: 2048,
        messages: [
            ...(system ? [{ role: 'system', content: system }] : []),
            { role: 'user', content: prompt }
        ]
    });

    return new Promise((resolve) => {
        const r = https.request({
            hostname: 'api.groq.com',
            path: '/openai/v1/chat/completions',
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` }
        }, p => {
            let d = '';
            p.on('data', c => d += c);
            p.on('end', () => {
                const j = JSON.parse(d);
                res.status(200).json({ text: j.choices?.[0]?.message?.content || j.error?.message || '無回應' });
                resolve();
            });
        });
        r.on('error', e => { res.status(500).json({ text: e.message }); resolve(); });
        r.write(body); r.end();
    });
};
