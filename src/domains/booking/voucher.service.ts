// ============================================================
// Voucher Management Service
// Enterprise Voucher issuance, formatting, and delivery for
// Be My Traveller hotel stays, private cab transfers, and full trips.
// ============================================================

import type { IBooking, IHotelBookingItem, ITransportBookingItem, IVoucherItem } from "./booking.model";

export interface VoucherDetails {
  voucherNumber: string;
  bookingNumber: string;
  type: "HOTEL" | "TRANSPORT" | "COMBINED_TRIP";
  issuedAt: Date;
  customerName: string;
  customerPhone: string;
  destination: string;
  travelDates: { from: Date; to: Date };
  paxSummary: string;
  hotels: {
    hotelName: string;
    roomType: string;
    mealPlan: string;
    checkIn: Date;
    checkOut: Date;
    roomsCount: number;
    confirmationNumber?: string;
    voucherCode?: string;
  }[];
  transports: {
    serviceName: string;
    vehicleType: string;
    vehicleNumber?: string;
    driverName?: string;
    driverPhone?: string;
    pickupLocation: string;
    dropLocation: string;
    pickupTime: Date;
  }[];
  inclusions: string[];
  supportHotline: string;
  emergencyEmail: string;
}

export class VoucherService {
  /**
   * Generates a unique formal voucher number
   */
  static generateVoucherNumber(prefix: "BMT-HV" | "BMT-TV" | "BMT-TRIP" = "BMT-TRIP"): string {
    const year = new Date().getFullYear();
    const random = Math.floor(1000 + Math.random() * 9000);
    return `${prefix}-${year}-${random}`;
  }

  /**
   * Builds complete printable voucher data from a booking
   */
  static buildPrintableVoucher(
    booking: IBooking,
    customerName: string,
    customerPhone: string,
    type: "HOTEL" | "TRANSPORT" | "COMBINED_TRIP" = "COMBINED_TRIP"
  ): VoucherDetails {
    const voucherNumber = this.generateVoucherNumber(
      type === "HOTEL" ? "BMT-HV" : type === "TRANSPORT" ? "BMT-TV" : "BMT-TRIP"
    );

    const paxSummary = `${booking.travellers.adults} Adults${
      booking.travellers.children ? `, ${booking.travellers.children} Children` : ""
    }${booking.travellers.infants ? `, ${booking.travellers.infants} Infants` : ""}`;

    return {
      voucherNumber,
      bookingNumber: booking.bookingNumber,
      type,
      issuedAt: new Date(),
      customerName,
      customerPhone,
      destination: booking.destination || booking.packageName || "Kashmir Luxury Explorer",
      travelDates: booking.travelDates,
      paxSummary,
      hotels: (booking.hotelBookings || []).map((h: IHotelBookingItem) => ({
        hotelName: h.hotelName,
        roomType: h.roomType,
        mealPlan: h.mealPlan,
        checkIn: h.checkIn,
        checkOut: h.checkOut,
        roomsCount: h.roomsCount,
        confirmationNumber: h.confirmationNumber,
        voucherCode: h.voucherCode,
      })),
      transports: (booking.transportBookings || []).map((t: ITransportBookingItem) => ({
        serviceName: t.serviceName,
        vehicleType: t.vehicleType,
        vehicleNumber: t.vehicleNumber,
        driverName: t.driverName,
        driverPhone: t.driverPhone,
        pickupLocation: t.pickupLocation,
        dropLocation: t.dropLocation,
        pickupTime: t.pickupTime,
      })),
      inclusions: [
        "All verified accommodation with specified meal plans.",
        "Private dedicated vehicle with fuel, toll permits, and driver allowance.",
        "Airport / Railway pickup and personalized meet & greet.",
        "24x7 Dedicated Trip Support Specialist on duty.",
      ],
      supportHotline: "+91 80916 38090",
      emergencyEmail: "operations@bemytraveller.com",
    };
  }
}
