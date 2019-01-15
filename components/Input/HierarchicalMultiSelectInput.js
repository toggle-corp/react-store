import React from 'react';
import PropTypes from 'prop-types';

import { isFalsy } from '../../../../utils/common';
import MultiSelectInput from './MultiSelectInput';

const propTypes = {
    className: PropTypes.string,
    labelSelector: PropTypes.func,
    keySelector: PropTypes.func,
    childrenSelector: PropTypes.func,
    // eslint-disable-next-line react/forbid-prop-types
    options: PropTypes.array,
};

const defaultProps = {
    className: '',
    labelSelector: d => d.label,
    keySelector: d => d.key,
    childrenSelector: d => d.children,
    options: [],
};

export default class HierarchicalMultiSelectInput extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.state = {
            options: this.deflateList(props.options),
        };
    }

    componentWillReceiveProps(nextProps) {
        const { options: oldOptions } = this.props;
        const { options: newOptions } = nextProps;
        if (oldOptions !== newOptions) {
            const options = this.deflateList(newOptions);
            this.setState({ options });
        }
    }

    deflateList = (list, parentLabel) => (
        list.reduce(
            (acc, c) => ([
                ...acc,
                ...this.deflateObj(c, parentLabel),
            ]),
            [],
        )
    )

    deflateObj = (obj, parentLabel) => {
        const {
            childrenSelector,
            keySelector,
            labelSelector,
        } = this.props;

        const children = childrenSelector(obj) || [];

        let label = labelSelector(obj);
        if (!isFalsy(parentLabel, [''])) {
            label = `${parentLabel} / ${label}`;
        }

        const current = {
            key: keySelector(obj),
            label,
        };

        const deflatedChildren = this.deflateList(children, label);
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
