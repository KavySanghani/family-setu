export interface AuthUser {
  id: string; // application_user id
  authUserId: string; // supabase auth.users id
  email: string | null;
  fullName: string;
  departmentId: string | null;
  isActive: boolean;
  roles: string[];
  permissions: string[];
  scopes: {
    type: string;
    value: string;
  }[];
}

// Ensure the Express Request object recognizes the user property
declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}
