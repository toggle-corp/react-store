import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';

import {
    SortableContainer,
    SortableElement,
    SortableHandle,
    arrayMove,
} from 'react-sortable-hoc';

import { TransparentButton } from '../../Action';

import styles from './styles.scss';
import { iconNames } from '../../../constants';


const propTypes = {
    draggable: PropTypes.bool,
    value: PropTypes.arrayOf(PropTypes.shape({
        key: PropTypes.string,
        title: PropTypes.string,
        selected: PropTypes.bool,
        nodes: PropTypes.arrayOf(PropTypes.object), // Children nodes
    })),
    onChange: PropTypes.func,
};

const defaultProps = {
    draggable: true,
    onChange: undefined,
    value: [],
};

const DragHandle = SortableHandle(() => (
    <span className={`${iconNames.hamburger} drag-handle`} />
));


@CSSModules(styles, { allowMultiple: true })
export default class TreeSelection extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.state = {
            expanded: {},
            value: props.value,
        };
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.value !== this.state.value) {
            this.setState({ value: nextProps.value });
        }
    }

    // Based on selected values (true/false/'fuzzy'), get class-name
    // for checkbox
    getCheckBoxStyle = (selected) => {
        if (selected === 'fuzzy') {
            return iconNames.checkboxBlank;
        } else if (selected) {
            return iconNames.checkbox;
        }
        return `${iconNames.checkboxOutlineBlank} unchecked`;
    }

    // Set selected state for a particular node where selected = true/false/'fuzzy'
    // and do it for all the children
    // Immutable operation: so returns new object
    setNodeSelection = (node, selected) => ({
        ...node,
        nodes: node.nodes && node.nodes.map(n => this.setNodeSelection(n, selected)),
        selected,
    })

    // Toggle expand state of a node
    handleToggleExpand = (key) => {
        const expanded = { ...this.state.expanded };
        expanded[key] = !expanded[key];
        this.setState({ expanded });
    }

    // Handle toggling the state of checkbox including its children
    handleCheckBox = (key) => {
        const value = [...this.state.value];

        const index = value.findIndex(v => v.key === key);
        const state = !value[index].selected;
        value[index] = this.setNodeSelection(value[index], state);

        this.setState({ value });

        if (this.props.onChange) {
            this.props.onChange(value);
        }
    }

    // Update the children nodes
    // Change may include selected state and order of the children
    handleChildrenChange = (key, nodes) => {
        const value = [...this.state.value];
        const index = value.findIndex(v => v.key === key);

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

        // Otherwise we are selected, so leave true as default

        // Create new nodeValue and replace
        const nodeValue = {
            ...value[index],
            selected,
            nodes,
        };

        value[index] = nodeValue;
        this.setState({ value });

        if (this.props.onChange) {
            this.props.onChange(value);
        }
    }

    // Start sortable stuffs

    handleSortEnd = ({ oldIndex, newIndex }) => {
        const value = arrayMove(this.state.value, oldIndex, newIndex);
        this.setState({
            value,
        });

        if (this.props.onChange) {
            this.props.onChange(value);
        }
    };

    SortableNode = SortableElement(({ value }) => this.renderNode(value))

    SortableTree = SortableContainer(({ items }) => (
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
        <div className="tree-node">
            <div className="parent-node">
                {this.props.draggable && <DragHandle />}
                <TransparentButton
                    className={`${this.getCheckBoxStyle(node.selected)} checkbox`}
                    type="button"
                    onClick={() => this.handleCheckBox(node.key)}
                />
                <TransparentButton
                    className="node-title"
                    type="button"
                    onClick={() => this.handleCheckBox(node.key)}
                >
                    { node.title }
                </TransparentButton>

                {node.nodes && (
                    <TransparentButton
                        type="button"
                        className={
                            `expand-arrow
                            ${this.state.expanded[node.key]
                                ? iconNames.chevronUp
                                : iconNames.chevronDown
                            }`
                        }
                        onClick={() => this.handleToggleExpand(node.key)}
                    />
                )}
            </div>

            {node.nodes && this.state.expanded[node.key] && (
                <TreeSelection
                    value={node.nodes && node.nodes}
                    onChange={children => this.handleChildrenChange(node.key, children)}
                />
            )}
        </div>
    );

    render() {
        const { value } = this.state;

        return (
            <div className="tree-selection">
                <this.SortableTree
                    items={value}
                    onSortEnd={this.handleSortEnd}
                    lockAxis="y"
                    lockToContainerEdges
                    useDragHandle
                />
            </div>
        );
    }
}
