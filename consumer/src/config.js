require('dotenv').config()

module.exports = {
  smtpUser: process.env.SMTP_USER,
  smptPassword: process.env.SMTP_PASSWORD,
  smtpHost: process.env.SMTP_HOST,
  smptPort: process.env.SMTP_PORT,
  rabbitmqServer: process.env.RABBITMQ_SERVER,
};
