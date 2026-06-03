// Malá mailová služba pro kontaktní formulář webu ReceptionAI.
// Naslouchá lokálně; IIS na ni přes ARR přeposílá /api/contact.
// Přihlašovací údaje SMTP čte z .env (mimo git).
import 'dotenv/config';
import http from 'node:http';
import nodemailer from 'nodemailer';

const PORT = Number(process.env.MAILER_PORT || 8090);
const HOST = process.env.MAILER_HOST || '127.0.0.1';
const SMTP_PORT = Number(process.env.SMTP_PORT || 465);

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: SMTP_PORT,
  secure: SMTP_PORT === 465, // 465 = SSL, 587/25 = STARTTLS
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
});

function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (c) => { data += c; if (data.length > 1_000_000) req.destroy(); });
    req.on('end', () => resolve(data));
    req.on('error', reject);
  });
}

const esc = (s) => String(s ?? '').trim();

const server = http.createServer(async (req, res) => {
  if (req.method === 'GET' && req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    return res.end('ok');
  }
  if (req.method !== 'POST') {
    res.writeHead(405, { 'Content-Type': 'text/plain; charset=utf-8' });
    return res.end('Method Not Allowed');
  }

  try {
    const p = new URLSearchParams(await readBody(req));

    // honeypot — boti vyplní skryté pole
    if (esc(p.get('bot-field'))) {
      res.writeHead(303, { Location: '/dekujeme' });
      return res.end();
    }

    const jmeno = esc(p.get('jmeno'));
    const email = esc(p.get('email'));
    const provozovna = esc(p.get('provozovna'));
    const telefon = esc(p.get('telefon'));
    const zprava = esc(p.get('zprava'));

    if (!jmeno || !email) {
      res.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' });
      return res.end('Chybí povinná pole (jméno, e-mail).');
    }

    const to = process.env.CONTACT_TO || process.env.SMTP_USER;
    await transporter.sendMail({
      from: `"ReceptionAI web" <${process.env.SMTP_USER}>`,
      to,
      replyTo: `"${jmeno}" <${email}>`,
      subject: `Poptávka z webu: ${jmeno}${provozovna ? ` – ${provozovna}` : ''}`,
      text:
        `Nová poptávka z webu ReceptionAI\n\n` +
        `Jméno: ${jmeno}\n` +
        `Provozovna: ${provozovna || '—'}\n` +
        `E-mail: ${email}\n` +
        `Telefon: ${telefon || '—'}\n\n` +
        `Zpráva:\n${zprava || '—'}\n`,
    });

    res.writeHead(303, { Location: '/dekujeme' });
    res.end();
  } catch (e) {
    console.error('[mailer] chyba odeslání:', e?.message || e);
    res.writeHead(502, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Odeslání e-mailu se nezdařilo. Zkuste to prosím později.');
  }
});

server.listen(PORT, HOST, () => {
  console.log(`[mailer] naslouchá na http://${HOST}:${PORT} (SMTP ${process.env.SMTP_HOST}:${SMTP_PORT})`);
});
