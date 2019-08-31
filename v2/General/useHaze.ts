import { useEffect, useMemo } from 'react';
import { _cs, randomString } from '@togglecorp/fujs';

const portalChildQuery = '.portal-child';
const portalChildClassName = 'portal-child';
const portalChildShownClassName = 'portal-child-shown';

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

function useHaze(className?: string) {
    const uniqueId = useMemo(
        () => randomString(),
        [],
    );

    useEffect(
        () => {
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
        [],
    );

    return [
        uniqueId,
        _cs(className, portalChildClassName),
    ];
}

export default useHaze;
