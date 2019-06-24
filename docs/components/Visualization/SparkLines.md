`SparkLines` (component)
========================

SparkLines is a small line chart which shows the general shape of variation.
It can be used to visualize trends and statistical information.

Props
-----

### `boundingClientRect` (required)

Size of the parent element/component (passed by the Responsive hoc)

type: `shape[object Object]`


### `className`

Additional css classes passed from parent

type: `string`
defaultValue: `''`


### `data`

Array of data elements each having xvalue and yvalue

type: `arrayOf[object Object]`
defaultValue: `[]`


### `fill`

if true, fill the area under the line

type: `bool`
defaultValue: `true`


### `margins`

Margins for the chart

type: `shape[object Object]`
defaultValue: `{
    top: 2,
    right: 0,
    bottom: 2,
    left: 0,
}`


### `onHover`

Handle onHover functionality

type: `func`
defaultValue: `() => {}`


### `xLabelModifier`

Modify the x-value label

type: `func`
defaultValue: `d => d`


### `xValueSelector` (required)

Access the x-value of data point

type: `func`


### `yLabelModifier`

Modify the y-value label

type: `func`
defaultValue: `d => d`


### `yValueSelector` (required)

Access the y-value of data point

type: `func`

