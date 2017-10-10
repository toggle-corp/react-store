import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';

import styles from './styles.scss';

const propTypes = {
    /**
     * child elements
     */
    children: PropTypes.oneOfType([
        PropTypes.arrayOf(PropTypes.node),
        PropTypes.element,
    ]).isRequired,
};


@CSSModules(styles, { allowMultiple: true })
export default class Group extends React.PureComponent {
    static propTypes = propTypes;

    render() {
        return (
            <div styleName="group">
                {this.props.children}
            </div>
        );
    }
}
