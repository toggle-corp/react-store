`Organigram` (component)
========================

Organigram shows the structure and relationships of nodes as a hierarchy.

Props
-----

### `boundingClientRect` (required)

Size of the parent element/component (passed by the Responsive hoc)

type: `shape[object Object]`


### `childrenSelector`

Accessor function to return array of data representing the children

type: `func`
defaultValue: `d => d.children`


### `className`

Additional class name for styling

type: `string`
defaultValue: `''`


### `data`

Hierarchical data structure that can be computed to form a hierarchical layout
<a href="https://github.com/d3/d3-hierarchy">d3-hierarchy</a>

type: `shape[object Object]`
defaultValue: `[]`


### `disabled`

if true no click events on nodes

type: `bool`
defaultValue: `false`


### `fillColor`

Default color for nodes

type: `string`
defaultValue: `'#ffffff'`


### `idSelector` (required)

Access the id of each data element

type: `func`


### `labelSelector`

Access the individual label of each data element

type: `func`
defaultValue: `d => d.name`


### `margins`

Margin object with properties for the four sides (clockwise from top)

type: `shape[object Object]`
defaultValue: `{
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
}`


### `nodeSize`

Cluster layout's node size
<a href="https://github.com/d3/d3-hierarchy#cluster_nodeSize">nodeSize</a>

type: `arrayOf[object Object]`
defaultValue: `[150, 300]`


### `onSelection`

Handle selection of nodes

type: `func`
defaultValue: `() => {}`


### `selectColor`

Nodes color when selected

type: `string`
defaultValue: `'#afeeee'`


### `value`

Selected data element

type: `string`
defaultValue: `undefined`

