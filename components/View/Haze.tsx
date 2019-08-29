import React from 'react';

import { _cs } from '@togglecorp/fujs';

const portalChildrenClassName = '.portal-child';
const shownClassName = 'portal-child-shown';


interface Props<T> {
    // FIXME: temporarily added ref on children to access it
    children: React.ReactElement<T> & { ref: React.RefObject<HTMLElement> };
}

export default class Haze<T extends { className?: string }> extends React.PureComponent<Props<T>> {
    public componentDidMount() {
        const classNames = document.body.className.split(' ');
        classNames.push(shownClassName);
        document.body.className = classNames.join(' ');

        const modals = document.querySelectorAll(portalChildrenClassName);

        modals.forEach((modal, i) => {
            if (i === modals.length - 1) {
                // eslint-disable-next-line no-param-reassign
                (modal as HTMLElement).dataset.lastModal = 'true';
            } else {
                // eslint-disable-next-line no-param-reassign
                (modal as HTMLElement).dataset.lastModal = 'false';
            }
        });
    }

    public componentWillUnmount() {
        const classNames = document.body.className.split(' ');
        const index = classNames.findIndex(d => d === shownClassName);
        if (index !== -1) {
            classNames.splice(index, 1);
        }
        document.body.className = classNames.join(' ');

        const modals = Array.from(document.querySelectorAll(portalChildrenClassName))
            .filter(n => n !== this.props.children.ref.current);

        modals.forEach((modal, i) => {
            if (i === modals.length - 1) {
                // eslint-disable-next-line no-param-reassign
                (modal as HTMLElement).dataset.lastModal = 'true';
            } else {
                // eslint-disable-next-line no-param-reassign
                (modal as HTMLElement).dataset.lastModal = 'false';
            }
        });
    }

    public render() {
        const {
            children,
        } = this.props;

        if (!children) {
            return null;
        }

        return React.cloneElement(
            children,
            {
                className: _cs(children.props.className, 'portal-child'),
            },
        );
    }
}
