import type { Context } from "#structures/Route";

export default abstract class Service {
  public constructor(protected ctx: Context) {};
}
