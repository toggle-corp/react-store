`SimpleVerticalBarChart` (component)
====================================

Represent categorical data with vertical bars, heights are proportional to the
data values.

Props
-----

### `bandPadding`

Padding between two bars as proportion to bar width

type: `number`
defaultValue: `0.2`


### `boundingClientRect` (required)

Size of the parent element/component (passed by the Responsive hoc)

type: `shape[object Object]`


### `className`

Additional css classes passed from parent

type: `string`
defaultValue: `''`


### `data`

Array of data elements each having a label and value

type: `arrayOf[object Object]`
defaultValue: `[]`


### `exponent`

if exponent scaleType, set the current exponent to specified value

type: `number`
defaultValue: `1`


### `hideXAxis`

if true, x-axis is hidden

type: `bool`
defaultValue: `false`


### `hideYAxis`

if true, y-axis is hidden

type: `bool`
defaultValue: `false`


### `labelSelector` (required)

Select the label of element

type: `func`


### `margins`

Margins for the chart

type: `shape[object Object]`
defaultValue: `{
    top: 16,
    right: 16,
    bottom: 16,
    left: 16,
}`


### `noOfTicks`

Number of ticks to be shown

type: `number`
defaultValue: `5`


### `scaleType`

type of scaling used for bar length
one of ['exponent', 'log', 'linear']
see <a href="https://github.com/d3/d3-scale/blob/master/README.md">d3.scale</a>

type: `string`
defaultValue: `'linear'`


### `showGrids`

if true, grid lines are drawn

type: `bool`
defaultValue: `true`


### `showTicks`

if true, tick on axis are shown

type: `bool`
defaultValue: `true`


### `tickFormat`

defaultValue: `undefined`


### `valueSelector` (required)

Select the value of element

type: `func`

