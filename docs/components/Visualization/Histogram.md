`Histogram` (component)
=======================

Histogram shows the underlying frequency distribution of continuous data.
The area of bar indicates the frequency of occurrences of each bin. However
here the width of each bin is constant so height can represent the frequency.

Props
-----

### `boundingClientRect` (required)

Size of the parent element/component (passed by the Responsive hoc)

type: `shape[object Object]`


### `colorRange`

Array of two colors to map height of histogram

type: `arrayOf[object Object]`
defaultValue: `[color('rgba(90, 198, 198, 1)').brighter(), color('rgba(90, 198, 198, 1)').darker()]`


### `data` (required)

Array of numeric values to be represented as histogram

type: `array`


### `margins`

Margins for the chart

type: `shape[object Object]`
defaultValue: `{
    top: 10,
    right: 20,
    bottom: 30,
    left: 30,
}`


### `noOfTicks`

Number of ticks in axis

type: `number`
defaultValue: `5`


### `showAxis`

if showAxis is true, axis is shown

type: `bool`
defaultValue: `true`


### `showGrids`

if showGrids is true, grids are shown

type: `bool`
defaultValue: `true`


### `showTooltip`

show tooltip if true

type: `bool`
defaultValue: `true`


### `tickFormat`

Format the tick value shown in axis
see <a href="https://github.com/d3/d3-scale/blob/master/README.md#tickFormat">tickFormat</a>

type: `func`
defaultValue: `d => (
    Numeral.renderText({
        value: d,
        precision: 1,
        normal: true,
    })
)`


### `tooltipContent`

modify the values to be shown in tooltip when hovered over histogram

type: `func`
defaultValue: `undefined`

