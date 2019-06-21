`ForceDirectedGraph` (component)
================================

Represents the  network of nodes in force layout with many-body force.
Force directed graph helps to visualize connections between nodes in a network.
It can help to uncover relationships between groups as it naturally clusters well
connected nodes.
see <a href="https://github.com/d3/d3-force">d3-force</a>

Props
-----

### `boundingClientRect` (required)

Size of the parent element/component (passed by the Responsive hoc)

type: `shape[object Object]`


### `circleRadius`

The radius of each voronoi circle

type: `number`
defaultValue: `30`


### `className`

Additional css classes passed from parent

type: `string`
defaultValue: `''`


### `colorScheme`

Array of colors as hex color codes

type: `arrayOf[object Object]`
defaultValue: `schemePaired`


### `data`

The data in the form of array of nodes and links
Each node element must have an id, label and corresponding group
Each link element is in the form of { source: sourceId, target: targetId value: number }

type: `shape[object Object]`
defaultValue: `{
    nodes: [],
    links: [],
}`


### `distance`

Length of each link

type: `number`
defaultValue: `5`


### `groupSelector`

Select group of each node element

type: `func`
defaultValue: `d => d.index`


### `idSelector` (required)

Select a unique id for each node

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

Handle diagram save functionality

type: `func`
defaultValue: `() => {}`


### `useVoronoi`

if true, use voronoi interpolation

type: `bool`
defaultValue: `true`


### `valueSelector`

Select the value for link
The value of link is corresponding reflected on the width of link

type: `func`
defaultValue: `() => 1`

