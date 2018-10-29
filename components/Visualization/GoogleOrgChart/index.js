import React from 'react';
import PropTypes from 'prop-types';
import { GoogleCharts } from 'google-charts';

import styles from './styles.scss';

const propTypes = {
    keySelector: PropTypes.func.isRequired,
    titleSelector: PropTypes.func.isRequired,
    childSelector: PropTypes.func.isRequired,
    value: PropTypes.array, // eslint-disable-line  react/forbid-prop-types
    options: PropTypes.object, // eslint-disable-line  react/forbid-prop-types
    disabled: PropTypes.bool,
    singleSelect: PropTypes.bool,
    multiSelect: PropTypes.bool,
    onChange: PropTypes.func,
};
const defaultProps = {
    value: [],
    options: [],
    disabled: false,
    singleSelect: false,
    multiSelect: false,
    onChange: () => [],
};

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
        } = this.props;

        const selection = this.orgChart.getSelection();
        let newSelection = [];
        let selectedData = [];
        if (selection.length === 0 && this.mouseOverRow) {
            const { row } = this.mouseOverRow;
            newSelection = this.props.value.filter(element => element.row !== row);
            selectedData = this.mapSelectionToData(newSelection);
        } else {
            const [item] = selection;
            if (singleSelect) {
                newSelection = [item];
            } else if (multiSelect) {
                newSelection = [...this.props.value, item];
            }
            selectedData = this.mapSelectionToData(newSelection);
        }
        this.orgChart.setSelection(newSelection);
        this.props.onChange(newSelection, selectedData);
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
        return (
            <div
                className={styles.orgChart}
                ref={(elem) => { this.elem = elem; }}
            />
        );
    }
}

export default GoogleOrgChart;
