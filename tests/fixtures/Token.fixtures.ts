import TokenService from "#services/TokenService";
import type { Context } from "#structures/Route";
import EliTest from "tests/utils/EliIntegration";

const ctx = EliTest.eli.decorator as Context;

const service = new TokenService(ctx);

export const createAccessToken = async (id: string) => {
    const result = await service.createAccess(id);
    return result.token;
};
export const createRefreshToken = async (id: string) => {
    const result = await service.createRefresh(id);
    return result.token;
};

export const tokenDetail = async (token: string) => ctx.jwt.verify(token);
