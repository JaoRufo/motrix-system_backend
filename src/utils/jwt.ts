import jwt, { SignOptions } from 'jsonwebtoken';

export interface JwtPayload {
  id: number;
  username: string;
  role: string;
  status: string;
}

export const generateToken = (payload: JwtPayload): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET não configurado');
  }
  const options: SignOptions = {
    expiresIn: process.env.JWT_EXPIRES_IN || '24h'
  };
  return jwt.sign(payload, secret, options);
};

export const verifyToken = (token: string): JwtPayload => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET não configurado');
  }
  return jwt.verify(token, secret) as JwtPayload;
};
