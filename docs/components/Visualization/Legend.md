`Legend` (component)
====================

Generates a legend based on provided data.

Props
-----

### `className`

Additional css classes passed from parent

type: `string`
defaultValue: `''`


### `colorSelector` (required)

Select a color for each item

type: `func`


### `data`

Array of items that represents a legend
example: [{ id: 1, color: #ff00ff, label: 'apple'},.. ],

type: `array`
defaultValue: `[]`


### `iconSelector`

Select an icon for each item

type: `func`
defaultValue: `() => undefined`


### `itemClassName`

styles for each item

type: `string`
defaultValue: `''`


### `keySelector` (required)

Select a key for each item

type: `func`


### `labelSelector` (required)

Select a label for each item

type: `func`


### `symbolClassNameSelector`

Select a className for each symbol

type: `func`
defaultValue: `undefined`


### `valueSelector`

Select a value for each item

type: `func`
defaultValue: `undefined`


`LegendItem` (component)
========================



Props
-----

### `className`

type: `string`
defaultValue: `''`

