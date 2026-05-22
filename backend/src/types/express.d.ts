declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        email: string;
        nivelId: number;
      };
    }
  }
}

export {};
