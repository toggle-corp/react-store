`WordCloud` (component)
=======================

Display how frequently a word appears by making the size of each word proportion to its
frequency.

Props
-----

### `boundingClientRect` (required)

Size of the parent element/component (passed by the Responsive hoc)

type: `shape[object Object]`


### `className`

type: `string`
defaultValue: `''`


### `colorScheme`

Array of colors as hex color codes

type: `arrayOf[object Object]`
defaultValue: `schemeSet2`


### `data` (required)

Data to be represented in the word cloud.

type: `arrayOf[object Object]`


### `font`

Font specification for each word cloud node

type: `union(string|func)`
defaultValue: `'sans-serif'`


### `frequencySelector`

Select the frequency value for each data point

type: `func`
defaultValue: `d => d.size`


### `labelSelector`

Select a label for each data point

type: `func`
defaultValue: `d => d.text`


### `onWordClick`

defaultValue: `undefined`


### `onWordMouseOver`

defaultValue: `undefined`


### `rotate`

type: `union(number|func)`
defaultValue: `0`


### `setSaveFunction`

Handler function to save the generated svg

type: `func`
defaultValue: `undefined`

