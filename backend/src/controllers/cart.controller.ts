import { Router, Request, Response } from 'express';
import { prisma } from '../db';
import { authMiddleware } from '../middleware/auth.middleware';
import { checkProductAvailability } from '../services/availability.service';

const router = Router();

// Apply auth middleware to all cart endpoints
router.use(authMiddleware);

// Get Cart Items
router.get('/', async (req: Request, res: Response) => {
  const userId = req.user!.id;

  try {
    const items = await prisma.cartItem.findMany({
      where: { userId },
      include: {
        product: {
          include: {
            vendor: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Verify availability dynamically (in case of new bookings since adding to cart)
    const itemsWithAvailability = await Promise.all(
      items.map(async (item) => {
        const check = await checkProductAvailability(item.productId, item.startDate, item.endDate);
        
        // Calculate rental duration in days
        const diffTime = Math.abs(item.endDate.getTime() - item.startDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // inclusive of start & end day

        // Calculate rental price based on daily/weekly rates
        // If duration >= 7, calculate using weekly rate primarily
        let pricePerDay = item.product.dailyRate;
        let totalCost = 0;
        
        if (diffDays >= 7) {
          const weeks = Math.floor(diffDays / 7);
          const extraDays = diffDays % 7;
          totalCost = (weeks * item.product.weeklyRate) + (extraDays * item.product.dailyRate);
          pricePerDay = totalCost / diffDays;
        } else {
          totalCost = diffDays * item.product.dailyRate;
        }

        const depositCost = item.product.depositAmount * item.quantity;
        const rentalCost = totalCost * item.quantity;

        return {
          ...item,
          rentalDays: diffDays,
          rentalCost,
          depositCost,
          totalItemCost: rentalCost + depositCost,
          isAvailable: check.available,
          availabilityReason: check.available ? undefined : check.reason,
        };
      })
    );

    res.json(itemsWithAvailability);
  } catch (error) {
    console.error('Fetch cart error:', error);
    res.status(500).json({ error: 'Failed to fetch cart items' });
  }
});

// Add Item to Cart
router.post('/', async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const { productId, startDate, endDate, quantity } = req.body;

  if (!productId || !startDate || !endDate) {
    return res.status(400).json({ error: 'Product ID, start date, and end date are required' });
  }

  const start = new Date(startDate);
  const end = new Date(endDate);
  const qty = Number(quantity) || 1;

  try {
    // 1. Verify product exists
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // 2. Verify availability
    const check = await checkProductAvailability(productId, start, end);
    if (!check.available) {
      return res.status(400).json({ error: check.reason });
    }

    // 3. Check if identical item is already in cart for overlapping dates
    const existingItem = await prisma.cartItem.findFirst({
      where: {
        userId,
        productId,
        startDate: start,
        endDate: end,
      },
    });

    let cartItem;
    if (existingItem) {
      cartItem = await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + qty },
      });
    } else {
      cartItem = await prisma.cartItem.create({
        data: {
          userId,
          productId,
          startDate: start,
          endDate: end,
          quantity: qty,
        },
      });
    }

    res.status(201).json({ message: 'Added to cart successfully', cartItem });
  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({ error: 'Failed to add item to cart' });
  }
});

// Update Cart Item (Dates or Quantity)
router.put('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const { startDate, endDate, quantity } = req.body;

  try {
    const cartItem = await prisma.cartItem.findUnique({
      where: { id },
    });

    if (!cartItem || cartItem.userId !== req.user!.id) {
      return res.status(404).json({ error: 'Cart item not found' });
    }

    const start = startDate ? new Date(startDate) : cartItem.startDate;
    const end = endDate ? new Date(endDate) : cartItem.endDate;
    const qty = quantity !== undefined ? Number(quantity) : cartItem.quantity;

    if (qty <= 0) {
      await prisma.cartItem.delete({ where: { id } });
      return res.json({ message: 'Cart item removed successfully' });
    }

    // If dates changed, check availability
    if (startDate || endDate) {
      const check = await checkProductAvailability(cartItem.productId, start, end);
      if (!check.available) {
        return res.status(400).json({ error: check.reason });
      }
    }

    const updated = await prisma.cartItem.update({
      where: { id },
      data: {
        startDate: start,
        endDate: end,
        quantity: qty,
      },
    });

    res.json({ message: 'Cart item updated successfully', cartItem: updated });
  } catch (error) {
    console.error('Update cart item error:', error);
    res.status(500).json({ error: 'Failed to update cart item' });
  }
});

// Delete Cart Item
router.delete('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const cartItem = await prisma.cartItem.findUnique({ where: { id } });

    if (!cartItem || cartItem.userId !== req.user!.id) {
      return res.status(404).json({ error: 'Cart item not found' });
    }

    await prisma.cartItem.delete({ where: { id } });
    res.json({ message: 'Cart item removed successfully' });
  } catch (error) {
    console.error('Delete cart item error:', error);
    res.status(500).json({ error: 'Failed to remove cart item' });
  }
});

// Clear Cart
router.delete('/', async (req: Request, res: Response) => {
  const userId = req.user!.id;

  try {
    await prisma.cartItem.deleteMany({ where: { userId } });
    res.json({ message: 'Cart cleared successfully' });
  } catch (error) {
    console.error('Clear cart error:', error);
    res.status(500).json({ error: 'Failed to clear cart' });
  }
});

export default router;
