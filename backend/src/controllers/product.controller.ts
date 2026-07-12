import { Router, Request, Response } from 'express';
import { prisma } from '../db';
import { checkProductAvailability, getUnavailableDates } from '../services/availability.service';
import { authMiddleware, requireRole } from '../middleware/auth.middleware';

const router = Router();

// Get all categories
router.get('/categories', async (req: Request, res: Response) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' },
    });
    res.json(categories);
  } catch (error) {
    console.error('Fetch categories error:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// List all products with filters
router.get('/', async (req: Request, res: Response) => {
  const { category, vendorId, search, startDate, endDate } = req.query;

  try {
    const whereClause: any = {};

    // 1. Category Filter
    if (category) {
      whereClause.category = {
        slug: category as string,
      };
    }

    // 2. Vendor Filter
    if (vendorId) {
      whereClause.vendorId = vendorId as string;
    }

    // 3. Search Filter (name/description)
    if (search) {
      whereClause.OR = [
        { name: { contains: search as string } },
        { description: { contains: search as string } },
      ];
    }

    // 4. Date Availability Filter
    if (startDate && endDate) {
      const start = new Date(startDate as string);
      start.setHours(0, 0, 0, 0);
      const end = new Date(endDate as string);
      end.setHours(23, 59, 59, 999);

      if (start <= end) {
        // Find product IDs that have overlapping blackouts
        const blackoutProducts = await prisma.productAvailabilityBlackout.findMany({
          where: {
            NOT: [
              { endDate: { lt: start } },
              { startDate: { gt: end } },
            ],
          },
          select: { productId: true },
        });

        // Find product IDs that have overlapping active bookings
        const bookedProducts = await prisma.orderItem.findMany({
          where: {
            order: {
              status: { not: 'CANCELLED' },
            },
            NOT: [
              { endDate: { lt: start } },
              { startDate: { gt: end } },
            ],
          },
          select: { productId: true },
        });

        // Combine excluded IDs
        const excludedProductIds = Array.from(
          new Set([
            ...blackoutProducts.map((bp) => bp.productId),
            ...bookedProducts.map((bp) => bp.productId),
          ])
        );

        if (excludedProductIds.length > 0) {
          whereClause.id = {
            notIn: excludedProductIds,
          };
        }
      }
    }

    const products = await prisma.product.findMany({
      where: whereClause,
      include: {
        category: true,
        vendor: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(products);
  } catch (error) {
    console.error('Fetch products error:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// Get a single product details
router.get('/:idOrSlug', async (req: Request, res: Response) => {
  const { idOrSlug } = req.params;

  try {
    const product = await prisma.product.findFirst({
      where: {
        OR: [
          { id: idOrSlug },
          { slug: idOrSlug },
        ],
      },
      include: {
        category: true,
        vendor: true,
      },
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    console.error('Fetch product detail error:', error);
    res.status(500).json({ error: 'Failed to fetch product details' });
  }
});

// Get unavailable dates (calendar support)
router.get('/:id/unavailable-dates', async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const dates = await getUnavailableDates(id);
    res.json(dates);
  } catch (error) {
    console.error('Fetch unavailable dates error:', error);
    res.status(500).json({ error: 'Failed to fetch unavailable dates' });
  }
});

// Admin/Vendor Add Product
router.post(
  '/',
  authMiddleware,
  requireRole(['ADMIN', 'VENDOR']),
  async (req: Request, res: Response) => {
    const { name, description, specs, dailyRate, weeklyRate, depositAmount, images, categoryId, vendorId } = req.body;

    if (!name || !description || !specs || !dailyRate || !weeklyRate || !depositAmount || !images || !categoryId) {
      return res.status(400).json({ error: 'Missing required product fields' });
    }

    try {
      // Determine which vendor owns the product
      let actualVendorId = vendorId;

      if (req.user!.role === 'VENDOR') {
        if (!req.user!.vendorProfile) {
          return res.status(403).json({ error: 'User does not have an active vendor profile' });
        }
        actualVendorId = req.user!.vendorProfile.id;
      } else if (req.user!.role === 'ADMIN' && !actualVendorId) {
        return res.status(400).json({ error: 'Admin must specify vendorId' });
      }

      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

      const product = await prisma.product.create({
        data: {
          name,
          slug,
          description,
          specs: typeof specs === 'string' ? specs : JSON.stringify(specs),
          dailyRate: Number(dailyRate),
          weeklyRate: Number(weeklyRate),
          depositAmount: Number(depositAmount),
          images,
          categoryId,
          vendorId: actualVendorId,
        },
      });

      res.status(201).json({ message: 'Product created successfully', product });
    } catch (error) {
      console.error('Create product error:', error);
      res.status(500).json({ error: 'Failed to create product' });
    }
  }
);

// Admin/Vendor Update Product
router.put(
  '/:id',
  authMiddleware,
  requireRole(['ADMIN', 'VENDOR']),
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const updateData = req.body;

    try {
      const existingProduct = await prisma.product.findUnique({ where: { id } });
      if (!existingProduct) {
        return res.status(404).json({ error: 'Product not found' });
      }

      // Check ownership
      if (req.user!.role === 'VENDOR' && existingProduct.vendorId !== req.user!.vendorProfile?.id) {
        return res.status(403).json({ error: 'Forbidden. You do not own this product.' });
      }

      if (updateData.name) {
        updateData.slug = updateData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      }
      if (updateData.specs && typeof updateData.specs !== 'string') {
        updateData.specs = JSON.stringify(updateData.specs);
      }
      if (updateData.dailyRate) updateData.dailyRate = Number(updateData.dailyRate);
      if (updateData.weeklyRate) updateData.weeklyRate = Number(updateData.weeklyRate);
      if (updateData.depositAmount) updateData.depositAmount = Number(updateData.depositAmount);

      const product = await prisma.product.update({
        where: { id },
        data: updateData,
      });

      res.json({ message: 'Product updated successfully', product });
    } catch (error) {
      console.error('Update product error:', error);
      res.status(500).json({ error: 'Failed to update product' });
    }
  }
);

// Admin/Vendor Delete Product
router.delete(
  '/:id',
  authMiddleware,
  requireRole(['ADMIN', 'VENDOR']),
  async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
      const existingProduct = await prisma.product.findUnique({ where: { id } });
      if (!existingProduct) {
        return res.status(404).json({ error: 'Product not found' });
      }

      // Check ownership
      if (req.user!.role === 'VENDOR' && existingProduct.vendorId !== req.user!.vendorProfile?.id) {
        return res.status(403).json({ error: 'Forbidden. You do not own this product.' });
      }

      await prisma.product.delete({ where: { id } });
      res.json({ message: 'Product deleted successfully' });
    } catch (error) {
      console.error('Delete product error:', error);
      res.status(500).json({ error: 'Failed to delete product' });
    }
  }
);

// Add Blackout Dates
router.post(
  '/:id/blackouts',
  authMiddleware,
  requireRole(['ADMIN', 'VENDOR']),
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const { startDate, endDate, reason } = req.body;

    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'Start date and end date are required' });
    }

    try {
      const product = await prisma.product.findUnique({ where: { id } });
      if (!product) {
        return res.status(404).json({ error: 'Product not found' });
      }

      if (req.user!.role === 'VENDOR' && product.vendorId !== req.user!.vendorProfile?.id) {
        return res.status(403).json({ error: 'Forbidden. You do not own this product.' });
      }

      const start = new Date(startDate);
      const end = new Date(endDate);

      // Verify availability before blacking out (optional, but good to avoid conflict with active rentals)
      const isFree = await checkProductAvailability(id, start, end);
      if (!isFree.available && isFree.reason?.includes('rented')) {
        return res.status(400).json({ error: `Cannot blackout dates: Product is currently rented during this period.` });
      }

      const blackout = await prisma.productAvailabilityBlackout.create({
        data: {
          productId: id,
          startDate: start,
          endDate: end,
          reason,
        },
      });

      res.status(201).json({ message: 'Blackout dates successfully created', blackout });
    } catch (error) {
      console.error('Create blackout error:', error);
      res.status(500).json({ error: 'Failed to create blackout dates' });
    }
  }
);

// Get Blackout Dates
router.get('/:id/blackouts', async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const blackouts = await prisma.productAvailabilityBlackout.findMany({
      where: { productId: id },
      orderBy: { startDate: 'asc' },
    });
    res.json(blackouts);
  } catch (error) {
    console.error('Fetch blackouts error:', error);
    res.status(500).json({ error: 'Failed to fetch blackout dates' });
  }
});

export default router;
