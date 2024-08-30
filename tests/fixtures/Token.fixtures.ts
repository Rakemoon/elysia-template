import EliTest from "tests/utils/EliIntegration";
import TokenService from "#services/TokenService";
import type { Context } from "#structures/Route";

const service = new TokenService(EliTest.eli.decorator as Context);

export const createAccessToken = (id: string) => service.createAccess(id).then(x => x.token);
