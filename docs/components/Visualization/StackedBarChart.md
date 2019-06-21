`StackedBarChart` (component)
=============================

StackedBarChart groups multiple variables on top of each other across multiple
groups. It helps to visualize the relationship among members of the group and compare the values across multiple groups.

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
defaultValue: `schemePaired`


### `data` (required)

The data to be visualized
Array of categorical data grouped together
Example data:
[{ state: 'Province 1', river: 10, hills: 20 }, { state: 'Province 2', river: 1, hills: 3}]

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
    right: 0,
    bottom: 40,
    left: 40,
}`


### `setSaveFunction`

Handle save functionality

type: `func`
defaultValue: `() => {}`

