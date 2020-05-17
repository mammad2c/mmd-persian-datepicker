import resolve from "rollup-plugin-node-resolve";
import commonjs from "rollup-plugin-commonjs";
import sourceMaps from "rollup-plugin-sourcemaps";
import typescript from "rollup-plugin-typescript2";
import json from "rollup-plugin-json";
import postcss from "rollup-plugin-postcss";
import { terser } from "rollup-plugin-terser";
import postcssFlexbugsFixes from "postcss-flexbugs-fixes";
import postcssPresetEnv from "postcss-preset-env";
import path from "path";
import pkg from "./package.json";

const isProduction = process.env.NODE_ENV === "production";

export default {
  input: `src/index.ts`,
  output: [
    {
      exports: "named",
      file: pkg.main,
      name: "MmdPersianDatepicker",
      format: "umd",
      sourcemap: true,
      globals: { "moment-jalaali": "moment" },
    },
  ],
  // Indicate here external modules you don't wanna include in your bundle (i.e.: 'lodash')
  external: [...Object.keys(pkg.dependencies)],
  watch: {
    include: "src/**",
  },
  plugins: [
    // Allow json resolution
    json(),
    // Compile TypeScript files
    typescript({
      useTsconfigDeclarationDir: true,
    }),
    // Allow bundling cjs modules (unlike webpack, rollup doesn't understand cjs)
    commonjs(),
    // Allow node_modules resolution, so you can use 'external' to control
    // which external modules to include in the bundle
    // https://github.com/rollup/rollup-plugin-node-resolve#usage
    resolve(),

    // Resolve source maps to the original source
    postcss({
      plugins: [
        postcssFlexbugsFixes,
        postcssPresetEnv({
          autoprefixer: {
            flexbox: "no-2009",
            overrideBrowserslist: [
              "last 10 versions",
              "> 1%",
              "ie 10",
              "not op_mini all",
            ],
          },
          stage: 3,
        }),
      ],
      extract: path.resolve("dist/mmd-persian-datepicker.css"),
    }),
    sourceMaps(),
    isProduction && terser(),
  ],
};
