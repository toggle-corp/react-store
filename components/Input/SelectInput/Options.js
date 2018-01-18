import React from 'react';
import { FloatingContainer } from '../../View';

import styles from './options.scss';

import {
    selectInputOptionsPropTypes,
    selectInputOptionsDefaultProps,
} from './propTypes';

export default class Options extends React.PureComponent {
    static propTypes = selectInputOptionsPropTypes;
    static defaultProps = selectInputOptionsDefaultProps;

    render() {
        const {
            renderOption: Option,
            keySelector,
            labelSelector,
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
                        const label = labelSelector(option);

                        return (
                            <Option
                                key={key}
                                optionKey={key}
                                optionLabel={label}
                                onClick={onOptionClick}
                                value={value}
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
