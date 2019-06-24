`BarChart` (component)
======================

Represent categorical data with bars with values proportional to the
length of each bar.

Props
-----

### `barPadding`

Padding between bars

type: `number`
defaultValue: `0.01`


### `boundingClientRect` (required)

Size of the parent element/component (passed by the Responsive hoc)

type: `object`


### `className`

Data
[{
   xKey: value,
   yKey: value,
 },...]

type: `string`
defaultValue: `''`


### `data` (required)

The data to be visualized

type: `arrayOf[object Object]`


### `highlightBarX`

Highlight which bar

type: `union(string|number)`
defaultValue: `null`


### `margins`

Chart Margins

type: `shape[object Object]`
defaultValue: `{
    top: 10,
    right: 10,
    bottom: 30,
    left: 30,
}`


### `maxNuOfRow`

if length is greater, than rotate X-axis label

type: `number`
defaultValue: `30`


### `tooltipRender` (required)

Renderer for tooltip

type: `func`


### `updateFromProps`

key for for x-axis and y-axis in Data

type: `bool`
defaultValue: `true`


### `xGrid`

Show x grid lines

type: `bool`
defaultValue: `true`


### `xKey` (required)

key for x-axis data

type: `string`


### `xTickFormat`

Tick format for x-axis

type: `func`
defaultValue: `d => d`


### `yGrid`

Show y grid lines

type: `bool`
defaultValue: `true`


### `yKey` (required)

key for y-axis data

type: `string`


### `yTickFormat`

Tick format for y-axis

type: `func`
defaultValue: `d => d`


### `yTicks`

No of y ticks

type: `number`
defaultValue: `undefined`

