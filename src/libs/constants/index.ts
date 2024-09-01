export const enum RouteMetadata {
  Register = "route:registers",
  Validation = "route:validations",
  Detail = "route:details",
  AuthLevel = "route:authlevel"
}

export const enum LoggingLevel {
  Silent,
  Stdout,
  JustShowError,
}

export const enum AuthLevel {
  None,
  User,
  Admin
}

export const enum TokenTypes {
  Access,
  Refresh,
  EmailVerification,
  ResetPassword,
}

export const enum ServiceNames {
  Token,
  User,
  Email,
}
