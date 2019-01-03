import PropTypes from 'prop-types';
import React from 'react';

import Heading from '../Heading';

import { _cs } from '../../../utils/common';
import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    heading: PropTypes.node,
    headingType: PropTypes.oneOf([
        'main',
        'large',
        'medium',
        'small',
    ]),
    actions: PropTypes.node,
    actionsClassName: PropTypes.string,
    children: PropTypes.node,
};

const defaultProps = {
    className: '',
    heading: null,
    headingType: undefined,
    actions: null,
    children: null,
    actionsClassName: '',
};

export default class Header extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    render() {
        const {
            className: classNameFromProps,
            heading,
            headingType,
            actions,
            actionsClassName: actionsClassNameFromProps,
            children,
        } = this.props;

        const className = _cs(
            classNameFromProps,
            styles.header,
            'header',
        );

        const actionsClassName = _cs(
            actionsClassNameFromProps,
            styles.actions,
        );

        return (
            <header className={className}>
                { (heading || actions) && (
                    <div className={styles.top}>
                        <Heading
                            className={styles.heading}
                            type={headingType}
                        >
                            { heading }
                        </Heading>
                        <div className={actionsClassName}>
                            { actions }
                        </div>
                    </div>
                ) }
                { children }
            </header>
        );
    }
}
