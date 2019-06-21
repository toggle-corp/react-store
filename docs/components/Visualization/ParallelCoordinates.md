`ParallelCoordinates` (component)
=================================

Parallel Coordinates visualization is used to compare multivariate numeric data.
It can be used to view relationships between variables.

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


### `colorSelector`

Color selector for each group

type: `func`
defaultValue: `undefined`


### `data`

Data to be visualized. It consists of array of categorical data grouped
together.
Example: [{ name: "AMC Ambassador Brougham", economy (mpg): 13, cylinders: 8 }, ...]
For each variable an axis is created and each item is represented by a line

type: `arrayOf[object Object]`
defaultValue: `[]`


### `ignoreProperties` (required)

Property keys to be ignored when creating axis

type: `arrayOf[object Object]`


### `labelSelector` (required)

The label name of group

type: `func`


### `margins`

Margins for the chart

type: `shape[object Object]`
defaultValue: `{
    top: 40,
    right: 10,
    bottom: 20,
    left: 10,
}`


### `setSaveFunction`

Handler function to save the generated svg

type: `func`
defaultValue: `() => {}`

