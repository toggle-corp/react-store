import React from 'react';
import styles from './options.scss';

import {
    singleSelectInputOptionPropTypes,
    singleSelectInputOptionDefaultProps,
} from './propTypes';

import {
    getOptionClassName,
} from './utils';

export default class Option extends React.PureComponent {
    static propTypes = singleSelectInputOptionPropTypes;
    static defaultProps = singleSelectInputOptionDefaultProps;

    handleClick = () => {
        const {
            optionKey,
            onClick,
        } = this.props;

        onClick(optionKey);
    }

    render() {
        const {
            optionLabel,
            active,
        } = this.props;

        return (
            <button
                className={getOptionClassName(styles, active)}
                onClick={this.handleClick}
            >
                { optionLabel }
            </button>
        );
    }
}
