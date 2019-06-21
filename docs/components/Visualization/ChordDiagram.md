`ChordDiagram` (component)
==========================

Chord diagram displays the inter-relationships between data in a matrix.The data are arranged
radially around a circle with the relationships between the data points typically drawn as arcs
connecting the data.
see <a href="https://github.com/d3/d3-chord">d3-chord</a>

Props
-----

### `boundingClientRect` (required)

Size of the parent element/component (passed by the Responsive hoc)

type: `shape[object Object]`


### `className`

Additional sscss classes passed from parent

type: `string`
defaultValue: `''`


### `colorScheme`

Array of colors as hex color codes

type: `arrayOf[object Object]`
defaultValue: `schemePaired`


### `data`

The nxn square matrix representing the directed flow amongst a network of n nodes
see <a href="https://github.com/d3/d3-chord">d3-chord</a>

type: `arrayOf[object Object]`
defaultValue: `[]`


### `labelModifier`

Modifier to handle label info onMouseOver

type: `func`
defaultValue: `d => d`


### `labelsData` (required)

Array of labels

type: `arrayOf[object Object]`


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


### `showLabels`

Handle visibility of labels on chord

type: `bool`
defaultValue: `true`


### `showTooltip`

Handle visibility of tooltip

type: `bool`
defaultValue: `true`

