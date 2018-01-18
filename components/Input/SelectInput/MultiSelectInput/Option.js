import React from 'react';

import styles from '../options.scss';
import Checkbox from './Checkbox';

import {
    multiSelectInputOptionPropTypes,
    multiSelectInputOptionDefaultProps,
} from '../propTypes';

import {
    getOptionClassName,
    isOptionActive,
} from '../utils';

export default class Option extends React.PureComponent {
    static propTypes = multiSelectInputOptionPropTypes;
    static defaultProps = multiSelectInputOptionDefaultProps;

    handleClick = () => {
        const {
            onClick,
            optionKey,
        } = this.props;

        onClick(optionKey);
    }

    render() {
        const {
            optionLabel,
            optionKey,
            value,
        } = this.props;

        const active = isOptionActive(optionKey, value);

        return (
            <button
                className={getOptionClassName(styles, active, true)}
                onClick={this.handleClick}
            >
                <Checkbox active={active} />
                { optionLabel }
            </button>
        );
    }
}
