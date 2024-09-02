import EliTest from "tests/utils/EliIntegration";
import TokenService from "#services/TokenService";
import type { Context } from "#structures/Route";

const ctx = EliTest.eli.decorator as Context;

const service = new TokenService(ctx);

export const createAccessToken = (id: string) => service.createAccess(id).then(x => x.token);
export const createRefreshToken = (id: string) => service.createRefresh(id).then(x => x.token);

export const tokenDetail = (token: string) => ctx.jwt.verify(token);
