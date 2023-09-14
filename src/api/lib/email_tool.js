import sgMail from "@sendgrid/mail";


sgMail.setApiKey(process.env.SENDGRID_KEY);

export const sendRegistrationEmail = async (
  recipientAddress,
  userData,
  user_id
) => {
  const params = `${user_id}/${userData.first_name}`;

  const msg = {
    to: recipientAddress,
    from: process.env.SENDER_EMAIL,
    subject: ` Verify Your Email Address`,

    html: `<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verify Your Email Address</title>
        <style>
           
            body {
                font-family: Arial, sans-serif;
                background-image: url('https://media.licdn.com/dms/image/D4D22AQGmKvoLUHk-kg/feedshare-shrink_800/0/1694598891620?e=1697673600&v=beta&t=ejreU3bE7sUT8htftow4d2w8njphSAbmmbIWSUHV1ao'); 
                background-repeat: no-repeat;
                background-size: cover;
                background-color: gray; 
                margin: 0;
                padding: 0;
                font-size:14px;
             font-family: 'Roboto', sans-serif;
            }
            .container {
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                background-color: rgba(255, 255, 255, 0.9); 
            }
            .header {
                background-color: #02e6f2b3;
                padding: 20px 0;
                text-align: center;
                color: #fff;
                font-size:0.6rem
            }
            .content {
                padding: 20px;
            }
            .button {
                
                text-align: center;
                margin-top: 20px;
            }
            .button a {
                display: inline-block;
                padding: 10px 20px;
                background-color: #02e6f2b3;
                color: #fff;
                text-decoration: none;
                border-radius: 0px;
            }
            .footer {
                text-align: center;
                color: #777;
                font-size: 12px;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Verify Your Email Address</h1>
            </div>
            <div class="content">
                <p>Dear ${userData.first_name} ${userData.last_name} ,</p>
                <p>Thank you for registering with Makronexus! We're excited to have you as a part of our community. To ensure the security of your account and enjoy uninterrupted access to our services, please verify your email address by clicking the link below:</p>
                <div class="button">
                    <a href="makronexus.com/user/verifyEmail/${params}">Verify Email</a>
                </div>
                <p>If the above link doesn't work, you can copy and paste the following URL into your web browser:</p>
                <p>makronexus.com/user/verifyEmail/${params}</p>
                <p>Please note that this verification link is only valid for the next 24 hours.</p>
               
            </div>
            <div class="footer">
                <p>Thank you for choosing Makronexus. We look forward to serving you.</p>
                <p>@Makronexus</p>
            </div>
        </div>
    </body>
    </html>
    `,
  };
  await sgMail.send(msg);
  console.log("email sent ....");
};
