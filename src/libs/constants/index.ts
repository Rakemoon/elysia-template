export const enum RouteMetadata {
  Register = "route:registers",
  Validation = "route:validations",
  Detail = "route:details",
}

export const enum LoggingLevel {
  Silent,
  Stdout,
}

export const enum AuthLevel {
  None,
  User,
  Admin
}

export const enum TokenTypes {
  Access,
  Refresh,
}

export const enum ServiceNames {
  Token,
  User,
}
