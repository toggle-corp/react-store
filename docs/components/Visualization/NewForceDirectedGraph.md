`NewForceDirectedGraph` (component)
===================================

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


### `className`

Additional css classes passed from parent

type: `string`
defaultValue: `''`


### `clusterSize`

Length of each link in cluster

type: `number`
defaultValue: `5`


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


### `groupSelector`

Select a group for each node

type: `func`
defaultValue: `d => d.index`


### `highlightClusterId`

Id of the node to be highlighted

type: `node`
defaultValue: `undefined`


### `idSelector` (required)

Select a unique id for each node

type: `func`


### `labelSelector`

Select a label for each node

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


### `onClusterSizeChange`

Handler function on cluster size changes

type: `func`
defaultValue: `() => {}`


### `onMouseOut`

type: `func`
defaultValue: `undefined`


### `onMouseOver`

type: `func`
defaultValue: `undefined`


### `radiusSelector`

Select the radius of each node

type: `func`
defaultValue: `() => 30`


### `setSaveFunction`

Handle diagram save functionality

type: `func`
defaultValue: `() => {}`


### `useVoronoi`

If true, use voronoi interpolation

type: `bool`
defaultValue: `false`


### `valueSelector`

Select the value for link
The value of link is corresponding reflected on the width of link

type: `func`
defaultValue: `() => 1`

