import { jwt } from "#constants/env";
import { TokenTypes } from "#constants/index";
import { CatchAllError } from "#decorators/index";
import Service from "#structures/Service";
import { addDays, addMinutes, getUnixTime } from "date-fns";

@CatchAllError
export default class TokenService extends Service {
  private async create(userId: string, exp: number, type: TokenTypes) {
    return this.ctx.jwt.sign({
      sub: userId,
      iat: Date.now(),
      exp,
      type
    });
  }

  public async createAccess(userId: string) {
    const expiration = addMinutes(new Date(), jwt.expireMinutes); 
    const token = await this.create(userId, getUnixTime(expiration), TokenTypes.Access);
    return { expiration: expiration.toISOString(), token };
  }

  public async createRefresh(userId: string) {
    const expiration = addDays(new Date(), jwt.expireDays); 
    const token = await this.create(userId, getUnixTime(expiration), TokenTypes.Refresh);
    return { expiration: expiration.toISOString(), token };
  }
}
