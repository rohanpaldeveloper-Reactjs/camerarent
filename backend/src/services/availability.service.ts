import { prisma } from '../db';

/**
 * Checks if a product is available for rental between the specified start and end dates.
 * Excludes a specific order if checking for modifications to that order.
 */
export async function checkProductAvailability(
  productId: string,
  startDate: Date,
  endDate: Date,
  excludeOrderId?: string
): Promise<{ available: boolean; reason?: string }> {
  // Normalize dates to UTC start of start-day and UTC end of end-day
  const start = new Date(startDate);
  start.setUTCHours(0, 0, 0, 0);
  
  const end = new Date(endDate);
  end.setUTCHours(23, 59, 59, 999);

  if (start > end) {
    return { available: false, reason: 'Rental start date must be before the end date.' };
  }

  // 1. Check manual administrative blackout dates
  const overlappingBlackout = await prisma.productAvailabilityBlackout.findFirst({
    where: {
      productId,
      startDate: { lte: end },
      endDate: { gte: start },
    },
  });

  if (overlappingBlackout) {
    return {
      available: false,
      reason: `Product is unavailable due to maintenance/blackout: ${overlappingBlackout.reason || 'Maintenance'}.`,
    };
  }

  // 2. Check overlapping active bookings
  const overlappingBooking = await prisma.orderItem.findFirst({
    where: {
      productId,
      order: {
        status: { not: 'CANCELLED' },
        ...(excludeOrderId ? { id: { not: excludeOrderId } } : {}),
      },
      startDate: { lte: end },
      endDate: { gte: start },
    },
    include: {
      order: true,
    },
  });

  if (overlappingBooking) {
    return {
      available: false,
      reason: `Product is already rented from ${overlappingBooking.startDate.toISOString().split('T')[0]} to ${overlappingBooking.endDate.toISOString().split('T')[0]} (Order ${overlappingBooking.order.orderNumber}).`,
    };
  }

  return { available: true };
}

/**
 * Computes all unavailable dates (bookings and blackouts) for a given product.
 * Returns an array of date strings formatted as "YYYY-MM-DD".
 */
export async function getUnavailableDates(productId: string): Promise<string[]> {
  const blackouts = await prisma.productAvailabilityBlackout.findMany({
    where: { productId },
  });

  const bookings = await prisma.orderItem.findMany({
    where: {
      productId,
      order: {
        status: { not: 'CANCELLED' },
      },
    },
  });

  const unavailableDates = new Set<string>();

  const addRangeToSet = (start: Date, end: Date) => {
    const current = new Date(start);
    current.setUTCHours(0, 0, 0, 0);
    const last = new Date(end);
    last.setUTCHours(0, 0, 0, 0);

    // Loop through each day in range and add to set
    while (current <= last) {
      unavailableDates.add(current.toISOString().split('T')[0]);
      current.setUTCDate(current.getUTCDate() + 1);
    }
  };

  blackouts.forEach((b) => addRangeToSet(b.startDate, b.endDate));
  bookings.forEach((b) => addRangeToSet(b.startDate, b.endDate));

  return Array.from(unavailableDates).sort();
}
