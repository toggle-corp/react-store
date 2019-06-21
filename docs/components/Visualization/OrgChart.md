`OrgChart` (component)
======================

Organigram shows the structure and relationships of nodes as a hierarchy.

Props
-----

### `boundingClientRect` (required)

Width and height of the container

type: `shape[object Object]`


### `childSelector`

Accessor function to return array of data representing the children

type: `func`
defaultValue: `d => d.children`


### `className`

Additional class name for styling

type: `string`
defaultValue: `''`


### `data`

Hierarchical data to be visualized

type: `shape[object Object]`
defaultValue: `{}`


### `disabled`

defaultValue: `false`


### `idSelector`

Access the id of each data element

type: `func`
defaultValue: `d => d.id`


### `labelSelector`

Access the individual label of each data element

type: `func`
defaultValue: `d => d.name`


### `margins`

Margin object with properties for the four sides(clockwise from top)

type: `shape[object Object]`
defaultValue: `{
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
}`


### `nodeSize`

Cluster minimum layout's node size

type: `shape[object Object]`
defaultValue: `{
    minNodeWidth: 150,
    minNodeHeight: 50,
}`


### `onSelection`

Handle selection of nodes

type: `func`
defaultValue: `() => []`


### `setSaveFunction`

Function to pass save function to parent component

type: `func`
defaultValue: `() => {}`


### `value`

Selected values (nodes)

type: `array`
defaultValue: `[]`

