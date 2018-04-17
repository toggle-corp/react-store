import PropTypes from 'prop-types';
import React from 'react';
import MultiSelectInput from '../../Input/MultiSelectInput';
import DangerButton from '../../Action/Button/DangerButton';
import ListView from '../../View/List/ListView';
import { iconNames } from '../../../../../constants';
import FaramElement from '../../Input/Faram/FaramElement';

import styles from './styles.scss';

const propTypes = {
    /**
     * Key selector function
     * should return key from provided row data
     */
    keySelector: PropTypes.func,

    /**
     * String to show in case of error
     */
    error: PropTypes.string,

    /**
     * Hint text
     */
    hint: PropTypes.string,

    showHintAndError: PropTypes.bool,

    disabled: PropTypes.bool,

    onChange: PropTypes.func,

    /**
     * Value selector function
     * should return value from provided row data
     */
    labelSelector: PropTypes.func,

    label: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number,
    ]),

    value: PropTypes.arrayOf(PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number,
    ])),

    hideRemoveFromListButton: PropTypes.bool,

    className: PropTypes.string,
    /**
     * Options to be shown
     */
    options: PropTypes.arrayOf(
        PropTypes.shape({
            key: PropTypes.oneOfType([
                PropTypes.string,
                PropTypes.number,
            ]),
            label: PropTypes.string,
        }),
    ),
};

const defaultProps = {
    className: '',
    keySelector: d => (d || {}).key,
    labelSelector: d => (d || {}).label,
    error: '',
    hint: '',
    onChange: undefined,
    showHintAndError: true,
    options: [],
    value: [],
    label: '',
    hideRemoveFromListButton: false,
    disabled: false,
};

const emptyList = [];

@FaramElement('input')
export default class SelectInputWithList extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);
        const {
            options,
            value,
        } = this.props;

        const objectValues = this.getObjectFromValue(options, value);

        this.state = {
            objectValues,
        };
    }

    componentWillReceiveProps(newProps) {
        const {
            value: newValue,
            options,
        } = newProps;

        const { value: oldValue } = this.props;

        if (newValue !== oldValue) {
            const objectValues = this.getObjectFromValue(options, newValue);
            this.setState({ objectValues });
        }
    }

    getObjectFromValue = (options = emptyList, value) => (
        options.filter(d => (
            value.indexOf(d.key) !== -1
        ))
    )

    getClassName = () => {
        const { className } = this.props;
        const { error } = this.state;

        const classNames = [
            className,
            styles.selectInputWithList,
            'select-input-with-list',
        ];

        if (error) {
            classNames.push(styles.error);
            classNames.push('error');
        }

        return classNames.join(' ');
    }

    handleSelectInputChange = (values) => {
        const {
            onChange,
            options,
        } = this.props;

        const objectValues = this.getObjectFromValue(options, values);
        this.setState({ objectValues });

        if (onChange) {
            onChange(values);
        }
    }

    handleListItemRemove = (key) => {
        const {
            onChange,
            value,
            options,
            disabled,
        } = this.props;

        if (!disabled) {
            const index = value.indexOf(key);
            const newValue = [...value];

            if (index !== -1) {
                newValue.splice(index, 1);
            }

            const objectValues = this.getObjectFromValue(options, newValue);
            this.setState({ objectValues });

            if (onChange) {
                onChange(newValue);
            }
        }
    }

    renderSelectedItem = (key, data) => {
        const {
            disabled,
            hideRemoveFromListButton,
        } = this.props;
        let additionalStyle = '';
        if (disabled) {
            additionalStyle = styles.disabled;
        }

        return (
            <div
                className={styles.selectedItem}
                key={key}
            >
                <span
                    className={styles.selectedItemLabel}
                >
                    {this.props.labelSelector(data)}
                </span>
                {!hideRemoveFromListButton &&
                    <DangerButton
                        onClick={() => this.handleListItemRemove(key)}
                        className={`${additionalStyle} ${styles.removeButton}`}
                        smallHorizontalPadding
                        smallVerticalPadding
                        transparent
                    >
                        <span className={iconNames.close} />
                    </DangerButton>
                }
            </div>
        );
    }

    render() {
        const {
            className, // eslint-disable-line no-unused-vars
            disabled,
            error,
            hint,
            keySelector,
            label,
            labelSelector,
            onChange, // eslint-disable-line no-unused-vars
            options,
            showHintAndError,
            value,
            ...otherProps
        } = this.props;

        const {
            objectValues,
        } = this.state;

        return (
            <div className={this.getClassName()}>
                <MultiSelectInput
                    className={`${styles.input} input`}
                    disabled={disabled}
                    error={error}
                    keySelector={keySelector}
                    label={label}
                    labelSelector={labelSelector}
                    onChange={this.handleSelectInputChange}
                    options={options}
                    showHintAndError={false}
                    value={value}
                    {...otherProps}
                />
                <ListView
                    className={`${styles.list} list`}
                    data={objectValues}
                    modifier={this.renderSelectedItem}
                    keyExtractor={keySelector}
                />
                {
                    showHintAndError && [
                        !error && hint && (
                            <p
                                key="hint"
                                className={`${styles.hint} hint`}
                            >
                                {hint}
                            </p>
                        ),
                        error && !hint && (
                            <p
                                key="error"
                                className={`${styles.error} error`}
                            >
                                {error}
                            </p>
                        ),
                        !error && !hint && (
                            <p
                                key="empty"
                                className={`${styles.empty} empty`}
                            >
                                -
                            </p>
                        ),
                    ]
                }
            </div>
        );
    }
}
