import PropTypes from 'prop-types';
import React from 'react';
import {
    SortableContainer,
    SortableElement,
    SortableHandle,
    arrayMove,
} from 'react-sortable-hoc';
import { FaramInputElement } from '@togglecorp/faram';
import { _cs } from '@togglecorp/fujs';

import Icon from '../../General/Icon';
import Button from '../../Action/Button';
import Select from './Select';
import ExtraRoot from './ExtraRoot';
import SeparateDataValue from './SeparateDataValue';

import styles from './styles.scss';


const noOp = () => undefined;

const propTypes = {
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
};

const defaultProps = {
    className: '',
    onChange: noOp,
    value: [],
    initialExpandState: {},
};

const DragHandle = SortableHandle(() => (
    <Icon
        className={`${styles.dragHandle} drag-handle`}
        name="dragHandle"
    />
));


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

class NormalTreeSelection extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.state = {
            expanded: props.initialExpandState,
        };
    }

    // Toggle expand state of a node
    handleToggleExpand = (key) => {
        const expanded = { ...this.state.expanded };
        expanded[key] = !expanded[key];
        this.setState({ expanded });
    }

    // Handle toggling the state of checkbox including its children
    handleCheckBox = (key) => {
        const value = [...this.props.value];

        const index = value.findIndex(v => v.key === key);
        const state = !value[index].selected;
        value[index] = setNodeSelection(value[index], state);

        if (this.props.onChange) {
            this.props.onChange(value);
        }
    }

    // Update the children nodes
    // Change may include selected state and order of the children
    handleChildrenChange = (key, nodes) => {
        const value = [...this.props.value];
        const index = value.findIndex(v => v.key === key);
        const selected = getSelectedState(nodes);

        // Create new nodeValue and replace
        const nodeValue = {
            ...value[index],
            selected,
            nodes,
        };

        value[index] = nodeValue;

        if (this.props.onChange) {
            this.props.onChange(value);
        }
    }

    // Start sortable stuffs

    handleSortEnd = ({ oldIndex, newIndex }) => {
        const value = arrayMove(this.props.value, oldIndex, newIndex);
        if (this.props.onChange) {
            this.props.onChange(value);
        }
    };

    SortableNode = SortableElement(({ value }) => this.renderNode(value))

    SortableTree = SortableContainer(({ items = [] }) => (
        <div>
            {items.map((node, index) => (
                <this.SortableNode
                    key={node.key}
                    index={index}
                    value={node}
                />
            ))}
        </div>
    ));

    // End sortable stuffs

    renderNode = ({ selected, key, nodes, title, draggable }) => {
        // Based on selected values (true/false/'fuzzy'), get class-name
        // for checkbox
        const className = _cs(
            styles.checkbox,
            'checkbox',
        );

        const iconName = (
            (selected === 'fuzzy' && 'checkboxBlank') ||
            (selected && 'checkbox') ||
            'checkboxOutlineBlank'
        );
        const isExpanded = this.state.expanded[key];

        return (
            <div className={`${styles.treeNode} tree-node`}>
                <div className={`${styles.parentNode} parent-node`}>
                    {draggable && <DragHandle />}
                    <Button
                        className={className}
                        iconName={iconName}
                        onClick={() => this.handleCheckBox(key)}
                        transparent
                    />
                    { nodes ? (
                        <Button
                            className={`${styles.nodeTitle} node-title`}
                            onClick={() => this.handleToggleExpand(key)}
                            transparent
                        >
                            { title }
                            <Icon
                                className={`expand-arrow ${styles.expandArrow}`}
                                name={isExpanded ? 'chevronUp' : 'chevronDown'}
                            />
                        </Button>
                    ) : (
                        <span className={`${styles.nodeTitle} node-title`}>
                            {title}
                        </span>
                    )}
                </div>

                {nodes && this.state.expanded[key] && (
                    <TreeSelection
                        value={nodes}
                        onChange={children => this.handleChildrenChange(key, children)}
                    />
                )}
            </div>
        );
    }

    render() {
        const { className, value } = this.props;
        const classNames = [
            className,
            styles.treeSelection,
            'tree-selection',
        ];

        return (
            <div className={classNames.join(' ')}>
                <this.SortableTree
                    items={value}
                    onSortEnd={this.handleSortEnd}
                    lockAxis="y"
                    lockToContainerEdges
                    useDragHandle
                    lockOffset="0%"
                />
            </div>
        );
    }
}

const TreeSelection = ExtraRoot(NormalTreeSelection);
export default FaramInputElement(TreeSelection);
export const SeparatedTreeSelection = FaramInputElement(SeparateDataValue(TreeSelection));
export const TreeSelectionWithSelectors =
    FaramInputElement(Select(SeparateDataValue(TreeSelection)));
