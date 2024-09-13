// src/pages/api/fonts.ts
import type { NextApiRequest, NextApiResponse } from 'next';

// load env from .env.local
import dotenv from 'dotenv';
dotenv.config();


const fetchFonts = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const response = await fetch(`https://www.googleapis.com/webfonts/v1/webfonts?key=${process.env.GOOGLE_FONTS_KEY}`, {
      method: 'GET'
    });
    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching fonts:', error);
    res.status(500).json({ error: 'Error fetching fonts' });
  }
};

export default fetchFonts;