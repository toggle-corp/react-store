import PropTypes from 'prop-types';
import React from 'react';
import { _cs } from '@togglecorp/fujs';

import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    headingClassName: PropTypes.string,
    rightComponent: PropTypes.element,
    title: PropTypes.string.isRequired,
};

const defaultProps = {
    className: undefined,
    headingClassName: undefined,
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
            headingClassName,
        } = this.props;

        return (
            <header className={_cs('modal-header', className, styles.header)}>
                <h2 className={_cs('modal-header-heading', styles.heading, headingClassName)}>
                    { title }
                </h2>
                { rightComponent }
            </header>
        );
    }
}
