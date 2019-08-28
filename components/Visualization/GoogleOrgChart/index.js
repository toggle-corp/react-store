import React from 'react';
import PropTypes from 'prop-types';
import { GoogleCharts } from 'google-charts';
import { _cs } from '@togglecorp/fujs';

import styles from './styles.scss';

const propTypes = {
    /**
     * Select a key for each data element
     */
    keySelector: PropTypes.func.isRequired,
    /**
     * Select the title for each element
     */
    titleSelector: PropTypes.func.isRequired,
    /**
     * Select children of each node
     */
    childSelector: PropTypes.func.isRequired,
    /**
     * Selected data element
     */
    value: PropTypes.array, // eslint-disable-line  react/forbid-prop-types
    /**
     * Hierarchical data element representing the organization structure
     */
    options: PropTypes.object, // eslint-disable-line  react/forbid-prop-types
    /**
     * if disabled no selection and mouseover events
     */
    disabled: PropTypes.bool,
    /**
     * if singleSelect only single element/node can be selected
     */
    singleSelect: PropTypes.bool,
    /**
     * if multiSelect multiple elements/nodes can be selected
     */
    multiSelect: PropTypes.bool,
    /**
     * onChange handler function
     * this function is triggered when a selection is made
     */
    onChange: PropTypes.func,
    /**
     * Additional css classes passed from parent
     */
    className: PropTypes.string,
};
const defaultProps = {
    value: [],
    options: [],
    disabled: false,
    singleSelect: false,
    multiSelect: false,
    onChange: () => [],
    className: undefined,
};

/**
 * GoogleOrgChart provides a react component wrapper to google's Organization Chart.
 * For details: <a href="https://developers.google.com/chart/interactive/docs/gallery/orgchart">Organization Chart</a>
 */
class GoogleOrgChart extends React.PureComponent {
    static propTypes = propTypes;

    static defaultProps = defaultProps;

    constructor(props) {
        super(props);
        GoogleCharts.load(this.drawChart, { packages: ['orgchart'] });
        this.mouseOverRow = undefined;
    }

    flattenData = (node, parentName) => {
        const {
            keySelector,
            childSelector,
            titleSelector,
        } = this.props;

        const key = keySelector(node);
        const title = titleSelector(node);
        const organs = childSelector(node);

        const children = organs.map(organ => this.flattenData(organ, key));
        const flattenedChildren = [].concat(...children);
        return [
            [{ v: key, f: title }, parentName, title],
            ...flattenedChildren,
        ];
    }

    mapSelectionToData = selection => (
        selection.map((row) => {
            const { row: selectedRow } = row;
            const id = this.data.getValue(selectedRow, 0);
            return { id };
        }))

    selectHandler = () => {
        const {
            singleSelect,
            multiSelect,
            value,
            onChange,
        } = this.props;

        const selection = this.orgChart.getSelection();
        let newSelection = [];
        let selectedData = [];
        if (selection.length === 0 && this.mouseOverRow) {
            const { row } = this.mouseOverRow;
            newSelection = value.filter(element => element.row !== row);
            selectedData = this.mapSelectionToData(newSelection);
        } else {
            const [item] = selection;
            if (singleSelect) {
                newSelection = [item];
            } else if (multiSelect) {
                newSelection = [...value, item];
            }
            selectedData = this.mapSelectionToData(newSelection);
        }
        this.orgChart.setSelection(newSelection);
        onChange(newSelection, selectedData);
    };

    mouseOverHandler = (row) => {
        this.mouseOverRow = row;
    }

    drawChart = () => {
        const {
            disabled,
            options,
            value,
        } = this.props;

        const flatData = [['key', 'parent', 'title']]
            .concat(this.flattenData(options, ''));
        this.data = GoogleCharts.api.visualization.arrayToDataTable(flatData);
        this.orgChart = new GoogleCharts.api.visualization.OrgChart(this.elem);

        if (!disabled) {
            GoogleCharts.api.visualization.events.addListener(this.orgChart, 'select', this.selectHandler);
            GoogleCharts.api.visualization.events.addListener(this.orgChart, 'onmouseover', this.mouseOverHandler);
        }

        this.orgChart.draw(
            this.data,
            {
                allowHtml: true,
                nodeClass: styles.nodeClass,
                selectedNodeClass: disabled ? styles.disabled : styles.selectedNodeClass,
            },
        );
        this.orgChart.setSelection(value);
    }

    render() {
        const { className } = this.props;

        return (
            <div
                className={_cs(className, styles.orgChart)}
                ref={(elem) => { this.elem = elem; }}
            />
        );
    }
}

export default GoogleOrgChart;
