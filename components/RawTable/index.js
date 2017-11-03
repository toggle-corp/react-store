import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';

import Body from './Body';
import Headers from './Headers';
import styles from './styles.scss';

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
            key: PropTypes.string,
        }),
    ).isRequired,

    dataModifier: PropTypes.func,

    headerModifier: PropTypes.func,

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
};

@CSSModules(styles, { allowMultiple: true })
export default class RawTable extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        const className = this.getClassName(props);
        const styleName = this.getStyleName(props);

        this.state = {
            className,
            styleName,
        };
    }

    componentWillReceiveProps(nextProps) {
        const className = this.getClassName(nextProps);
        const styleName = this.getStyleName(nextProps);

        this.setState({
            className,
            styleName,
        });
    }

    getClassName = (props) => {
        const classNames = [];
        const {
            className,
        } = props;

        // default className for global override
        classNames.push('raw-table');

        // className provided by parent (through styleName)
        classNames.push(className);

        return classNames.join(' ');
    }

    getStyleName = () => ('raw-table')

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
        } = this.props;

        return (
            <table
                className={this.state.className}
                styleName={this.state.styleName}
            >
                <Headers
                    headers={headers}
                    headerModifier={headerModifier}
                    onClick={onHeaderClick}
                />
                <Body
                    data={data}
                    dataModifier={dataModifier}
                    headers={headers}
                    keyExtractor={keyExtractor}
                    onClick={onBodyClick}
                    highlightCellKey={highlightCellKey}
                    highlightRowKey={highlightRowKey}
                    highlightColumnKey={highlightColumnKey}
                />
            </table>
        );
    }
}
