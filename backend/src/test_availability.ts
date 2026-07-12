import { PrismaClient } from '@prisma/client';
import { checkProductAvailability } from './services/availability.service';

const prisma = new PrismaClient();

async function runTests() {
  console.log('--- CineRent Availability Engine Test Suite ---');
  
  // 1. Get a product from the database
  const product = await prisma.product.findFirst();
  if (!product) {
    console.error('No products found to test. Run seeding first.');
    process.exit(1);
  }
  console.log(`Testing Product: ${product.name} (ID: ${product.id})`);

  // Reset any test blackouts/bookings first
  await prisma.productAvailabilityBlackout.deleteMany({ where: { productId: product.id } });
  
  // Clean up order items/orders for this test
  await prisma.orderItem.deleteMany({ where: { order: { orderNumber: 'CR-TEST-9999' } } });
  await prisma.order.deleteMany({ where: { orderNumber: 'CR-TEST-9999' } });

  // Create a mock user
  const user = await prisma.user.findFirst();
  if (!user) {
    console.error('No users found. Run seeding first.');
    process.exit(1);
  }

  // Define booking date range: Aug 1 to Aug 5, 2026
  const startBooked = new Date('2026-08-01T00:00:00.000Z');
  const endBooked = new Date('2026-08-05T23:59:59.999Z');

  // Create a mock active order
  const mockOrder = await prisma.order.create({
    data: {
      orderNumber: 'CR-TEST-9999',
      userId: user.id,
      status: 'APPROVED',
      totalRentalCost: 400.0,
      totalDeposit: 500.0,
      totalTax: 72.0,
      grandTotal: 972.0,
      deliveryAddress: 'Test Studio A',
    }
  });

  await prisma.orderItem.create({
    data: {
      orderId: mockOrder.id,
      productId: product.id,
      quantity: 1,
      startDate: startBooked,
      endDate: endBooked,
      dailyRate: 80.0,
      weeklyRate: 400.0,
      depositAmount: 500.0,
      totalCost: 400.0
    }
  });
  console.log(`Mock active booking created for: Aug 1 to Aug 5, 2026`);

  // Test cases:
  // Case A: Complete overlap (Aug 2 to Aug 4) -> should be unavailable
  const resA = await checkProductAvailability(product.id, new Date('2026-08-02'), new Date('2026-08-04'));
  assert(resA.available === false, 'Case A failed: Complete overlap should be unavailable.');

  // Case B: Left border overlap (Jul 30 to Aug 2) -> should be unavailable
  const resB = await checkProductAvailability(product.id, new Date('2026-07-30'), new Date('2026-08-02'));
  assert(resB.available === false, 'Case B failed: Left overlap should be unavailable.');

  // Case C: Right border overlap (Aug 4 to Aug 8) -> should be unavailable
  const resC = await checkProductAvailability(product.id, new Date('2026-08-04'), new Date('2026-08-08'));
  assert(resC.available === false, 'Case C failed: Right overlap should be unavailable.');

  // Case D: No overlap before (Jul 25 to Jul 31) -> should be available
  const resD = await checkProductAvailability(product.id, new Date('2026-07-25'), new Date('2026-07-31'));
  assert(resD.available === true, `Case D failed: Before booking range should be available. Reason: ${resD.reason}`);

  // Case E: No overlap after (Aug 6 to Aug 10) -> should be available
  const resE = await checkProductAvailability(product.id, new Date('2026-08-06'), new Date('2026-08-10'));
  assert(resE.available === true, `Case E failed: After booking range should be available. Reason: ${resE.reason}`);

  // Case F: Excluded current order check (for editing dates of an existing order)
  const resF = await checkProductAvailability(product.id, new Date('2026-08-02'), new Date('2026-08-04'), mockOrder.id);
  assert(resF.available === true, `Case F failed: Overlapping range should be available when current order is excluded.`);

  console.log('\n✔ All tests passed successfully! Availability engine behaves perfectly.');

  // Cleanup test order
  await prisma.orderItem.deleteMany({ where: { orderId: mockOrder.id } });
  await prisma.order.deleteMany({ where: { id: mockOrder.id } });
}

function assert(condition: boolean, errMsg: string) {
  if (!condition) {
    throw new Error(`Assertion failed: ${errMsg}`);
  }
}

runTests()
  .catch((e) => {
    console.error('Test execution failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
