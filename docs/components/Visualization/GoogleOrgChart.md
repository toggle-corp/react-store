`GoogleOrgChart` (component)
============================

GoogleOrgChart provides a react component wrapper to google's Organization Chart.
For details: <a href="https://developers.google.com/chart/interactive/docs/gallery/orgchart">Organization Chart</a>

Props
-----

### `childSelector` (required)

Select children of each node

type: `func`


### `disabled`

if disabled no selection and mouseover events

type: `bool`
defaultValue: `false`


### `keySelector` (required)

Select a key for each data element

type: `func`


### `multiSelect`

if multiSelect multiple elements/nodes can be selected

type: `bool`
defaultValue: `false`


### `onChange`

onChange handler function
this function is triggered when a selection is made

type: `func`
defaultValue: `() => []`


### `options`

Hierarchical data element representing the organization structure

type: `object`
defaultValue: `[]`


### `singleSelect`

if singleSelect only single element/node can be selected

type: `bool`
defaultValue: `false`


### `titleSelector` (required)

Select the title for each element

type: `func`


### `value`

Selected data element

type: `array`
defaultValue: `[]`

