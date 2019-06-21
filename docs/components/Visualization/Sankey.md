`Sankey` (component)
====================

Sankey is helps to visualize flow and quantity in proportion to one another.
The width of the lines show respective magnitudes.
<a href="https://github.com/d3/d3-sankey">Sankey</a>

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

Array of colors as hex color codes

type: `arrayOf[object Object]`
defaultValue: `schemePaired`


### `data`

the data to use to plot pie chart

type: `shape[object Object]`
defaultValue: `{
    nodes: [],
    links: [],
}`


### `fontSizeExtent`

[minFontSize, maxFontSize] for the labels.
Each label is scaled based on its value

type: `arrayOf[object Object]`
defaultValue: `[14, 30]`


### `labelSelector`

Select label for the data

type: `func`
defaultValue: `d => d.label`


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

Handler function to save the generated svg

type: `func`
defaultValue: `() => {}`


### `valueSelector`

Select the value for the unit data

type: `func`
defaultValue: `d => d.value`

