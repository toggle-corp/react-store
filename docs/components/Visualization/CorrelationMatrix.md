`CorrelationMatrix` (component)
===============================

CorrelationMatrix visualizes the correlation coefficients of multiple variables as colors in a grid

Props
-----

### `boundingClientRect` (required)

Size of the parent element/component (passed by the Responsive hoc)

type: `shape[object Object]`


### `className`

Additional css classes passed from parent

type: `string`
defaultValue: `''`


### `colorScheme`

Array of colors as hex color codes

type: `func`
defaultValue: `interpolateGnBu`


### `data` (required)

Data to be represented
labels: labels are variables
values: a square matrix with same variables show in rows and columns with each cell representing correlation between two variables

type: `shape[object Object]`


### `margins`

Margins for the chart

type: `shape[object Object]`
defaultValue: `{
    top: 50,
    right: 0,
    bottom: 10,
    left: 100,
}`


### `setSaveFunction`

Handle save functionality

type: `func`
defaultValue: `() => {}`


### `showLabels`

Show labels on the diagram or not

type: `bool`
defaultValue: `true`


### `tiltLabels`

Tilt labels or not

type: `bool`
defaultValue: `false`

