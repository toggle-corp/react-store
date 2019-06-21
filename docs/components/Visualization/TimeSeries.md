`TimeSeries` (component)
========================

TimeSeries chart helps to visualize the change in value of a variable over time.
Each point in timeseries chart corresponds to a time and the variable being measured or shown.

Props
-----

### `boundingClientRect` (required)

Size of the parent element/component (passed by the Responsive hoc)

type: `object`


### `className`

Additional css classes passed from parent

type: `string`
defaultValue: `'time-series'`


### `data`

Array of data points. Each data points is an object representing
a coordinate {x , y }

type: `arrayOf[object Object]`
defaultValue: `[]`


### `margins`

Margins for the chart

type: `shape[object Object]`
defaultValue: `{
    top: 10,
    right: 10,
    bottom: 30,
    left: 30,
}`


### `showArea`

if true, show the area under TimeSeries chart

type: `bool`
defaultValue: `false`


### `tooltipRender` (required)

Renderer for tooltip

type: `func`


### `xKey` (required)

The key for x value

type: `string`


### `xTickFormat`

TickFormat for x-axis

type: `func`
defaultValue: `d => d`


### `xTicks`

Number of ticks for x-axis

type: `number`
defaultValue: `undefined`


### `yKey` (required)

The key for x value

type: `string`


### `yTickFormat`

TickFormat for x-axis

type: `func`
defaultValue: `d => d`


### `yTicks`

Number of ticks for x-axis

type: `number`
defaultValue: `undefined`

