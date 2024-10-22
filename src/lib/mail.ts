import { Resend } from 'resend';
import nodemailer from 'nodemailer';

// const resend = new Resend(process.env.RESEND_API_KEY);

// Opprett en transporter ved hjelp av dine SMTP-innstillinger
const transporter = nodemailer.createTransport({
  host: 'smtp.proisp.no',
  port: 465,
  secure: true, // True for port 465, false for port 587
  auth: {
    user: process.env.SMTP_USER, // Legg til din e-postadresse som miljøvariabel
    pass: process.env.SMTP_PASSWORD, // Legg til passordet ditt som miljøvariabel
  },
});

export const sendVerificationEmail = async (
  email: string,
  token: string,
  subject: string = 'Verifiser e-posten din'
) => {
  const confirmLink = `${process.env.NEXT_PUBLIC_APP_URL}/auth/new-verification?token=${token}`;

  const mailOptions = {
    from: `"InnUt Timereg" <${process.env.SMTP_USER}>`, // Senderens e-postadresse
    to: email,
    subject: subject,
    html: `<p>Klikk <a href="${confirmLink}">her</a> for å ${subject.toLowerCase()}.</p>`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Verifikasjons-e-post sendt til:', email);
  } catch (error) {
    console.error('Feil ved sending av verifikasjons-e-post:', error);
    throw error;
  }
};

export const sendPasswordResetEmail = async (
  email: string,
  token: string,
  subject: string = 'Tilbakestill passordet ditt'
) => {
  const resetLink = `${process.env.NEXT_PUBLIC_APP_URL}/set-password?token=${token}`;

  const mailOptions = {
    from: `"KKS Timereg" <${process.env.SMTP_USER}>`,
    to: email,
    subject: subject,
    html: `<p>Klikk <a href="${resetLink}">her</a> for å ${subject.toLowerCase()}. Denne lenken er gyldig i 1 time.</p>`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Passord-reset e-post sendt til:', email);
  } catch (error) {
    console.error('Feil ved sending av passord-reset e-post:', error);
    throw error;
  }
};

export const sendEmail = async ({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) => {
  const mailOptions = {
    from: `"KKS Timereg" <${process.env.SMTP_USER}>`,
    to,
    subject,
    html,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('E-post sendt til:', to);
  } catch (error) {
    console.error('Feil ved sending av e-post:', error);
    throw error;
  }
};

// RESEND SOLUTION

// export const sendVerificationEmail = async (
//   email: string,
//   token: string,
//   subject: string = "Verifiser e-posten din"
// ) => {
//   const confirmLink = `${process.env.NEXT_PUBLIC_APP_URL}/auth/new-verification?token=${token}`;

//   await resend.emails.send({
//     from: 'KKS Timereg <onboarding@resend.dev>',
//     to: email,
//     subject: subject,
//     html: `<p>Klikk <a href="${confirmLink}">her</a> for å ${subject.toLowerCase()}</p>`,
//   });
// };

// export const sendEmail = async ({ to, subject, html }) => {
//   await resend.emails.send({
//     from: 'KKS Timereg <onboarding@resend.dev>',
//     to: to,
//     subject: subject,
//     html: html,
//   });
// };

// export const sendPasswordResetEmail = async (
//   email: string,
//   token: string,
//   subject: string
// ) => {
//   const resetLink = `${process.env.NEXT_PUBLIC_APP_URL}/set-password?token=${token}`;

//   try {
//     await resend.emails.send({
//       from: 'KKS Timereg <onboarding@resend.dev>',
//       to: email,
//       subject: subject,
//       html: `<p>Klikk <a href="${resetLink}">her</a> for å ${subject.toLowerCase()}. Denne lenken er gyldig i 1 time.</p>`,
//     });
//     console.log("Passord-reset e-post sendt til:", email);
//   } catch (error) {
//     console.error("Feil ved sending av passord-reset e-post:", error);
//     throw error;
//   }
// };