import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';

import styles from './styles.scss';

const propTypes = {
    children: PropTypes.oneOfType([
        PropTypes.node,
        PropTypes.arrayOf(
            PropTypes.node,
        ),
    ]).isRequired,

    className: PropTypes.string,

    highlighted: PropTypes.bool,

    hoverable: PropTypes.bool,

    onClick: PropTypes.func,

    uniqueKey: PropTypes.string.isRequired,
};

const defaultProps = {
    className: '',
    highlighted: false,
    hoverable: false,
    onClick: undefined,
};

@CSSModules(styles, { allowMultiple: true })
export default class Cell extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        const className = this.getClassName(props);

        this.state = {
            className,
        };
    }

    componentWillReceiveProps(nextProps) {
        const className = this.getClassName(nextProps);

        this.setState({
            className,
        });
    }

    getClassName = (props) => {
        const classNames = [];
        const {
            hoverable,
            highlighted,
            className,
        } = props;

        // default className for global override
        classNames.push('table-cell');

        // className provided by parent (through styleName)
        classNames.push(className);

        if (hoverable) {
            classNames.push('hoverable');
        }

        if (highlighted) {
            classNames.push('highlighted');
        }
    }

    handleClick = (e) => {
        const {
            onClick,
            uniqueKey,
        } = this.props;

        if (onClick) {
            onClick(uniqueKey, e);
        }
    }

    render() {
        return (
            <td
                className={this.state.className}
                role="gridcell"
                onClick={this.handleClick}
            >
                { this.props.children }
            </td>
        );
    }
}
