import React from 'react';
import PropTypes from 'prop-types';

import { _cs } from '@togglecorp/fujs';

const portalChildrenClassName = '.portal-child';
const shownClassName = 'portal-child-shown';

export default class Haze extends React.PureComponent {
    static propTypes = {
        // modalRef: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
        children: PropTypes.node.isRequired,
    }

    componentDidMount() {
        const classNames = document.body.className.split(' ');
        classNames.push(shownClassName);
        document.body.className = classNames.join(' ');

        const modals = document.querySelectorAll(portalChildrenClassName);
        modals.forEach((modal, i) => {
            if (i === modals.length - 1) {
                // eslint-disable-next-line no-param-reassign
                modal.dataset.lastModal = 'true';
            } else {
                // eslint-disable-next-line no-param-reassign
                modal.dataset.lastModal = 'false';
            }
        });
    }

    componentWillUnmount() {
        const classNames = document.body.className.split(' ');
        const index = classNames.findIndex(d => d === shownClassName);
        if (index !== -1) {
            classNames.splice(index, 1);
        }
        document.body.className = classNames.join(' ');

        const { children } = this.props;
        const modals = Array.from(document.querySelectorAll(portalChildrenClassName))
            .filter(n => n !== children.ref.current);

        modals.forEach((modal, i) => {
            if (i === modals.length - 1) {
                // eslint-disable-next-line no-param-reassign
                modal.dataset.lastModal = 'true';
            } else {
                // eslint-disable-next-line no-param-reassign
                modal.dataset.lastModal = 'false';
            }
        });
    }

    render() {
        const {
            children,
        } = this.props;

        return React.cloneElement(
            children,
            { className: _cs(children.props.className, 'portal-child') },
        );
    }
}
