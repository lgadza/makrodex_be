import sgMail from "@sendgrid/mail";
import { response } from "express";

sgMail.setApiKey(process.env.SENDGRID_KEY);

export const sendRegistrationEmail = async (
  recipientAddress,
  userData,
  userId
) => {
  const params = `${userId}/${userData.name}`;

  const msg = {
    to: recipientAddress,
    from: process.env.SENDER_EMAIL,
    subject: ` Verify Your Email Address`,

    html: `<div><strong>Dear ${userData.name} ${userData.surname} </strong>
    <div>
    <div>Thank you for signing up for our service. To ensure the security of your account and the accuracy of your information, we need to verify your email address.

To complete the verification process, please link on the button below:
</br>

<div><a href=https://impulsgaming.vercel.app/organizer/verifyEmail/${params}>verify email</a></div>


</br>

<div>
Please note that your account will remain inactive until you complete the verification process. 

</div>
</br>
<div>
If you have any questions or concerns, please feel free to contact us.

<a href="tel:794144892">0794-144-892</a>

</div>
</br>
<div>
Thank you for your cooperation.
</div>
</br>
<div>
Best regards,
</div>
</br>
<div>
Louis Gadza
</div>

</br>

</div>
</br>
    </div>
    <span>@makrodex solutions</span>
    <div>`,
  };
  await sgMail.send(msg);
  await console.log("email sent ....");
};
