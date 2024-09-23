# elysia-template

<center>

![elysia](https://elysiajs.com/assets/elysia_v.webp)

</center>

Simple backend service using bun stack (Elysia, Drizzle)

## Features

- Database: query based database using drizzle and postgreesql
- Authentication and Authorization: using jwt
- Error Handling: Centralized error handling
- Api Documentation: done by swagger

## Example

### Adding Route

Create `./src/routes/ExampleRoute.ts` and make classes inherited from [#structures/Route](./src/libs/structures/Route.ts)

```ts

import { AuthLevel } from "#constants/index";
import { AddDetail, ApplyOptions, Mount } from "#decorators/index";
import type { Context, RouteOptions } from "#structures/Route";
import Route from "#structures/Route";

// add / define the route options
@ApplyOptions<RouteOptions>({
    name: "Example",
    prefix: "/example",
    description: "Oh! Example Route!",
    authLevel: AuthLevel.User
})
export default class ExampleRoute extends Route {

    // adding conroller
    @Mount("GET", "/")
    @AddDetail({ description: "Example Controller" })
    public indexController(ctx: Context) {

        // standarized output
        return this.json({
            example: "Lorem ipsum dolor sit amet"
        }, "get example success!");
    }
}

```

for socket controller you can define it like this

```ts

import { ApplyOptions, Mount } from "#decorators/index";
import type { RouteOptions, WebsocketController } from "#structures/Route";

@ApplyOptions<RouteOptions>({
    prefix: "/"
})
export default class ExampleRoute extends Route {

    @Mount("WS", "/")
    public wsController: WebsocketController = {
        open(ws) {
            ws.send(`Connection open with id: ${ws.id}`);
        },
        message(ws, message) {
            ws.send(message);
        },

        close(ws) {
            console.log(`Connection closed with id: ${ws.id}`);
        }
    };
}

```

> [!WARNING]
> Remember to use default export !

### Making Unite Test

```ts
import { describe, it, expect } from "bun:test";
import EliTest from "tests/utils/EliIntegration";
import RouteTest from "tests/utils/RouteTest";
import ExampleRoute from "src/routes/ExampleRoutes";

const route = new RouteTest(EliTest, new RouteTest());

describe("Example Route!", () => {
    it("should return Lorem ipsum dolor sit amet", async () => {
        const { bodyResult } = await route.req("indexController");

        expect(bodyResult.status).toBe(200);
        expect(bodyResult.message).toBe("get example success!");
        expect(bodyResult.data).toEqual({
            example: "Lorem ipsum dolor sit amet"
        });
    });
});
```

> [!TIP]
> Because its somehow TypeSafety you'll find it easy making the test cases