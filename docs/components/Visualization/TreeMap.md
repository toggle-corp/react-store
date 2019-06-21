`TreeMap` (component)
=====================

TreeMap is a rectangular space-filling approach to visualizing hierarchical data structure.
The area of each rectangle denotes the value of the element on which the rectangle is based on.
Subcategories are nested inside the parent rectangle.

Props
-----

### `boundingClientRect` (required)

Size of the parent element/component (passed by the Responsive hoc)

type: `shape[object Object]`


### `childrenSelector`

Accessor function to return children of node

type: `func`
defaultValue: `d => d.children`


### `className`

Additional css classes passed from parent

type: `string`
defaultValue: `''`


### `colorScheme`

Array of colors as hex color codes

type: `arrayOf[object Object]`
defaultValue: `schemeSet3`


### `data`

Hierarchical data structure that can be computed to form a hierarchical layout
<a href="https://github.com/d3/d3-hierarchy">d3-hierarchy</a>

type: `shape[object Object]`
defaultValue: `{}`


### `labelSelector` (required)

Select label for each node

type: `func`


### `setSaveFunction`

Handle save functionality

type: `func`
defaultValue: `() => {}`


### `valueSelector` (required)

Select the value of each node

type: `func`

