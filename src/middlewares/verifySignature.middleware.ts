import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

export function verifySignature(req: Request, res: Response, next: NextFunction) {
  const signature = req.header('X-BROKER-SIGNATURE');
  const timestamp = req.header('X-BROKER-TIMESTAMP');
  const apiKey = process.env.API_KEY;

  if (!signature || !timestamp || !apiKey) {
    res.status(401).json({ error: 'Missing signature, timestamp, or API key' });
    return;
  }

  const message = `${apiKey}:${timestamp}`;
  const expectedHmac = crypto.createHmac('sha256', apiKey).update(message).digest();
  const expectedSignature = Buffer.from(expectedHmac).toString('base64');

  if (signature !== expectedSignature) {
    res.status(401).json({ error: 'Invalid signature' });
    return;
  }

  //prevent replay attacks with timestamp check
  const requestTime = parseInt(timestamp);
  const currentTime = Date.now();
  const timeDifference = Math.abs(currentTime - requestTime);

  // 5 minutes tolerance
  if (timeDifference > 5 * 60 * 1000) {
    res.status(400).json({ error: 'Request timestamp expired or invalid' });
    return;
  }

  next();
}
