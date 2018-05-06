import React from 'react';
import PropTypes from 'prop-types';

import MultiSelectInput from '../MultiSelectInput';

const propTypes = {
    className: PropTypes.string,
    labelSelector: PropTypes.func,
    keySelector: PropTypes.func,
    childrenSelector: PropTypes.func,
    // eslint-disable-next-line react/forbid-prop-types
    options: PropTypes.object,
    value: PropTypes.string,
};

const defaultProps = {
    className: '',
    labelSelector: d => d.label,
    keySelector: d => d.key,
    childrenSelector: d => d.children,
    options: {},
    value: undefined,
};

export default class HierarchicalMultiSelectInput extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.state = {
            options: this.deflate(props.options),
        };
    }

    componentWillReceiveProps(nextProps) {
        const { options: oldOptions } = this.props;
        const { options: newOptions } = nextProps;
        if (oldOptions !== newOptions) {
            const options = this.deflate(newOptions);
            this.setState({ options });
        }
    }

    deflate = (obj, parentLabel = undefined) => {
        const {
            childrenSelector,
            keySelector,
            labelSelector,
        } = this.props;

        const children = childrenSelector(obj) || [];

        let label = labelSelector(obj);
        if (parentLabel) {
            label = `${parentLabel} / ${label}`;
        }

        const current = {
            key: keySelector(obj),
            label,
        };

        const deflatedChildren = children.reduce(
            (acc, c) => ([
                ...acc,
                ...this.deflate(c, label),
            ]),
            [],
        );

        return [
            current,
            ...deflatedChildren,
        ];
    }

    render() {
        const {
            // eslint-disable-next-line no-unused-vars
            options: dummy,
            // eslint-disable-next-line no-unused-vars
            keySelector,
            // eslint-disable-next-line no-unused-vars
            labelSelector,
            // eslint-disable-next-line no-unused-vars
            childrenSelector,
            ...otherProps
        } = this.props;

        const { options } = this.state;

        return (
            <MultiSelectInput
                options={options}
                {...otherProps}
            />
        );
    }
}
