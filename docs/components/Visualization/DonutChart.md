`DonutChart` (component)
========================

Donut Chart is a variation of Pie Chart with an area of center cut out.
Donut Chart de-emphasizes the use of area and focuses more on representing
values as arcs length.
<a href="https://github.com/d3/d3-shape#pies">d3.pie</a>

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

type: `arrayOf[object Object]`
defaultValue: `schemeAccent`


### `colorSelector`

Array of colors as hex color codes

type: `func`
defaultValue: `undefined`


### `data`

Data to be represented
Each data point must have a label and value field

type: `arrayOf[object Object]`
defaultValue: `[]`


### `hideLabel`

If true hide the labels from chart

type: `bool`
defaultValue: `false`


### `labelModifier`

Modifier function to change label

type: `func`
defaultValue: `undefined`


### `labelSelector` (required)

Select the label of data point

type: `func`


### `setSaveFunction`

Handle save functionality

type: `func`
defaultValue: `() => {}`


### `sideLengthRatio`

Ratio of the width of annulus to the outerRadius where outerRadius
is calculated based on the size of chart.

type: `number`
defaultValue: `0.4`


### `valueSelector` (required)

Select the value of data point

type: `func`

