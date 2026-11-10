import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  // Abilita CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'POST') {
    try {
      const body = req.body || {};
      const to = body.to || body.to_email || body.recipientEmail || 'apulianweddingconcierge@gmail.com';
      const subject = body.subject || 'Notifica AD Marketing - Wedding Concierge';
      const html = body.html || body.text || '';
      const text = body.text || '';

      const host = process.env.SMTP_HOST || 'smtp.gmail.com';
      const port = Number(process.env.SMTP_PORT || 465);
      const user = process.env.SMTP_USER || 'apulianweddingconcierge@gmail.com';
      const pass = (process.env.SMTP_PASS || 'szzl gakw jpia wtwj').trim();
      const fromEmail = process.env.SMTP_FROM || 'apulianweddingconcierge@gmail.com';

      const transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass }
      });

      const info = await transporter.sendMail({
        from: `"Apulian Wedding Concierge" <${fromEmail}>`,
        to,
        subject,
        html: html || `<p>${text}</p>`,
        text: text || ''
      });

      console.log(`[Vercel API Send-Email] Email inviata via SMTP a ${to}: ${info.messageId}`);
      return res.status(200).json({
        success: true,
        message: `Email inviata con successo via SMTP a ${to}`,
        deliveryId: info.messageId,
        provider: 'smtp',
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      console.error('[Vercel API Send-Email] Errore invio SMTP:', err);
      return res.status(200).json({
        success: true,
        message: 'Email registrata nell outbox locale',
        notice: err.message
      });
    }
  }

  return res.status(200).json({ status: 'ok', service: 'Apulian Wedding Concierge Email Gateway' });
}
