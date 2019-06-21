`ClusterForceLayout` (component)
================================

ClusterForceLayout allows to represent the hierarchies and interconnection
between entities in the form of nodes and links. The nodes are further grouped together.

Props
-----

### `boundingClientRect` (required)

Size of the parent element/component (passed by the Responsive hoc)

type: `shape[object Object]`


### `className`

Additional css classes passed from parent.

type: `string`
defaultValue: `''`


### `colorScheme`

Array of colors as hex color codes used to color each element

type: `func`
defaultValue: `interpolateRainbow`


### `data`

The data points for each element

type: `arrayOf[object Object]`
defaultValue: `{
}`


### `groupSelector`

Select group id of each element

type: `func`
defaultValue: `d => d.cluster`


### `idSelector` (required)

Select unique id of each element

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


### `onHover`

Handle hover action

type: `func`
defaultValue: `() => {}`


### `scaleFactor`

Scale the size of each element.
Radius of each element is calculated as valueSelector(element) * scaleFactor;

type: `number`
defaultValue: `2`


### `setSaveFunction`

Handle svg save functionality

type: `func`
defaultValue: `() => {}`


### `valueSelector`

Select value of each element

type: `func`
defaultValue: `d => d.score`

