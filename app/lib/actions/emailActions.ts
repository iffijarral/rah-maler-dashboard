'use server';
import { Resend } from 'resend';
// import { render } from '@react-email/render';
// import { JSDOM } from 'jsdom';
// import DOMPurify from 'dompurify';
import Faktura from '../generate-pdf';
import { FakturaEmail } from '@/app/dashboard/emails/templates/FakturaEmail';
import { InvoiceTableRow } from '../definitions';
// import { EmailFormSchema } from '../schemas';
// import WelcomeEmail from '@/app/dashboard/emails/templates/WelcomeEmail';

export async function sendInvoice(invoice: InvoiceTableRow) {

    const resend = new Resend(process.env.RESEND_API_KEY);
    const pdfBytes = await Faktura(invoice);
    const base64Pdf = Buffer.from(pdfBytes).toString('base64');

    try {
        const { error } = await resend.emails.send({
            from: 'onboarding@resend.dev',
            to: 'iffidk@gmail.com',
            // to: invoice.customer.email,
            subject: `Faktura fra RAH Maler`,
            react: FakturaEmail({ name: invoice.project.customer.name }),
            attachments: [
                {
                    filename: `faktura-${invoice.id}.pdf`,
                    content: base64Pdf, // must be base64
                },
            ],
        });

        if (error) {
            console.error('Email Error:', error);
            return {
                errors: {
                    message: ['Failed to send email.'],
                },
                success: false,
            };
        }

    } catch (error) {
        console.error('Email Error:', error);
        return {
            errors: {
                message: ['Failed to send email.'],
            },
            success: false,
        };
    }

    return {
        errors: {},
        success: true,
    };
}

// Send an email using the Resend library
// export async function sendWelcomeEmail(prevState: EmailParams, formData: FormData) {
//     const window = new JSDOM('').window;
//     const purify = DOMPurify(window);

//     // Sanitize form data
//     const sanitizedReceiver = purify.sanitize(formData.get('receiver') as string);
//     const sanitizedSubject = purify.sanitize(formData.get('subject') as string);
//     const sanitizedMessage = purify.sanitize(formData.get('message') as string);

//     // Convert files to base64 before sending as attachment
//     const files = formData.getAll('files') as File[];
//     const attachments = await Promise.all(files.map(async (file) => ({
//         filename: file.name,
//         content: Buffer.from(await file.arrayBuffer()).toString('base64'),
//     })));

//     // Validate form using Zod
//     const validatedFields = EmailFormSchema.safeParse({
//         receiver: sanitizedReceiver,
//         subject: sanitizedSubject,
//         message: sanitizedMessage,
//     });

//     // If form validation fails, return errors early. Otherwise, continue.
//     if (!validatedFields.success) {
//         return {
//             errors: validatedFields.error.flatten().fieldErrors,
//             receiver: prevState.receiver,
//             subject: prevState.subject,
//             message: prevState.message,
//             files: prevState.files,
//             success: prevState.success,
//         };
//     }

//     const { receiver, subject, message } = validatedFields.data;

//     const resend = new Resend(process.env.RESEND_API_KEY);

//     try {
//         // THIS IS THE CORRECTED LINE:
//         const emailHtml = render(
//             <WelcomeEmail
//                 message={ message }
//                 recipientName = { receiver }
//                 ctaLink = "https://rahmaler.dk"
//             />
//         );

//         const { data, error } = await resend.emails.send({
//             from: 'onboarding@resend.dev',
//             to: receiver,
//             subject: subject,
//             react: emailHtml, // Pass the rendered HTML string here
//             attachments
//         });

//         if (error) {
//             console.error('Email Error (sendWelcomeEmail):', error);
//             return {
//                 errors: {
//                     message: ['Failed to send welcome email.'],
//                 },
//                 receiver,
//                 subject,
//                 message,
//                 files: prevState.files,
//                 success: false,
//             };
//         }
//         console.log('Welcome Email Sent:', data);
//     } catch (error) {
//         console.error('Email Error (sendWelcomeEmail Catch):', error);
//         return {
//             errors: {
//                 message: ['Failed to send welcome email due to unexpected error.'],
//             },
//             receiver,
//             subject,
//             message,
//             files: prevState.files,
//             success: false,
//         };
//     }

//     return {
//         errors: {},
//         receiver,
//         subject,
//         message,
//         files: prevState.files,
//         success: true,
//     };
// }