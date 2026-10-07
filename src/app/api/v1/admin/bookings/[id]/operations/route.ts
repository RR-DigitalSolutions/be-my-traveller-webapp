import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { BookingService } from "@/domains/booking/booking.service";
import { HotelOperationsService } from "@/domains/hotels/hotel-operations.service";
import { TransportOperationsService } from "@/domains/transfers/transport-operations.service";
import { FinanceOperationsService } from "@/domains/finance/finance.service";
import { VoucherService } from "@/domains/booking/voucher.service";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: bookingId } = await params;
    const body = await req.json();
    const { action, payload } = body;

    const userId = session.user.id || "admin";
    const userEmail = session.user.email || "admin@bemytraveller.com";

    switch (action) {
      // 1. HOTEL OPERATIONS
      case "CONFIRM_HOTEL": {
        const updated = await HotelOperationsService.confirmHotelReservation({
          bookingId,
          hotelBookingIndex: payload?.hotelBookingIndex ?? 0,
          confirmationNumber: payload?.confirmationNumber,
          supplierCost: Number(payload?.supplierCost) || 0,
          hotelName: payload?.hotelName,
          roomType: payload?.roomType,
          mealPlan: payload?.mealPlan,
          supplierName: payload?.supplierName,
          notes: payload?.notes,
          userId,
          userEmail,
        });
        return NextResponse.json({ success: true, booking: updated, message: "Hotel reservation confirmed" });
      }

      case "ISSUE_HOTEL_VOUCHER": {
        const updated = await HotelOperationsService.issueHotelVoucher({
          bookingId,
          hotelIndex: payload?.hotelIndex ?? 0,
          userId,
          userEmail,
        });
        return NextResponse.json({ success: true, booking: updated, message: "Hotel voucher generated" });
      }

      // 2. TRANSPORT OPERATIONS
      case "ASSIGN_TRANSPORT": {
        const updated = await TransportOperationsService.assignDriverAndVehicle({
          bookingId,
          transportIndex: payload?.transportIndex ?? 0,
          driverName: payload?.driverName,
          driverPhone: payload?.driverPhone,
          vehicleType: payload?.vehicleType || "Sedan / Cab",
          vehicleNumber: payload?.vehicleNumber,
          pickupLocation: payload?.pickupLocation,
          dropLocation: payload?.dropLocation,
          pickupTime: payload?.pickupTime ? new Date(payload.pickupTime) : undefined,
          supplierCost: Number(payload?.supplierCost) || 0,
          supplierName: payload?.supplierName,
          notes: payload?.notes,
          userId,
          userEmail,
        });
        return NextResponse.json({ success: true, booking: updated, message: "Driver and vehicle assigned" });
      }

      case "DISPATCH_TRANSPORT": {
        const updated = await TransportOperationsService.dispatchTransport({
          bookingId,
          transportIndex: payload?.transportIndex ?? 0,
          userId,
          userEmail,
        });
        return NextResponse.json({ success: true, booking: updated, message: "Transport dispatched" });
      }

      case "COMPLETE_TRANSPORT": {
        const updated = await TransportOperationsService.completeTransport({
          bookingId,
          transportIndex: payload?.transportIndex ?? 0,
          userId,
          userEmail,
        });
        return NextResponse.json({ success: true, booking: updated, message: "Transport completed" });
      }

      case "ISSUE_TRANSPORT_VOUCHER": {
        const updated = await TransportOperationsService.issueTransportVoucher({
          bookingId,
          transportIndex: payload?.transportIndex ?? 0,
          userId,
          userEmail,
        });
        return NextResponse.json({ success: true, booking: updated, message: "Transport voucher generated" });
      }

      // 3. CUSTOMER PAYMENTS
      case "RECORD_CUSTOMER_PAYMENT": {
        const result = await BookingService.recordCustomerPayment({
          bookingId,
          amount: Number(payload?.amount),
          paymentType: payload?.paymentType || "PARTIAL",
          paymentMethod: payload?.paymentMethod || "UPI",
          providerPaymentId: payload?.providerPaymentId,
          notes: payload?.notes,
          userId,
          userEmail,
        });
        return NextResponse.json({
          success: true,
          booking: result.booking,
          payment: result.payment,
          message: "Customer payment recorded",
        });
      }

      // 4. SUPPLIER PAYABLES REQUEST
      case "REQUEST_SUPPLIER_PAYMENT": {
        const payable = await FinanceOperationsService.requestSupplierPayment({
          bookingId,
          supplierName: payload?.supplierName || "Direct Supplier",
          serviceType: payload?.serviceType || "HOTEL",
          amount: Number(payload?.amount),
          paymentMethod: payload?.paymentMethod || "BANK_TRANSFER",
          dueDate: payload?.dueDate ? new Date(payload.dueDate) : undefined,
          notes: payload?.notes,
          userId,
          userEmail,
        });
        return NextResponse.json({ success: true, payable, message: "Supplier payment requested" });
      }

      // 5. TRIP VOUCHER PREVIEW
      case "GENERATE_TRIP_VOUCHER": {
        const fullBooking = await BookingService.getBookingDetails(bookingId);
        const customer = fullBooking.customer as unknown as { name?: string; phone?: string } | undefined;
        const voucher = VoucherService.buildPrintableVoucher(
          fullBooking as any,
          customer?.name || "Valued Traveler",
          customer?.phone || "+91 98000 00000",
          payload?.type || "COMBINED_TRIP"
        );
        return NextResponse.json({ success: true, voucher });
      }

      default:
        return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
    }
  } catch (error: unknown) {
    console.error("[Booking Operations Action Error]:", error);
    const message = error instanceof Error ? error.message : "Operational action failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
