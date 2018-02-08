import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';

import Body from './Body';
import Headers from './Headers';
import styles from './styles.scss';

import {
    isArrayEqual,
} from '../../../utils/common';

const propTypeKey = PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
]);

const propTypes = {
    className: PropTypes.string,

    headers: PropTypes.arrayOf(
        PropTypes.shape({
            key: PropTypes.string,
            label: PropTypes.string,
        }),
    ).isRequired,

    data: PropTypes.arrayOf(
        PropTypes.shape({
            key: PropTypes.oneOfType([
                PropTypes.string,
                PropTypes.number,
            ]),
        }),
    ).isRequired,

    dataModifier: PropTypes.func,

    headerModifier: PropTypes.func,

    expandRowId: propTypeKey,

    expandedRowModifier: PropTypes.func,

    /**
     * keyExtractor is used to get a unique key associated with rowData
     */
    keyExtractor: PropTypes.func.isRequired,

    onBodyClick: PropTypes.func,

    onHeaderClick: PropTypes.func,

    highlightCellKey: PropTypes.shape({
        columnKey: propTypeKey,
        rowKey: propTypeKey,
    }),

    highlightColumnKey: propTypeKey,

    highlightRowKey: propTypeKey,

    onDataSort: PropTypes.func,
};

const defaultProps = {
    className: '',
    onBodyClick: undefined,
    onHeaderClick: undefined,
    dataModifier: undefined,
    headerModifier: undefined,

    highlightCellKey: {},
    highlightColumnKey: undefined,
    highlightRowKey: undefined,

    onDataSort: undefined,

    expandRowId: undefined,
    expandedRowModifier: undefined,
};

@CSSModules(styles, { allowMultiple: true })
export default class RawTable extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    componentWillReceiveProps(nextProps) {
        // FIXME: why is data mutated here @frozenhelium?
        if (!isArrayEqual(this.props.data, nextProps.data)) {
            if (this.props.onDataSort) {
                this.props.onDataSort(nextProps.data);
            }
        }
    }

    getClassName = (props) => {
        const { className } = props;

        const classNames = [];

        // default className for global override
        classNames.push('raw-table');

        // className provided by parent (through styleName)
        classNames.push(className);

        return classNames.join(' ');
    }

    getStyleName = () => 'raw-table'

    render() {
        const {
            data,
            dataModifier,
            headers,
            headerModifier,
            keyExtractor,
            onHeaderClick,
            onBodyClick,
            highlightCellKey,
            highlightRowKey,
            highlightColumnKey,
            expandRowId,
            expandedRowModifier,
        } = this.props;

        const className = this.getClassName(this.props);
        const styleName = this.getStyleName(this.props);
        return (
            <table
                className={className}
                styleName={styleName}
            >
                <Headers
                    headers={headers}
                    headerModifier={headerModifier}
                    onClick={onHeaderClick}
                />
                <Body
                    data={data}
                    dataModifier={dataModifier}
                    expandedRowModifier={expandedRowModifier}
                    headers={headers}
                    keyExtractor={keyExtractor}
                    onClick={onBodyClick}
                    highlightCellKey={highlightCellKey}
                    highlightRowKey={highlightRowKey}
                    highlightColumnKey={highlightColumnKey}
                    expandRowId={expandRowId}
                />
            </table>
        );
    }
}
