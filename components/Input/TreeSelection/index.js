import PropTypes from 'prop-types';
import React, { useState, useCallback } from 'react';
import {
    SortableContainer,
    SortableElement,
    SortableHandle,
    arrayMove,
} from 'react-sortable-hoc';
import { FaramInputElement } from '@togglecorp/faram';
import { _cs } from '@togglecorp/fujs';

import Button from '../../Action/Button';
import ExtraRoot from './ExtraRoot';
import HintAndError from '../HintAndError';
import Icon from '../../General/Icon';
import Label from '../Label';
import Select from './Select';
import SeparateDataValue from './SeparateDataValue';

import styles from './styles.scss';


const noOp = () => undefined;

// Get cumulative selected state from a list of nodes
const getSelectedState = (nodes) => {
    let selected = true;

    // If any one child is in fuzzy state, we are in fuzzy state
    if (nodes.find(n => n.selected === 'fuzzy')) {
        selected = 'fuzzy';
    } else {
        const selectedChildren = nodes.filter(n => n.selected);

        // If no children is selected, we are not selected
        // and if selected children is less than actual children in
        // number then we are in fuzzy state
        if (selectedChildren.length === 0) {
            selected = false;
        } else if (selectedChildren.length !== nodes.length) {
            selected = 'fuzzy';
        }
    }

    return selected;
};

// Set selected state for a particular node where selected = true/false/'fuzzy'
// and do it for all the children.
const setNodeSelection = (node, selected) => ({
    ...node,
    nodes: node.nodes && node.nodes.map(n => setNodeSelection(n, selected)),
    selected,
});

const DragHandle = SortableHandle(() => (
    <Icon
        className={_cs(styles.dragHandle, 'drag-handle')}
        name="dragHandle"
    />
));

const SortableNode = SortableElement((props) => {
    const {
        value: {
            selected,
            key,
            nodes,
            title,
            draggable,
        },
        isExpanded,
        onClick,
        onExpand,
        onChildrenChange,
    } = props;

    const iconName = (
        (selected === 'fuzzy' && 'checkboxBlank')
        || (selected && 'checkbox')
        || 'checkboxOutlineBlank'
    );

    const handleCheckboxClick = useCallback(() => {
        onClick(key);
    }, [onClick, key]);

    const handleToggleExpandKey = useCallback(() => {
        onExpand(key);
    }, [onExpand, key]);

    const handleTreeSelectionChange = useCallback((children) => {
        onChildrenChange(key, children);
    }, [onChildrenChange, key]);

    return (
        <div className={_cs(styles.treeNode, 'tree-node')}>
            <div className={_cs(styles.parentNode, 'parent-node')}>
                {draggable && <DragHandle />}
                <Button
                    // Based on selected values (true/false/'fuzzy'), get class-name
                    // for checkbox
                    className={_cs(styles.checkbox, 'checkbox')}
                    iconName={iconName}
                    onClick={handleCheckboxClick}
                    transparent
                />
                { nodes ? (
                    <Button
                        className={_cs(styles.nodeTitle, 'node-title')}
                        onClick={handleToggleExpandKey}
                        transparent
                    >
                        { title }
                        <Icon
                            className={_cs('expand-arrow', styles.expandArrow)}
                            name={isExpanded ? 'chevronUp' : 'chevronDown'}
                        />
                    </Button>
                ) : (
                    <span className={_cs(styles.nodeTitle, 'node-title')}>
                        {title}
                    </span>
                )}
            </div>
            {nodes && isExpanded && (
                <NormalTreeSelection
                    value={nodes}
                    onChange={handleTreeSelectionChange}
                />
            )}
        </div>
    );
});

const SortableTree = SortableContainer((props) => {
    const {
        items = [],
        onExpand,
        onClick,
        onChildrenChange,
        expanded,
        className,
        // isExpanded,
    } = props;

    return (
        <div className={className}>
            {items.map((node, index) => (
                <SortableNode
                    key={node.key}
                    index={index}

                    value={node}
                    onExpand={onExpand}
                    onClick={onClick}
                    onChildrenChange={onChildrenChange}
                    isExpanded={expanded[node.key]}
                />
            ))}
        </div>
    );
});

