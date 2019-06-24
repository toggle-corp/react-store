`StreamGraph` (component)
=========================

StreamGraph is a variation of Stacked Bar Chart. The variables are  plotted against a
fixed axis and the values are displaced around a variying central baseline.
It helps to visualize high volume data and changes in data values over time of
different categories. StreamGraph are used to give general view of the data.

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

Array of colors as hex color codes.
It is used if colors are not provided through data.

type: `arrayOf[object Object]`
defaultValue: `schemeSet2`


### `data` (required)

The data to be visualized.
Array of categorical data grouped together where is group has a group identifier.
Example data: [{ state: 'Province 1', river: 10, hills: 20 }, { state: 'Province 2', river: 1, hills: 3}]

type: `arrayOf[object Object]`


### `labelName` (required)

Name of the group identifier key

type: `string`


### `labelSelector` (required)

Select the identifier for group

type: `func`


### `margins`

Margins for the chart

type: `shape[object Object]`
defaultValue: `{
    top: 10,
    right: 10,
    bottom: 50,
    left: 50,
}`


### `setSaveFunction`

Handle save functionality

type: `func`
defaultValue: `() => {}`

