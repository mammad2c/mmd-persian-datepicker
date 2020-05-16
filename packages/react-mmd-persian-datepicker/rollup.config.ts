import resolve from "rollup-plugin-node-resolve";
import commonjs from "rollup-plugin-commonjs";
import sourceMaps from "rollup-plugin-sourcemaps";
import babel from "rollup-plugin-babel";
import typescript from "rollup-plugin-typescript2";
import json from "rollup-plugin-json";
import { uglify } from "rollup-plugin-uglify";

const isProduction = process.env.NODE_ENV === "production";

const pkg = require("./package.json");

export default {
  input: `src/ReactComponent.tsx`,
  output: [
    {
      file: pkg.main,
      name: "MmdPersianDatepicker",
      format: "umd",
      sourcemap: true,
      globals: {
        react: "React",
        "mmd-persian-datepicker": "MmdPersianDatepicker",
      },
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
    typescript({}),
    // Allow bundling cjs modules (unlike webpack, rollup doesn't understand cjs)
    commonjs(),
    // Allow node_modules resolution, so you can use 'external' to control
    // which external modules to include in the bundle
    // https://github.com/rollup/rollup-plugin-node-resolve#usage
    resolve(),
    babel({
      presets: [
        "@babel/preset-env",
        "@babel/preset-typescript",
        "@babel/preset-react",
      ],
      plugins: [
        "@babel/plugin-proposal-class-properties",
        "@babel/transform-runtime",
      ],
      exclude: "node_modules/**",
      runtimeHelpers: true,
    }),
    // Resolve source maps to the original source
    sourceMaps(),
    isProduction && uglify(),
  ],
};
