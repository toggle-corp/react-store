import PropTypes from 'prop-types';
import React from 'react';
import MultiSelectInput from '../../Input/MultiSelectInput';
import DangerButton from '../../Action/Button/DangerButton';
import ListView from '../../View/List/ListView';
import { iconNames } from '../../../../../constants';
import FaramElement from '../../Input/Faram/FaramElement';

import styles from './styles.scss';

const propTypes = {
    keySelector: PropTypes.func,
    labelSelector: PropTypes.func,
    disabled: PropTypes.bool,
    onChange: PropTypes.func,

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
    listClassName: PropTypes.string,

    // eslint-disable-next-line react/forbid-prop-types
    listProps: PropTypes.object,

    options: PropTypes.arrayOf(
        PropTypes.shape({
            key: PropTypes.oneOfType([
                PropTypes.string,
                PropTypes.number,
            ]),
            label: PropTypes.string,
        }),
    ),
    faramElementName: PropTypes.string,
};

const defaultProps = {
    className: '',
    listClassName: '',
    listProps: {},
    keySelector: d => (d || {}).key,
    labelSelector: d => (d || {}).label,
    onChange: undefined,
    options: [],
    value: [],
    label: '',
    hideRemoveFromListButton: false,
    disabled: false,
    faramElementName: undefined,
};

const emptyList = [];

class SelectInputWithList extends React.PureComponent {
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

    getObjectFromValue = (options = emptyList, value) => {
        const { keySelector } = this.props;
        return options.filter(d => (
            value.indexOf(keySelector(d)) !== -1
        ));
    }

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
            labelSelector,
        } = this.props;

        const selectedItemClassName = [
            styles.selectedItem,
            'selected-item',
        ].join(' ');

        const labelClassName = [
            styles.selectedItemLabel,
            'label',
        ].join(' ');

        const removeButtonClassNames = [
            styles.removeButton,
            'remove-button',
        ];
        if (disabled) {
            removeButtonClassNames.push(styles.disabled);
        }

        return (
            <div
                className={selectedItemClassName}
                key={key}
            >
                <span className={labelClassName}>
                    {labelSelector(data)}
                </span>
                {
                    !hideRemoveFromListButton && (
                        <DangerButton
                            onClick={() => this.handleListItemRemove(key)}
                            title="Remove"
                            className={removeButtonClassNames.join(' ')}
                            smallHorizontalPadding
                            smallVerticalPadding
                            transparent
                            iconName={iconNames.close}
                        />
                    )
                }
            </div>
        );
    }

    render() {
        const {
            className, // eslint-disable-line no-unused-vars
            disabled,
            keySelector,
            label,
            labelSelector,
            onChange, // eslint-disable-line no-unused-vars
            options,
            value,
            listProps,
            listClassName,
            faramElementName, // eslint-disable-line no-unused-vars

            ...otherProps
        } = this.props;

        const { objectValues } = this.state;

        const listClassNames = [
            listClassName,
            styles.list,
            'list',
        ];

        return (
            <div className={this.getClassName()}>
                <MultiSelectInput
                    className={`${styles.input} input`}
                    disabled={disabled}
                    keySelector={keySelector}
                    label={label}
                    labelSelector={labelSelector}
                    onChange={this.handleSelectInputChange}
                    options={options}
                    value={value}
                    {...otherProps}
                />
                <ListView
                    className={listClassNames.join(' ')}
                    data={objectValues}
                    modifier={this.renderSelectedItem}
                    keyExtractor={keySelector}
                    {...listProps}
                />
            </div>
        );
    }
}

export default FaramElement('input')(SelectInputWithList);
