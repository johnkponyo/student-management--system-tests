const sendPasswordResetEmail = require('../../services/emailService'); 
const nodemailer = require('nodemailer');

jest.mock('nodemailer', () => ({
  createTransport: jest.fn().mockReturnValue({
    sendMail: jest.fn().mockResolvedValue('Email sent successfully'),
  }),
}));

describe('sendPasswordResetEmail', () => {
  let mockRequest;

  beforeEach(() => {
    mockRequest = {
      protocol: 'http',
      get: jest.fn().mockReturnValue('localhost:3000'),
    };
  });

  it('should send a password reset email with correct details', async () => {
    const email = 'testuser@example.com';
    const token = '1234567890abcdef';

    await sendPasswordResetEmail(email, token, mockRequest);

    const transporter = nodemailer.createTransport();
    expect(transporter.sendMail).toHaveBeenCalledTimes(1); 

    const mailOptions = transporter.sendMail.mock.calls[0][0];

    expect(mailOptions.from).toBe('admin@sms.com');
    expect(mailOptions.to).toBe(email);
    expect(mailOptions.subject).toBe('Reset Your Password');
    
    const expectedLink = `http://localhost:3000/api/auth/password-reset/${token}`;
    expect(mailOptions.html).toContain(expectedLink);
  });

  it('should use https protocol if the request protocol is https', async () => {
    mockRequest.protocol = 'https'; 
    const email = 'testuser@example.com';
    const token = '1234567890abcdef';

    await sendPasswordResetEmail(email, token, mockRequest);

    const transporter = nodemailer.createTransport();
    const mailOptions = transporter.sendMail.mock.calls[0][0];
    const expectedLink = `https://localhost:3000/api/auth/password-reset/${token}`;
    
    expect(mailOptions.html).toContain(expectedLink);
  });

  it('should throw an error if sending the email fails', async () => {

    nodemailer.createTransport().sendMail.mockRejectedValueOnce(new Error('Email sending failed'));

    const email = 'testuser@example.com';
    const token = '1234567890abcdef';

    await expect(sendPasswordResetEmail(email, token, mockRequest)).rejects.toThrow('Email sending failed');
  });
});
