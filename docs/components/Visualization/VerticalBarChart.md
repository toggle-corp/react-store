`VerticalBarChart` (component)
==============================

VerticalBarChart represents categorical data with vertical bars. Height of each bar represent
the value of data element.

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


### `data` (required)

Array of data elements each having a label and value

type: `arrayOf[object Object]`


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


### `onBarMouseOver`

Handle mouseover over a bar

type: `func`
defaultValue: `undefined`


### `setSaveFunction`

Handle chart saving functionality

type: `func`
defaultValue: `undefined`


### `showAxis`

if true, show axis

type: `bool`
defaultValue: `true`


### `showTooltip`

if ture, tooltip is visible

type: `bool`
defaultValue: `false`


### `tooltipContent`

Handle the contents of tooltip

type: `func`
defaultValue: `undefined`


### `valueSelector` (required)

Select the value of element

type: `func`

