import commonjs from "rollup-plugin-commonjs";
import sourceMaps from "rollup-plugin-sourcemaps";
import babel from "rollup-plugin-babel";
import typescript from "rollup-plugin-typescript2";
import json from "@rollup/plugin-json";
import { terser } from "rollup-plugin-terser";
import pkg from "./package.json";

const isProduction = process.env.NODE_ENV === "production";

const extensions = [".js", ".jsx", ".ts", ".tsx"];

export default {
  input: `src/index.ts`,
  output: [
    {
      file: pkg.main,
      name: "ConverterJalaliUniversalDatepicker",
      format: "umd",
      sourcemap: true,
    },
  ],

  external: [...Object.keys(pkg.dependencies)],
  // Indicate here external modules you don't wanna include in your bundle (i.e.: 'lodash')
  watch: {
    include: "src/**",
  },
  plugins: [
    // Allow json resolution
    json(),
    // Compile TypeScript files
    typescript(),
    // Allow bundling cjs modules (unlike webpack, rollup doesn't understand cjs)
    commonjs(),
    // Allow node_modules resolution, so you can use 'external' to control
    // which external modules to include in the bundle
    // https://github.com/rollup/rollup-plugin-node-resolve#usage
    babel({
      presets: ["@babel/preset-env", "@babel/preset-typescript"],
      extensions,
      plugins: [
        "@babel/plugin-proposal-class-properties",
        "@babel/transform-runtime",
      ],
      exclude: "node_modules/**",
      runtimeHelpers: true,
    }),
    // Resolve source maps to the original source
    sourceMaps(),
    isProduction && terser(),
  ],
};
