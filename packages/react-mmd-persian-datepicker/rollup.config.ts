import resolve from "rollup-plugin-node-resolve";
import commonjs from "rollup-plugin-commonjs";
import sourceMaps from "rollup-plugin-sourcemaps";
import babel from "rollup-plugin-babel";
import typescript from "rollup-plugin-typescript2";
import json from "rollup-plugin-json";
import postcss from "rollup-plugin-postcss";
import { uglify } from "rollup-plugin-uglify";
import postcssFlexbugsFixes from "postcss-flexbugs-fixes";
import postcssPresetEnv from "postcss-preset-env";
import path from "path";
import pkg from "./package.json";

const isProduction = process.env.NODE_ENV === "production";

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
    typescript(),
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
      extensions: [".js", ".jsx", ".ts", ".tsx"],
      plugins: [
        "@babel/plugin-proposal-class-properties",
        "@babel/transform-runtime",
      ],
      exclude: "node_modules/**",
      runtimeHelpers: true,
    }),
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
    // Resolve source maps to the original source
    sourceMaps(),
    isProduction && uglify(),
  ],
};
