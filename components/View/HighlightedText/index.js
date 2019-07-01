import PropTypes from 'prop-types';
import React from 'react';
import memoize from 'memoize-one';

import Highlight from './Highlight';


const createNestedSplits = (splits = []) => {
    const parents = [];
    const skip = {};
    for (let i = 0; i < splits.length; i += 1) {
        const parent = splits[i];

        if (skip[i]) {
            continue; // eslint-disable-line no-continue
        }

        const {
            start: parentStart,
            end: parentEnd,
        } = parent;

        const children = [];
        for (let j = i + 1; j < splits.length; j += 1) {
            const child = splits[j];


            const {
                start: childStart,
                end: childEnd,
                highlight: childHighlight,
            } = child;

            if (childStart < parentEnd && childEnd <= parentEnd) {
                skip[j] = true;
                const newChild = {
                    start: childStart - parentStart,
                    end: childEnd - parentStart,
                    highlight: childHighlight,
                };
                children.push(newChild);
            }
        }

        const newParent = {
            ...parent,
            children: createNestedSplits(children),
        };
        parents.push(newParent);
    }

    return parents;
};

const propTypes = {
    className: PropTypes.string,
    text: PropTypes.string.isRequired,
    highlights: PropTypes.arrayOf(PropTypes.shape({
        start: PropTypes.number,
        end: PropTypes.number,
        item: PropTypes.object,
    })).isRequired,
    renderer: PropTypes.func,
    rendererParams: PropTypes.func,
    startIndexSelector: PropTypes.func,
    endIndexSelector: PropTypes.func,
    keySelector: PropTypes.func,
    colorSelector: PropTypes.func,
    labelSelector: PropTypes.func,
    tooltipSelector: PropTypes.func,
};

const defaultProps = {
    className: '',
    renderer: Highlight,
    rendererParams: undefined,
    startIndexSelector: item => item.start,
    endIndexSelector: item => item.end,
    keySelector: item => item.key,
    colorSelector: item => item.color,
    labelSelector: item => item.label,
    tooltipSelector: item => item.tooltip,
};


export default class HighlightedText extends React.PureComponent {
    static propTypes = propTypes;

    static defaultProps = defaultProps;

    createNestedSplitsMemoized = memoize((splits, startIndexSelector, endIndexSelector) => (
        createNestedSplits(
            splits.map(split => ({
                highlight: split,
                start: startIndexSelector(split),
                end: endIndexSelector(split),
            })),
        )
    ));

    renderSplits = (text, splits, level = 1) => {
        const result = [];
        let index = 0;

        splits.forEach((split) => {
            const { start, end, children, highlight } = split;

            const splitIndex = Math.max(index, start);
            if (index < splitIndex) {
                result.push(
                    <span key={`split-${level}-${start}`}>
                        { text.substring(index, splitIndex) }
                    </span>,
                );
            }
            if (splitIndex === end) {
                return;
            }

            const {
                renderer: Renderer,
                rendererParams,
                keySelector,
                colorSelector,
                labelSelector,
                tooltipSelector,
            } = this.props;

            const key = keySelector(highlight);
            const color = colorSelector(highlight);
            const label = labelSelector(highlight);
            const tooltip = tooltipSelector(highlight);

            const otherProps = rendererParams
                ? rendererParams(key)
                : {};

            const actualStr = text.substring(start, end);
            const splitStr = text.substring(splitIndex, end);

            result.push(
                <Renderer
                    key={key}
                    highlightKey={key}
                    highlight={highlight}
                    color={color}
                    label={label}
                    tooltip={tooltip}
                    text={actualStr}
                    {...otherProps}
                >
                    { children.length > 0
                        ? this.renderSplits(splitStr, children, level + 1)
                        : splitStr
                    }
                </Renderer>,
            );

            index = end;
        });

        if (index < text.length) {
            result.push(
                <span key={`split-${level}`}>
                    { text.substring(index) }
                </span>,
            );
        }

        return result;
    }

    render() {
        const {
            className,
            highlights,
            text,
            startIndexSelector,
            endIndexSelector,
        } = this.props;

        const nestedSplits = this.createNestedSplitsMemoized(
            highlights,
            startIndexSelector,
            endIndexSelector,
        );

        return (
            <p className={className}>
                {this.renderSplits(text, nestedSplits)}
            </p>
        );
    }
}
