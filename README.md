# still in development

![mmd-persian-datepicker](https://user-images.githubusercontent.com/16647736/50376733-8caa3680-0626-11e9-9661-4e83145e21f2.png)

## mmd-persian-datepicker

A pure js persian datepicker, powered by TypeScript :)

## how to test

you have to installed [NodeJS v8](https://nodejs.org) up and recommended install [Yarn](https://yarnpkg.com/https://yarnpkg.com/).

```
- git clone https://github.com/mammad2c/mmd-persian-datepicker
- yarn or npm i
- yarn start or npm start
- open `example/index.html` at your browser
```

## Dependencies:

- [moment js](https://github.com/moment/moment)
- [moment jalaali](https://github.com/jalaali/moment-jalaali)

## Todo:

- [ ] writing tests.
- [ ] modular codes.

#### Configs:

- [x] `defaultValue`: initial value, should be today by default on initial render.
- [x] `numberOfMonths`: how many months should be rendered.
- [x] `mode`: `single` or `range`.
- [x] `disabledDates`: disable only some dates.
- [ ] `enabledDates`: disable whole picker's dates except these dates.
- [x] `inline`: render picker like a normal calendar.
- [x] `maxDate`: maximum date user can select.
- [x] `minDate`: minimum date user can select.
- [x] `highlightWeekends`: show weekends with a different color.
- [ ] `monthChanger`: enable selecting from months, also by set `false` could disable it.
- [ ] `yearChanger`: enable selecting from years, also by set `false` could disable it.
- [ ] `altInput`: alt input for actual sending data to server.
- [ ] `altFormat`: date formats for `altInput`.
- [ ] `readonly`: input could not editable directly. only changes by picker.
- [ ] `clearButton`: render a button to clear selected date(s), useful when `multiple` is `true`.
- [ ] `todayButton`: go to today on picker.
- [ ] `firstDayOfWeek`: weeks start days. for example on jalali is `saturday` and on georgian is `monday`. should be configurable.

#### Events:

- [ ] `onBeforeOpen`: the event fires before datepicker open.
- [ ] `onBeforeClose`: the event fires before datepicker close.
- [ ] `onAfterMonthChange`: the event fires after changing the month.
- [ ] `onAfterYearChange`: the event fires after changing the year.
- [ ] `onDayCreate`: handle rendering date creates. adding custom element to day items and ... .

#### Methods:

- [x] `destroy`: destroy instance, remove addEventListeners and ... for nothing exists about the picker. this feature enable using this library in SPA frameworks such as `react`, `vue` and ... .
- [ ] `jumpToDate`: move picker to specific date.
- [x] `setDate`: set picker selected date(s) programmatically.
- [ ] `toggle`: toggle between `open` and `close` of picker.
