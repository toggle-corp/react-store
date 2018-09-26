import PropTypes from 'prop-types';
import React from 'react';
import {
    SortableContainer,
    SortableElement,
    SortableHandle,
    arrayMove,
} from 'react-sortable-hoc';

import { iconNames } from '../../../constants';
import Button from '../../Action/Button';
import { FaramInputElement } from '../../General/FaramElements';
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
    <span className={`${iconNames.dragHandle} ${styles.dragHandle} drag-handle`} />
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

    // Based on selected values (true/false/'fuzzy'), get class-name
    // for checkbox
    getCheckBoxStyle = (selected) => {
        const classNames = [
            styles.checkbox,
            'checkbox',
        ];
        if (selected === 'fuzzy') {
            classNames.push(iconNames.checkboxBlank);
        } else if (selected) {
            classNames.push(iconNames.checkbox);
        } else {
            classNames.push(iconNames.checkboxOutlineBlank);
        }
        return classNames.join(' ');
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

    renderNode = node => (
        <div className={`${styles.treeNode} tree-node`}>
            <div className={`${styles.parentNode} parent-node`}>
                {node.draggable && <DragHandle />}
                <Button
                    className={`${this.getCheckBoxStyle(node.selected)} checkbox`}
                    onClick={() => this.handleCheckBox(node.key)}
                    transparent
                />
                {node.nodes ? (
                    <Button
                        className={`${styles.nodeTitle} node-title`}
                        onClick={() => this.handleToggleExpand(node.key)}
                        transparent
                    >
                        { node.title }
                        <span
                            className={
                                `expand-arrow
                                ${styles.expandArrow}
                                ${this.state.expanded[node.key]
                                    ? iconNames.chevronUp
                                    : iconNames.chevronDown
                                }`
                            }
                        />
                    </Button>
                ) : (
                    <span className={`${styles.nodeTitle} node-title`}>
                        {node.title}
                    </span>
                )}
            </div>

            {node.nodes && this.state.expanded[node.key] && (
                <TreeSelection
                    value={node.nodes && node.nodes}
                    onChange={children => this.handleChildrenChange(node.key, children)}
                />
            )}
        </div>
    )

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
