export const JWTTokenRegex = /^[\w-]{2,}(?:\.[\w-]{2,}){2}$/u;
export const UUIDRegex = /^[\da-f]{8}(?:-[\da-f]{4}){3}-[\da-f]{12}$/u;
export const ISOStringRegex = /(?<temp3>\d{4}-[01]\d-[0-3]\dT[0-2](?:\d:[0-5]){2}\d\.\d+)|(?<temp2>\d{4}-[01]\d-[0-3]\dT[0-2](?:\d:[0-5]){2}\d)|(?<temp1>\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d)/u;
// eslint-disable-next-line require-unicode-regexp
export const emailRegex = /^[\w-.]+@(?<temp1>[\w-]+\.)+[\w-]{2,4}$/;
