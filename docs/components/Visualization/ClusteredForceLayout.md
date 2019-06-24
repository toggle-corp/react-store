`ClusteredForceLayout` (component)
==================================

ClusteredForceLayout allows to represent the hierarchies and interconnection between entities in the form of nodes and links. The nodes are further grouped together.

Props
-----

### `boundingClientRect` (required)

Size of the parent element/component (passed by the Responsive hoc)

type: `shape[object Object]`


### `circleRadiusExtent`

The extent of circle radius as [minRadius, maxRadius]
Each node is scaled based on the number of links it is associated with
node with minimum number of links will have minRadius and with maximum number of links will have  maxRadius

type: `arrayOf[object Object]`
defaultValue: `[5, 10]`


### `className`

Additional class for the graph

type: `string`
defaultValue: `''`


### `colorScheme`

Array of colors as hex color codes
Each node is assigned based on its group

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

Select group of each node element

type: `func`
defaultValue: `d => d.index`


### `idSelector` (required)

Select id of each node element

type: `func`


### `labelModifier`

Select label of each node

type: `func`
defaultValue: `d => d`


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


### `valueSelector`

Select the value for link
The value of link is corresponding reflected on the width of link

type: `func`
defaultValue: `() => 1`

