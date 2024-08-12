const nodemailer = require('nodemailer');

const config = require('./config');

class MailSender {
  constructor() {
    this._transporter = nodemailer.createTransport({
      host: config.smtpHost,
      port: config.smptPort,
      secure: false,
      auth: {
        user: config.smtpUser,
        pass: config.smptPassword,
      },
    });
  }

  sendEmail(targetEmail, content) {
    const message = {
      from: 'Open Music Adi',
      to: targetEmail,
      subject: 'Ekspor Playlist',
      text: 'Daftar lagu terlampir hasil dari ekspor playlist',
      attachments: [
        {
          filename: 'playlists.json',
          content,
        },
      ],
    };

    return this._transporter.sendMail(message);
  }
}

module.exports = MailSender;
