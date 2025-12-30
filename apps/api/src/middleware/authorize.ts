import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth.js';

/**
 * Role-based authorization middleware
 * Must be used AFTER authMiddleware
 *
 * @param roles - Allowed roles (e.g., 'ADMIN', 'LIBRARIAN')
 */
export function requireRole(...roles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    next();
  };
}

// Convenience exports for common role checks
export const requireAdmin = requireRole('ADMIN');
export const requireLibrarian = requireRole('ADMIN', 'LIBRARIAN');
