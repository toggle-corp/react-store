import { useEffect, useMemo } from 'react';
import { _cs, randomString } from '@togglecorp/fujs';

const portalChildQuery = '.portal-child';
const portalChildClassName = 'portal-child';
const portalChildShownClassName = 'portal-child-shown';

/*
# Breaking change
- It returns id and className that should be injected manually to children
*/

function addClassName(classNames: string, classNameToAdd: string) {
    const classNameList = classNames.split(' ');
    classNameList.push(classNameToAdd);
    return classNameList.join(' ');
}

function removeClassName(classNames: string, classNameToRemove: string) {
    const classNameList = classNames.split(' ');
    const index = classNameList.findIndex(d => d === classNameToRemove);
    if (index !== -1) {
        classNameList.splice(index, 1);
    }
    return classNameList.join(' ');
}

function refreshLastModalStatus(modals: NodeListOf<Element> | Element[]) {
    modals.forEach((modal: Element, i: number) => {
        if (i === modals.length - 1) {
            // eslint-disable-next-line no-param-reassign
            (modal as HTMLElement).dataset.lastModal = 'true';
        } else {
            // eslint-disable-next-line no-param-reassign
            (modal as HTMLElement).dataset.lastModal = 'false';
        }
    });
}

function useHaze(className?: string, enabled?: boolean) {
    const uniqueId = useMemo(
        () => randomString(16),
        [],
    );

    useEffect(
        () => {
            if (!enabled) {
                return undefined;
            }

            document.body.className = addClassName(
                document.body.className,
                portalChildShownClassName,
            );

            const modals = document.querySelectorAll(portalChildQuery);
            refreshLastModalStatus(modals);

            return () => {
                document.body.className = removeClassName(
                    document.body.className,
                    portalChildShownClassName,
                );

                const modalsExcludingMe = Array.from(
                    document.querySelectorAll(portalChildQuery),
                ).filter(n => n.id !== uniqueId);
                refreshLastModalStatus(modalsExcludingMe);
            };
        },
        [enabled, uniqueId],
    );

    if (!enabled) {
        return [undefined, className];
    }

    return [
        uniqueId,
        _cs(className, portalChildClassName),
    ];
}

export default useHaze;
