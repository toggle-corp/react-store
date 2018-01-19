import React from 'react';
import styles from './options.scss';

import {
    singleSelectInputOptionPropTypes,
    singleSelectInputOptionDefaultProps,
} from './propTypes';

import {
    getOptionClassName,
    isOptionActive,
} from './utils';

export default class Options extends React.PureComponent {
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
            optionKey,
            optionLabel,
            value,
        } = this.props;

        return (
            <button
                className={getOptionClassName(styles, isOptionActive(optionKey, [value]))}
                onClick={this.handleClick}
            >
                { optionLabel }
            </button>
        );
    }
}
