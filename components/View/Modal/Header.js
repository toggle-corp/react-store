import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';

import styles from './styles.scss';

const propTypes = {
    /**
     * component to render on right side of header
     */
    rightComponent: PropTypes.element,

    /**
     * title text for modal
     */
    title: PropTypes.string.isRequired,
};

const defaultProps = {
    rightComponent: undefined,
};


@CSSModules(styles, { allowMultiple: true })
export default class Header extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    render() {
        const { title, rightComponent } = this.props;

        return (
            <header styleName="header">
                <h2 styleName="heading">
                    { title }
                </h2>
                { rightComponent }
            </header>
        );
    }
}
