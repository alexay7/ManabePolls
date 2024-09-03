import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";
import pluginReact from "eslint-plugin-react";


export default [
    {files: ["**/*.{js,mjs,cjs,ts,jsx,tsx}"]},
    {languageOptions: { globals: globals.node }},
    pluginJs.configs.recommended,
    ...tseslint.configs.recommended,
    pluginReact.configs.flat.recommended,
    {
        languageOptions: {
            globals: globals.node,
        },
        "rules": {
            // semicolon required
            "semi": ["error", "always"],
            // unused variables warn (ignore _)
            "@typescript-eslint/no-unused-vars": ["warn", { "argsIgnorePattern": "^_" }],
            // Indent 4 tabs
            indent: ['error', 4],
        }
    },
];