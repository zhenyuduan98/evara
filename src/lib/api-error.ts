import { NextResponse } from 'next/server';

export class ApiError extends Error {
  constructor(public statusCode: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

export function errorResponse(error: unknown, defaultStatus = 500) {
  if (error instanceof ApiError) {
    return NextResponse.json(
      { error: error.message, statusCode: error.statusCode },
      { status: error.statusCode }
    );
  }
  const message = error instanceof Error ? error.message : 'Internal Server Error';
  return NextResponse.json(
    { error: message, statusCode: defaultStatus },
    { status: defaultStatus }
  );
}

export function badRequest(msg = 'Bad Request') { return new ApiError(400, msg); }
export function unauthorized(msg = 'Unauthorized') { return new ApiError(401, msg); }
export function forbidden(msg = 'Forbidden') { return new ApiError(403, msg); }
export function notFound(msg = 'Not Found') { return new ApiError(404, msg); }
