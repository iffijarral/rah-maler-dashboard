import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { InvoiceService, InvoiceTableRow } from '@/app/lib/definitions';
import { formatDateToLocal } from './utils';

export default async function Faktura(invoice: InvoiceTableRow) {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([600, 800]);
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const headFontSize = 10;

    const today = new Date();
    const fakturaDate = formatDateToLocal(today.toString());

    const margin = 50;
    const rightX = page.getWidth() - margin - 100; // Adjusted for right alignment
    let yPosition = page.getHeight() - margin;

    // Title
    page.drawText('RAH MALER', { x: margin, y: yPosition, size: 18, font: boldFont });
    yPosition -= 30;

    // Customer details (left)
    page.drawText(`${invoice.project.customer.name}`, { x: margin, y: yPosition, size: headFontSize, font });
    page.drawText(`${invoice.project.customer.email}`, { x: margin, y: yPosition - 20, size: headFontSize, font });
    page.drawText(`${invoice.project.customer.address?.street}`, { x: margin, y: yPosition - 40, size: headFontSize, font });
    page.drawText(`${invoice.project.customer.address?.postalCode}, ${invoice.project.customer.address?.city}`, { x: margin, y: yPosition - 60, size: headFontSize, font });

    // Company details (right)
    page.drawText('RAH Maler', { x: rightX, y: yPosition, size: headFontSize, font });
    page.drawText('Tingbjerg ås 9', { x: rightX, y: yPosition - 20, size: headFontSize, font });
    page.drawText('2700 Brønshøj', { x: rightX, y: yPosition - 40, size: headFontSize, font });
    page.drawText('CVR. 12345678', { x: rightX, y: yPosition - 60, size: headFontSize, font });
    page.drawText('rahmaler.dk', { x: rightX, y: yPosition - 80, size: headFontSize, font });
    page.drawText('info@rahmaler.dk', { x: rightX, y: yPosition - 100, size: headFontSize, font });
    page.drawText('Telefon 70 10 20 31', { x: rightX, y: yPosition - 120, size: headFontSize, font });
    page.drawText(`Dato: ${fakturaDate}`, { x: rightX, y: yPosition - 140, size: headFontSize, font });

    // Reposition yPosition below the contact info
    yPosition -= 180;

    // Table Header
    page.drawText('Ydelse', { x: margin, y: yPosition, size: 12, font: boldFont });
    page.drawText('Antal', { x: margin + 200, y: yPosition, size: 12, font: boldFont });
    page.drawText('Enhedspris', { x: margin + 300, y: yPosition, size: 12, font: boldFont });
    page.drawText('Beløb', { x: margin + 400, y: yPosition, size: 12, font: boldFont });

    yPosition -= 10;

    // Horizontal line before services
    page.drawLine({
        start: { x: margin, y: yPosition },
        end: { x: page.getWidth() - margin, y: yPosition },
        thickness: 0.5,
        color: rgb(0.6, 0.6, 0.6),
    });
    yPosition -= 20;

    // Table Rows
    invoice.services.forEach((s: InvoiceService, index: number) => {
        page.drawText(s.service.name, { x: margin, y: yPosition, size: 12, font });
        page.drawText(`${s.quantity}`, { x: margin + 200, y: yPosition, size: 12, font });
        page.drawText(`${(s.amount / 100).toFixed(2)}`, { x: margin + 300, y: yPosition, size: 12, font });
        page.drawText(`${((s.amount * s.quantity) / 100).toFixed(2)}`, { x: margin + 400, y: yPosition, size: 12, font });
        if (index < invoice.services.length - 1) {
            yPosition -= 20; // spacing between rows
        }        
    });
    yPosition -= 10;
    page.drawLine({
        start: { x: margin, y: yPosition },
        end: { x: page.getWidth() - margin, y: yPosition },
        thickness: 0.5,
        color: rgb(0.6, 0.6, 0.6),
    });
    yPosition -= 20; // spacing after the line before totals

    // Totals
    const total = invoice.services.reduce(
        (sum: number, s: InvoiceService) => sum + s.amount * s.quantity,
        0
    );
    const totalWithMoms = total * 1.25;

    yPosition -= 10;

    const totalExclText = `Total (ekskl. moms): ${(total / 100).toFixed(2)} DKK`;
    // const totalExclWidth = font.widthOfTextAtSize(totalExclText, 12);
    const totalExclX = page.getWidth() - margin - 200;
    page.drawText(totalExclText, { x: totalExclX, y: yPosition, size: 12, font: boldFont });

    yPosition -= 20;

    const totalInclText = `Total (inkl. moms 25%): ${(totalWithMoms / 100).toFixed(2)} DKK`;
    // const totalInclWidth = font.widthOfTextAtSize(totalInclText, 12);
    const totalInclX = page.getWidth() - margin - 200;
    page.drawText(totalInclText, { x: totalInclX, y: yPosition, size: 12, font });

    // Finalize
    const pdfBytes = await pdfDoc.save();
    return pdfBytes;
}
