`GroupedBarChart` (component)
=============================

GroupedBarChart is used to represent and compare different categories of two or more groups.
It helps to better visualize and interpret differences between categories across groups as they
are arranged side-by-side.

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
defaultValue: `schemeAccent`


### `data` (required)

The data to be visualized
values: Array of categorical data grouped together
columns: Array of category names
colors: map of columns to respective colors
Example data:
{
    values: [{ state: 'Province 1', river: 10, hills: 20 }, { state: 'Province 2', river: 1, hills: 3}],
    columns: ['river', 'hills'],
    colors: { river: '#ff00ff', hills: '#0000ff' },
}

type: `shape[object Object]`


### `groupSelector` (required)

Select a group for each data value.

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


### `xTickArguments`

Axis arguments for x-axis
See <a href="https://github.com/d3/d3-axis#axis_tickArguments">tickArguments</a>

type: `array`
defaultValue: `[]`


### `yTickArguments`

Axis arguments for y-axis
See <a href="https://github.com/d3/d3-axis#axis_tickArguments">tickArguments</a>

type: `array`
defaultValue: `[null, 's']`

