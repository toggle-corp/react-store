`SunBurst` (component)
======================

SunBurst shows hierarchical data as a series of rings and slices. Each slice represents a
node of the tree structure. SunBurst can be thought as a multi level pie chart.

Props
-----

### `boundingClientRect` (required)

Size of the parent element/component (passed by the Responsive hoc)

type: `shape[object Object]`


### `childrenSelector`

Accessor function to return children of node

type: `func`
defaultValue: `d => d.children`


### `className`

Additional css classes passed from parent

type: `string`
defaultValue: `''`


### `colorScheme`

Array of colors as hex color codes

type: `arrayOf[object Object]`
defaultValue: `schemePaired`


### `colorSelector`

Select a color for each node

type: `func`
defaultValue: `undefined`


### `data` (required)

Hierarchical data structure that can be computed to form a hierarchical layout
<a href="https://github.com/d3/d3-hierarchy">d3-hierarchy</a>

type: `shape[object Object]`


### `labelSelector` (required)

Select label for each node

type: `func`


### `margins`

Margins for the chart

type: `shape[object Object]`
defaultValue: `{
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
}`


### `setSaveFunction`

Handle save functionality

type: `func`
defaultValue: `() => {}`


### `showTooltip`

if true, a tooltip is shown

type: `bool`
defaultValue: `true`


### `tooltipContent`

Modify the tooltip content

type: `func`
defaultValue: `undefined`


### `valueSelector` (required)

Select the value of each node

type: `func`

