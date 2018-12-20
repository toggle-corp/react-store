import PropTypes from 'prop-types';
import React from 'react';

import { iconNames } from '#constants';
import { formatPdfText } from '../../../utils/common';
import { FaramInputElement } from '../../General/FaramElements';
import AccentButton from '../../Action/Button/AccentButton.js';
import Delay from '../../General/Delay';
import { NormalTextArea as TextArea } from '../TextArea';

import styles from './styles.scss';

const propTypes = {
    disabled: PropTypes.bool,
    className: PropTypes.string,
    onChange: PropTypes.func,
    required: PropTypes.bool,
    readOnly: PropTypes.bool,
};

const defaultProps = {
    disabled: false,
    className: '',
    readOnly: false,
    onChange: undefined,
    required: false,
};


class FormattedTextArea extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    handleFormatText = () => {
        const {
            onChange,
            value,
        } = this.props;

        const formattedText = formatPdfText(value);
        onChange(formattedText);
    }

    render() {
        const {
            disabled,
            readOnly,
            className,
            ...otherProps
        } = this.props;

        return (
            <div className={`${className} ${styles.formattedText}`}>
                <TextArea
                    {...otherProps}
                    disabled={disabled}
                    readOnly={readOnly}
                    className={styles.area}
                />
                <AccentButton
                    tabIndex="-1"
                    className={styles.formatButton}
                    iconName={iconNames.textFormat}
                    onClick={this.handleFormatText}
                    title="Click here to format the text"
                    smallVerticalPadding
                    smallHorizontalPadding
                    transparent
                    disabled={disabled || readOnly}
                />
            </div>
        );
    }
}

export default FaramInputElement(Delay(FormattedTextArea));
