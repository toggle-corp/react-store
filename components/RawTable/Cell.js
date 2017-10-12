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
            hoverable,
            highlighted,
            className,
        } = props;

        // default className for global override
        classNames.push('cell');

        // className provided by parent (through styleName)
        classNames.push(className);

        if (hoverable) {
            classNames.push('hoverable');
        }

        if (highlighted) {
            classNames.push('highlighted');
        }

        return classNames.join(' ');
    }

    getStyleName = (props) => {
        const styleNames = [];
        const {
            hoverable,
            highlighted,
        } = props;

        // default className for global override
        styleNames.push('cell');

        if (hoverable) {
            styleNames.push('hoverable');
        }

        if (highlighted) {
            styleNames.push('highlighted');
        }

        return styleNames.join(' ');
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
        // console.log('Rendering Cell');

        return (
            <td
                className={this.state.className}
                role="gridcell"
                onClick={this.handleClick}
                styleName={this.state.styleName}
            >
                { this.props.children }
            </td>
        );
    }
}
