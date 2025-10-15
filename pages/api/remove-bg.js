// pages/api/remove-bg.js - API Route (updated)
import { Client } from "@gradio/client";

export const config = { api: { bodyParser: { sizeLimit: '10mb' } } };

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { imageBase64, imageUrl } = req.body;
    
    if (!imageBase64 && !imageUrl) {
      return res.status(400).json({ error: "Provide imageBase64 or imageUrl" });
    }

    let inputBlob;
    if (imageBase64) {
      const matches = imageBase64.match(/^data:(.*);base64,(.*)$/);
      if (!matches) {
        return res.status(400).json({ error: "Invalid base64 format" });
      }
      const buffer = Buffer.from(matches[2], "base64");
      inputBlob = new Blob([buffer], { type: matches[1] });
    } else {
      const fetched = await fetch(imageUrl);
      if (!fetched.ok) throw new Error('Failed to fetch image URL');
      inputBlob = await fetched.blob();
    }

    const client = await Client.connect("Jonny001/Background-Remover-C1");
    const result = await client.predict("/image", { image: inputBlob });

    let output;
    if (Array.isArray(result.data)) {
      const first = result.data[0];
      output = first?.url ?? first;
    } else {
      output = result.data ?? result;
    }

    return res.status(200).json({ result: output });
  } catch (err) {
    console.error('API Error:', err);
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
}
