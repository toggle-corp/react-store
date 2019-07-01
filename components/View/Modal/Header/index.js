import PropTypes from 'prop-types';
import React from 'react';

import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,

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
    className: '',
    rightComponent: undefined,
};


export default class Header extends React.PureComponent {
    static propTypes = propTypes;

    static defaultProps = defaultProps;

    render() {
        const {
            className,
            rightComponent,
            title,
        } = this.props;

        const classNames = [
            'modal-header',
            className,
            styles.header,
        ];
        const headerClassNames = [
            'heading',
            styles.heading,
        ];
        return (
            <header className={classNames.join(' ')}>
                <h2 className={headerClassNames.join(' ')}>
                    { title }
                </h2>
                { rightComponent }
            </header>
        );
    }
}
