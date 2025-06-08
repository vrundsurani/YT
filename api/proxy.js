import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';
import HttpsProxyAgent from 'https-proxy-agent';

let proxies = [];

export default async function handler(req, res) {
  if (!proxies.length) {
    // Load proxies once
    const proxiesPath = path.resolve('./proxies.txt');
    const data = await fs.promises.readFile(proxiesPath, 'utf-8');
    proxies = data.split('\n').filter(line => line.trim());
  }

  const targetUrl = req.query.url;
  if (!targetUrl) {
    res.status(400).json({ error: 'No URL specified' });
    return;
  }

  const proxy = proxies[Math.floor(Math.random() * proxies.length)];

  try {
    const agent = new HttpsProxyAgent(proxy);
    const response = await fetch(targetUrl, {
      agent,
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });

    const contentType = response.headers.get('content-type') || 'text/html';
    const body = await response.text();

    res.status(response.status);
    res.setHeader('Content-Type', contentType);
    res.send(body);
  } catch (error) {
    res.status(500).json({ error: 'Proxy request failed', details: error.message });
  }
}
