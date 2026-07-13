import { PrismaClient } from '@prisma/client';
import { checkProductAvailability } from './services/availability.service';

const prisma = new PrismaClient();

async function runTests() {
  console.log('--- CameraRent Availability Engine Test Suite ---');
  
  // 1. Get a product from the database
  const product = await prisma.product.findFirst();
  if (!product) {
    console.error('No products found to test. Run seeding first.');
    process.exit(1);
  }
  console.log(`Testing Product: ${product.name} (ID: ${product.id})`);

  // Set totalStock to 3 for testing
  await prisma.product.update({
    where: { id: product.id },
    data: { totalStock: 3 }
  });
  console.log(`Updated Product: ${product.name} totalStock to 3`);

  // Define booking date range: Aug 1 to Aug 5, 2026
  const startBooked = new Date('2026-08-01T00:00:00.000Z');
  const endBooked = new Date('2026-08-05T23:59:59.999Z');

  // Get a mock user for the test
  const user = await prisma.user.findFirst();
  if (!user) {
    console.error('No users found. Run seeding first.');
    process.exit(1);
  }

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

  // Book 2 units
  await prisma.orderItem.create({
    data: {
      orderId: mockOrder.id,
      productId: product.id,
      quantity: 2,
      startDate: startBooked,
      endDate: endBooked,
      dailyRate: 80.0,
      weeklyRate: 400.0,
      depositAmount: 500.0,
      totalCost: 800.0
    }
  });
  console.log(`Mock active booking created for: Aug 1 to Aug 5, 2026 (Qty: 2, leaving 1 available)`);

  // Test cases:
  // Case A: Complete overlap (Aug 2 to Aug 4) requesting 1 unit -> should be AVAILABLE (2 booked + 1 requested = 3 <= 3)
  const resA = await checkProductAvailability(product.id, new Date('2026-08-02'), new Date('2026-08-04'), 1);
  assert(resA.available === true, `Case A failed: Requesting 1 unit in overlap range should be available. Reason: ${resA.reason}`);

  // Case B: Complete overlap (Aug 2 to Aug 4) requesting 2 units -> should be UNAVAILABLE (2 booked + 2 requested = 4 > 3)
  const resB = await checkProductAvailability(product.id, new Date('2026-08-02'), new Date('2026-08-04'), 2);
  assert(resB.available === false, 'Case B failed: Requesting 2 units in overlap range should be unavailable.');

  // Case C: Left border overlap (Jul 30 to Aug 2) requesting 2 units -> should be UNAVAILABLE
  const resC = await checkProductAvailability(product.id, new Date('2026-07-30'), new Date('2026-08-02'), 2);
  assert(resC.available === false, 'Case C failed: Left overlap requesting 2 units should be unavailable.');

  // Case D: Left border overlap (Jul 30 to Aug 2) requesting 1 unit -> should be AVAILABLE
  const resD = await checkProductAvailability(product.id, new Date('2026-07-30'), new Date('2026-08-02'), 1);
  assert(resD.available === true, `Case D failed: Left overlap requesting 1 unit should be available. Reason: ${resD.reason}`);

  // Case E: No overlap before (Jul 25 to Jul 31) requesting 3 units -> should be AVAILABLE
  const resE = await checkProductAvailability(product.id, new Date('2026-07-25'), new Date('2026-07-31'), 3);
  assert(resE.available === true, `Case E failed: Before booking range requesting 3 units should be available. Reason: ${resE.reason}`);

  // Case F: Excluded current order check (for editing dates of an existing order)
  // Requesting 3 units with current order excluded -> should be AVAILABLE
  const resF = await checkProductAvailability(product.id, new Date('2026-08-02'), new Date('2026-08-04'), 3, mockOrder.id);
  assert(resF.available === true, `Case F failed: Overlapping range requesting 3 units should be available when current order is excluded.`);

  // Case G: Blackout dates check
  // Create an administrative blackout for Aug 6 to Aug 7
  const blackout = await prisma.productAvailabilityBlackout.create({
    data: {
      productId: product.id,
      startDate: new Date('2026-08-06T00:00:00.000Z'),
      endDate: new Date('2026-08-07T23:59:59.999Z'),
      reason: 'Sensor cleaning',
    }
  });

  const resG = await checkProductAvailability(product.id, new Date('2026-08-06'), new Date('2026-08-07'), 1);
  assert(resG.available === false, 'Case G failed: Blackout range should be unavailable.');

  console.log('\n✔ All tests passed successfully! Pool-based availability engine behaves perfectly.');

  // Cleanup test order and blackout
  await prisma.productAvailabilityBlackout.deleteMany({ where: { id: blackout.id } });
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
