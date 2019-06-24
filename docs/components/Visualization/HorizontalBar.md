`HorizontalBar` (component)
===========================

Represent categorical data with horizontal bars with values proportional to the
length of each bar.

Props
-----

### `bandPadding`

Padding between two bars

type: `number`
defaultValue: `0.2`


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
defaultValue: `schemeSet3`


### `colorSelector`

Select a color for each bar

type: `func`
defaultValue: `undefined`


### `data`

Array of data elements each having a label and value

type: `arrayOf[object Object]`
defaultValue: `[]`


### `exponent`

if exponent scaleType, set the current exponent to specified value

type: `number`
defaultValue: `1`


### `labelSelector` (required)

Select the label of element

type: `func`


### `margins`

Margins for the chart

type: `shape[object Object]`
defaultValue: `{
    top: 24,
    right: 24,
    bottom: 24,
    left: 72,
}`


### `scaleType`

type of scaling used for bar length
one of ['exponent', 'log', 'linear']
see <a href="https://github.com/d3/d3-scale/blob/master/README.md">d3.scale</a>

type: `string`
defaultValue: `'linear'`


### `setSaveFunction`

Handle save functionality

type: `func`
defaultValue: `() => {}`


### `showGridLines`

if true, show gridlines

type: `bool`
defaultValue: `false`


### `showTooltip`

if true, show tooltip

type: `bool`
defaultValue: `false`


### `tiltLabels`

if true, tilt the labels on axis of chart

type: `bool`
defaultValue: `false`


### `tooltipContent`

Modify the contents of tooltip

type: `func`
defaultValue: `undefined`


### `valueLabelFormat`

Format a value label displayed on top of bar

type: `func`
defaultValue: `undefined`


### `valueSelector` (required)

Select the value of element

type: `func`

