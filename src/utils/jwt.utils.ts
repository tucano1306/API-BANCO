import jwt from 'jsonwebtoken';

export const generateToken = (payload: any, expiresIn: string = '1d'): string => {
  return (jwt as any).sign(
    payload,
    process.env.JWT_SECRET || "defaultsecret",
    { expiresIn }
  );
};

export const verifyToken = (token: string): any => {
  return (jwt as any).verify(token, process.env.JWT_SECRET || "defaultsecret");
};