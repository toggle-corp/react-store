`PieChart` (component)
======================

PieChart is used to represent categorical data by dividing a circle into
proportional segments. Each arc represents a proportion of each category.

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
defaultValue: `schemeSet3`


### `data`

Array of elements to be visualized.
Each data element consist of a label an value.

type: `arrayOf[object Object]`
defaultValue: `[]`


### `labelSelector` (required)

Select the label of data element

type: `func`


### `setSaveFunction`

Handle save functionality

type: `func`
defaultValue: `() => {}`


### `valueSelector` (required)

Select value of data element

type: `func`

