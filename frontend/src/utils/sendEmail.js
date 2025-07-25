// src/utils/sendEmail.js
import emailjs from 'emailjs-com';

export const sendEmail = (email, subject, message) => {
  emailjs.send(
    'YOUR_SERVICE_ID',
    'YOUR_TEMPLATE_ID',
    {
      to_email: email,
      subject,
      message,
    },
    'YOUR_USER_ID'
  );
};
