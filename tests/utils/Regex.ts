export const JWTTokenRegex = /^[A-Za-z0-9_-]{2,}(?:\.[A-Za-z0-9_-]{2,}){2}$/;
export const UUIDRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
export const ISOStringRegex = /(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+)|(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d)|(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d)/;
export const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
