import PropTypes from 'prop-types';
import React from 'react';
import MultiSelectInput from '../../Input/MultiSelectInput';
import DismissableListItem from '../../Action/DismissableListItem';
import ListItem from '../../View/ListItem';
import ListView from '../../View/List/ListView';
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
    selectClassName: PropTypes.string,

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
    topRightChild: PropTypes.func,
};

const defaultProps = {
    className: '',
    listClassName: '',
    selectClassName: '',
    listProps: {},
    keySelector: d => (d || {}).key,
    labelSelector: d => (d || {}).label,
    onChange: undefined,
    options: [],
    value: [],
    label: '',
    hideRemoveFromListButton: false,
    topRightChild: undefined,
    disabled: false,
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

    getListItemParams = (key, datum) => {
        const {
            labelSelector,
        } = this.props;

        return {
            value: labelSelector(datum),
            itemKey: key,
            onDismiss: this.handleItemDismiss,
            className: styles.listItem,
        };
    }

    handleItemDismiss = (key) => {
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
            selectClassName,
            listProps,
            listClassName,
            topRightChild: TopRightChild,
            hideRemoveFromListButton,

            ...otherProps
        } = this.props;

        const { objectValues } = this.state;

        const listClassNames = [
            listClassName,
            styles.list,
            'list',
        ];

        const selectClassNames = [
            selectClassName,
            styles.input,
            'select',
        ];

        if (TopRightChild) {
            selectClassNames.push(styles.hasTopRightChild);
        }

        const Item = hideRemoveFromListButton ? ListItem : DismissableListItem;

        return (
            <div className={this.getClassName()}>
                <div className={styles.headerContainer}>
                    <MultiSelectInput
                        className={selectClassNames.join(' ')}
                        disabled={disabled}
                        keySelector={keySelector}
                        label={label}
                        labelSelector={labelSelector}
                        onChange={this.handleSelectInputChange}
                        options={options}
                        value={value}
                        {...otherProps}
                    />
                    {TopRightChild && <TopRightChild />}
                </div>
                <ListView
                    className={listClassNames.join(' ')}
                    data={objectValues}
                    renderer={Item}
                    rendererParams={this.getListItemParams}
                    keyExtractor={keySelector}
                    {...listProps}
                />
            </div>
        );
    }
}

export default FaramElement('input')(SelectInputWithList);
