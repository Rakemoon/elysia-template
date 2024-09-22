import { common, modules, node, stylistic, typescript } from "@rakemoon/eslint-config";

/** @type {import("eslint").Linter.Config[]} */
export default [
    ...common,
    ...modules,
    ...node,
    ...stylistic,
    {
        ...typescript[0],
        rules: {
            ...typescript[0].rules,
            "typescript/explicit-function-return-type": "off",
            "typescript/explicit-module-boundary-types": "off"
        }
    }
];
