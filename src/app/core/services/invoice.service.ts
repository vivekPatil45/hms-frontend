import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Reservation } from '../../models/reservation.model';
import { DatePipe } from '@angular/common';

@Injectable({
    providedIn: 'root'
})
export class InvoiceService {

    constructor(private datePipe: DatePipe) { }

    generateInvoice(reservation: Reservation) {
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.width;

        // --- Header ---
        doc.setFontSize(22);
        doc.setTextColor(40, 40, 40);
        doc.text('Grand Hotel', pageWidth / 2, 20, { align: 'center' });

        doc.setFontSize(12);
        doc.setTextColor(100, 100, 100);
        doc.text('12, Koregaon Park Road, Pune, Maharashtra 411001', pageWidth / 2, 28, { align: 'center' });
        doc.text('support@grandhotel.com | +91 98765 43210', pageWidth / 2, 34, { align: 'center' });

        doc.setDrawColor(200, 200, 200);
        doc.line(10, 40, pageWidth - 10, 40);

        // --- Invoice Details ---
        const invoiceId = 'INV-' + reservation.reservationId.substring(reservation.reservationId.length - 8);
        const invoiceDate = this.datePipe.transform(new Date(), 'dd-MMM-yyyy HH:mm');

        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);

        // Left Side
        doc.text(`Invoice No: ${invoiceId}`, 15, 50);
        doc.text(`Date: ${invoiceDate}`, 15, 56);
        doc.text(`Transaction ID: ${reservation.transactionId || 'N/A'}`, 15, 62);

        // Right Side
        doc.text(`Booking ID: ${reservation.reservationId}`, pageWidth - 60, 50);
        doc.text(`Payment Method: ${reservation.paymentMethod || 'Credit Card'}`, pageWidth - 60, 56);
        doc.text(`Status: ${reservation.paymentStatus}`, pageWidth - 60, 62);

        // --- Customer & Room Details ---
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('Bill To:', 15, 75);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);

        const customerName = reservation.customer?.user?.fullName || 'Guest';
        const customerEmail = reservation.customer?.user?.email || 'N/A';
        const customerPhone = reservation.customer?.user?.mobileNumber || 'N/A';

        doc.text(customerName, 15, 81);
        doc.text(customerEmail, 15, 87);
        doc.text(customerPhone, 15, 93);

        // --- Table ---
        const checkIn = this.datePipe.transform(reservation.checkInDate, 'dd-MMM-yyyy');
        const checkOut = this.datePipe.transform(reservation.checkOutDate, 'dd-MMM-yyyy');

        autoTable(doc, {
            startY: 105,
            head: [['Description', 'Details', 'Amount']],
            body: [
                ['Room Type', reservation.room?.roomType || 'Standard', ''],
                ['Stay Duration', `${checkIn} to ${checkOut} (${reservation.numberOfNights} nights)`, ''],
                ['Base Price', `${reservation.numberOfNights} nights x ₹${reservation.baseAmount ? (reservation.baseAmount / reservation.numberOfNights).toFixed(2) : '0.00'}`, `₹${reservation.baseAmount}`],
                ['Taxes & Fees', 'GST & Service Charges', `₹${reservation.taxAmount}`],
                ['Discount', 'Promo Applied', `-₹${reservation.discountAmount || 0}`],
                [{ content: 'Total Amount', styles: { fontStyle: 'bold' } }, '', { content: `₹${reservation.totalAmount}`, styles: { fontStyle: 'bold' } }],
            ],
            theme: 'grid',
            headStyles: { fillColor: [63, 81, 181] },
            styles: { fontSize: 10, cellPadding: 5 },
            columnStyles: {
                0: { cellWidth: 60 },
                1: { cellWidth: 80 },
                2: { cellWidth: 40, halign: 'right' }
            }
        });

        // --- Footer ---
        const finalY = (doc as any).lastAutoTable.finalY + 20;
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text('Thank you for choosing Grand Hotel!', pageWidth / 2, finalY, { align: 'center' });
        doc.text('For any queries, please contact support.', pageWidth / 2, finalY + 6, { align: 'center' });

        // Save
        doc.save(`Invoice_${reservation.reservationId}.pdf`);
    }
}
