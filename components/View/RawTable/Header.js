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
export default class Header extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    getClassName = (props) => {
        const classNames = [];
        const {
            className,
            highlighted,
            hoverable,
            uniqueKey,
        } = props;

        // default className for global override
        classNames.push('header');

        // className provided by parent (through styleName)
        classNames.push(className);

        if (hoverable) {
            classNames.push('hoverable');
        }

        if (highlighted) {
            classNames.push('highlighted');
        }

        if (uniqueKey) {
            classNames.push(uniqueKey);
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
        styleNames.push('header');

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
        const className = this.getClassName(this.props);
        const styleName = this.getStyleName(this.props);

        return (
            <th
                className={className}
                styleName={styleName}
                role="gridcell"
                onClick={this.handleClick}
            >
                { this.props.children }
            </th>
        );
    }
}
