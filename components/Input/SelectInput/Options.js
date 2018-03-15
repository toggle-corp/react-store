import React from 'react';
import FloatingContainer from '../../View/FloatingContainer';

import {
    isTruthy,
    listToMap,
} from '../../../utils/common';

import {
    selectInputOptionsPropTypes,
    selectInputOptionsDefaultProps,
} from './propTypes';

import styles from './options.scss';


export default class Options extends React.PureComponent {
    static propTypes = selectInputOptionsPropTypes;
    static defaultProps = selectInputOptionsDefaultProps;

    render() {
        const {
            renderOption: Option,
            keySelector,
            labelSelector,
            optionLabelSelector,
            optionsClassName,
            renderEmpty: EmptyComponent,
            show,
            options,
            onOptionClick,
            onBlur,
            onInvalidate,
            parentContainer,
            value,
        } = this.props;

        if (!show) {
            return null;
        }
        // For MultiSelect, value must be changed to an array
        const isOptionsForSelectInput = isTruthy(value) && !Array.isArray(value);
        // NOTE: using map for faster access
        const activeMap = listToMap(
            isOptionsForSelectInput ? [value] : value,
            optionKey => optionKey,
            () => true,
        );

        return (
            <FloatingContainer
                onBlur={onBlur}
                onInvalidate={onInvalidate}
                parent={parentContainer}
                className={`options ${styles.options} ${optionsClassName}`}
            >
                {
                    options.map((option) => {
                        const key = keySelector(option);
                        const label = optionLabelSelector ?
                            optionLabelSelector(option) : labelSelector(option);
                        const active = !!activeMap[key];

                        return (
                            <Option
                                key={key}
                                optionKey={key}
                                optionLabel={label}
                                onClick={onOptionClick}
                                active={active}
                            />
                        );
                    })
                }
                {
                    options.length === 0 && (
                        <div className={`empty ${styles.empty}`}>
                            <EmptyComponent />
                        </div>
                    )
                }
            </FloatingContainer>
        );
    }
}
