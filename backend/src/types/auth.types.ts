import { Request } from '@nestjs/common';
import { JwtPayload } from '../auth/jwt-auth.guard';

export interface AuthenticatedRequest extends Request {
  user: JwtPayload;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    interface User extends JwtPayload {}
    interface Request {
      user?: User;
    }
  }
}
