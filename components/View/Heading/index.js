import PropTypes from 'prop-types';
import React from 'react';

import { _cs } from '../../../utils/common';
import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    type: PropTypes.oneOf([
        'main',
        'large',
        'medium',
        'small',
    ]),
    children: PropTypes.node,
};

const defaultProps = {
    className: '',
    type: undefined,
    children: null,
};

const MAIN = 'main';
const LARGE = 'large';
const MEDIUM = 'medium';
const SMALL = 'small';

export default class Heading extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    render() {
        const {
            className: classNameFromProps,
            children,
            type,
        } = this.props;

        const types = {
            [MAIN]: `main ${styles.main}`,
            [LARGE]: `large ${styles.large}`,
            [MEDIUM]: `medium ${styles.medium}`,
            [SMALL]: `small ${styles.small}`,
        };

        const className = _cs(
            classNameFromProps,
            styles.heading,
            'heading',
            types[type],
        );

        switch (type) {
            case MAIN:
                return (
                    <h1 className={className}>
                        { children }
                    </h1>
                );
            case LARGE:
                return (
                    <h2 className={className}>
                        { children }
                    </h2>
                );
            case MEDIUM:
                return (
                    <h3 className={className}>
                        { children }
                    </h3>
                );
            case SMALL:
                return (
                    <h4 className={className}>
                        { children }
                    </h4>
                );
            default:
                return (
                    <h5 className={className}>
                        { children }
                    </h5>
                );
        }
    }
}

