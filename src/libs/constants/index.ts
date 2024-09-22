/* eslint-disable typescript/no-shadow */
export const enum RouteMetadata {
    Register = "route:registers",
    Validation = "route:validations",
    Detail = "route:details",
    AuthLevel = "route:authlevel"
}

export const enum LoggingLevel {
    Silent = 0,
    Stdout = 1,
    JustShowError = 2
}

export const enum AuthLevel {
    None = 0,
    User = 1,
    Admin = 2
}

export const enum TokenTypes {
    Access = 0,
    Refresh = 1,
    EmailVerification = 2,
    ResetPassword = 3
}

export const enum ServiceNames {
    Token = 0,
    User = 1,
    Email = 2
}
