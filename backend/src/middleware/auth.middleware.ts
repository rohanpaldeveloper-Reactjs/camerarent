import { Request, Response, NextFunction } from 'express';
import { prisma } from '../db';

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        name: string;
        role: string; // "ADMIN", "CUSTOMER", "VENDOR"
        kycStatus: string;
        kycDocUrl: string | null;
        vendorProfile?: {
          id: string;
          name: string;
        } | null;
      };
    }
  }
}

export async function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: 'Authorization header is missing' });
  }

  // Support "Bearer <userId>" or just "<userId>" directly
  const userId = authHeader.startsWith('Bearer ') 
    ? authHeader.slice(7).trim() 
    : authHeader.trim();

  if (!userId) {
    return res.status(401).json({ error: 'Invalid authorization token' });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        vendorProfile: true,
      },
    });

    if (!user) {
      return res.status(401).json({ error: 'User session not found or invalid' });
    }

    req.user = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      kycStatus: user.kycStatus,
      kycDocUrl: user.kycDocUrl,
      vendorProfile: user.vendorProfile ? {
        id: user.vendorProfile.id,
        name: user.vendorProfile.name,
      } : null,
    };

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ error: 'Internal server authentication error' });
  }
}

export function requireRole(roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized. Authentication required.' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: `Forbidden. Requires one of these roles: ${roles.join(', ')}` });
    }

    next();
  };
}