function NormalTreeSelection(props) {
    const {
        className: classNameFromProps,
        value,
        direction,
        initialExpandState,
        onChange,
    } = props;

    const [expanded, setExpanded] = useState(initialExpandState);
    // Toggle expand state of a node
    const handleToggleExpand = useCallback((key) => {
        setExpanded((oldExpanded) => {
            const newExpanded = { ...oldExpanded };
            newExpanded[key] = !newExpanded[key];
            return newExpanded;
        });
    }, []);

    // Handle toggling the state of checkbox including its children
    const handleCheckBox = useCallback((key) => {
        const tempValue = [...value];

        const index = tempValue.findIndex(v => v.key === key);
        const state = !tempValue[index].selected;
        tempValue[index] = setNodeSelection(tempValue[index], state);

        if (onChange) {
            onChange(tempValue);
        }
    }, [onChange, value]);

    // Update the children nodes
    // Change may include selected state and order of the children
    const handleChildrenChange = useCallback((key, nodes) => {
        const tempValue = [...value];
        const index = tempValue.findIndex(v => v.key === key);
        const selected = getSelectedState(nodes);

        // Create new nodeValue and replace
        const nodeValue = {
            ...tempValue[index],
            selected,
            nodes,
        };

        tempValue[index] = nodeValue;

        if (onChange) {
            onChange(tempValue);
        }
    }, [onChange, value]);

    // Start sortable stuffs

    const handleSortEnd = useCallback(({ oldIndex, newIndex }) => {
        const newValue = arrayMove(value, oldIndex, newIndex);
        if (onChange) {
            onChange(newValue);
        }
    }, [onChange, value]);


    return (
        <div
            className={_cs(
                classNameFromProps,
                styles.treeSelection,
                direction === 'horizontal' && styles.horizontal,
                'tree-selection',
            )}
        >
            <SortableTree
                items={value}
                onExpand={handleToggleExpand}
                onClick={handleCheckBox}
                onChildrenChange={handleChildrenChange}
                expanded={expanded}
                className={direction === 'horizontal' && styles.horizontal}

                onSortEnd={handleSortEnd}
                lockAxis={direction === 'vertical' ? 'y' : ''}
                axis={direction === 'vertical' ? 'y' : 'xy'}
                lockToContainerEdges
                useDragHandle
                lockOffset="0%"
            />
        </div>
    );
}

NormalTreeSelection.propTypes = {
    className: PropTypes.string,
    value: PropTypes.arrayOf(PropTypes.shape({
        key: PropTypes.string,
        title: PropTypes.string,
        nodes: PropTypes.arrayOf(PropTypes.object),
        selected: PropTypes.oneOf([true, false, 'fuzzy']),
        draggable: PropTypes.bool,
    })),
    onChange: PropTypes.func,
    initialExpandState: PropTypes.shape({}),
    // NOTE: Options are horizontal and vertical
    direction: PropTypes.string,
};
NormalTreeSelection.defaultProps = {
    className: undefined,
    onChange: noOp,
    value: [],
    initialExpandState: {},
    direction: 'vertical',
};

const FinalTreeSelection = ExtraRoot(NormalTreeSelection);

function TreeSelection(props) {
    const {
        className,
        showLabel,
        label,
        error,
        disabled,
        showHintAndError,
        hint,
        persistentHintAndError,
        title,
        ...otherProps
    } = props;

    return (
        <div
            className={className}
            title={title}
        >
            <Label
                show={showLabel}
                text={label}
                error={!!error}
                // active={isFocused}
                disabled={disabled}
            />
            <FinalTreeSelection
                disabled={disabled}
                {...otherProps}
            />
            <HintAndError
                show={showHintAndError}
                hint={hint}
                error={error}
                persistent={persistentHintAndError}
            />
        </div>
    );
}

TreeSelection.propTypes = {
    className: PropTypes.string,
    label: PropTypes.string,
    error: PropTypes.string,
    hint: PropTypes.string,
    showLabel: PropTypes.bool,
    disabled: PropTypes.bool,
    showHintAndError: PropTypes.bool,
    persistentHintAndError: PropTypes.bool,
    title: PropTypes.string,
};

TreeSelection.defaultProps = {
    className: undefined,
    showLabel: true,
    disabled: false,
    showHintAndError: true,
    title: undefined,
    label: undefined,
    persistentHintAndError: undefined,
    hint: undefined,
    error: undefined,
};

export default FaramInputElement(
    TreeSelection,
);

export const SeparatedTreeSelection = FaramInputElement(
    SeparateDataValue(TreeSelection),
);

export const TreeSelectionWithSelectors = FaramInputElement(
    Select(SeparateDataValue(TreeSelection)),
);
