import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';

import { iconNames } from '../../../constants';

import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
};

const defaultProps = {
    className: '',
};

@CSSModules(styles, { allowMultiple: true })
export default class LoadingAnimation extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    render() {
        const {
            className,
        } = this.props;

        return (
            <div
                styleName="loading-animation"
                className={className}
            >
                <span
                    className={iconNames.loading}
                    styleName="icon"
                />
            </div>
        );
    }
}
