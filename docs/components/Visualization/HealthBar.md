`HealthBar` (component)
=======================

Represent data points as a bar with each bar consisting of segments
and each segment representing a value.

Props
-----

### `centerTooltip`

if true, center the tooltip

type: `bool`
defaultValue: `false`


### `className`

Additional sscss classes passed from parent

type: `string`
defaultValue: `''`


### `colorScheme`

Array of colors as hex color codes

type: `array`
defaultValue: `[
    '#41c9a2',
    '#3ec0a1',
    '#39b4a1',
    '#36aba0',
    '#2f98a0',
    '#28859f',
    '#22769e',
    '#1e699e',
]`


### `data` (required)

Array of data points

type: `array`


### `enlargeOnHover`

if true, increase the size of segment on Hover

type: `bool`
defaultValue: `true`


### `hideLabel`

if true, hide label name

type: `bool`
defaultValue: `false`


### `keySelector`

Select a key for each segment/ data element

type: `func`
defaultValue: `e => e.key`


### `labelSelector`

Select a label for each data element

type: `func`
defaultValue: `e => e.label`


### `title`

Title of the HealthBar

type: `string`
defaultValue: `undefined`


### `valueSelector`

Select a value for each element

type: `func`
defaultValue: `e => e.value`

`Segment` (component)
=====================

Represent a segment of HealthBar. Length of segment corresponds to the value of the data
element

Props
-----

### `centerTooltip`

if ture, center tooltip

type: `bool`
defaultValue: `false`


### `enlargeOnHover` (required)

if true, increase the size of segment on hover

type: `bool`


### `hideLabel` (required)

if ture, hide the label

type: `bool`


### `label`

name of the segment

type: `string`
defaultValue: `''`


### `style` (required)

additional styling classes

type: `object`


### `value` (required)

value of the segment

type: `number`

