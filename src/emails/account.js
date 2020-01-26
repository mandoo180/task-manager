const sgMail = require('@sendgrid/mail');
const sendgridAPIKey = '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';

sgMail.setApiKey(sendgridAPIKey);

const sendWelcomEmail = (email, name) => {
  sgMail.send({
    to: email,
    from: 'mandoo180@gmail.com',
    subject: 'Thanks for joining in',
    text: `Hello, ${name}.`,
  });
};

module.exports = {
  sendWelcomEmail,
};
