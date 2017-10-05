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
    onClick: PropTypes.func.isRequired,
};

@CSSModules(styles, { allowMultiple: true })
export default class Option extends React.PureComponent {
    static propTypes = propTypes;

    render() {
        return (
            <button
                styleName="option"
                onClick={this.props.onClick}
            >
                { this.props.children }
            </button>
        );
    }
}
