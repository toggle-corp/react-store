/**
 * @author tnagorra <weathermist@gmail.com>
 */
import React from 'react';

export const ACTION = {
    inject: 'inject',
    skip: 'skip',
};

/*
const stringRepeat = (str, length) => (
    Array(length + 1).join(str)
);
*/

const injectRecursively = (element, injectionProperties, level = 0) => {
    // Get action to do, and new props for that action
    const getActionAndNewProps = (props, formoverrides = []) => {
        let action;
        let newProps;

        injectionProperties.some((injectionProperty) => {
            action = injectionProperty.getAction(props);
            // console.error(action);

            // get newProps if action is inject
            if (action === ACTION.inject) {
                newProps = injectionProperty.getProperty(props);
            }

            // continue while ACTION is not skip
            return action !== ACTION.skip;
        });

        // Remove all newProps that are not to override
        formoverrides.forEach((formoverride) => {
            delete newProps[formoverride];
        });

        // action=skip means injecting with empty object
        return { action, newProps };
    };

    // The main injection function
    const inject = (e) => {
        // Don't inject props on strings, numbers, etc.
        if (!React.isValidElement(e)) {
            // console.warn('Skipping', e);
            return e;
        }

        const { props: { formoverrides, ...originalProps } } = e;
        // Calculate new properties if the condition is true
        const { action, newProps } = getActionAndNewProps(originalProps, formoverrides);

        /*
        // DEBUG:
        const name = typeof e.type === 'string' ? e.type : (e.type.name || 'unknown');
        console.warn(`${stringRepeat('\t', level)}${name}: ${action}`);
        */

        switch (action) {
            case ACTION.skip:
                return React.cloneElement(
                    e,
                    {
                        ...originalProps,
                        children: injectRecursively(
                            originalProps.children,
                            injectionProperties,
                            level + 1,
                        ),
                    },
                );
            case ACTION.inject: {
                return React.cloneElement(
                    e,
                    {
                        ...originalProps,
                        ...newProps,
                    },
                );
            } default:
                console.error('Unidentified action', action);
                return e;
        }
    };

    // if (React.Children.count(element) <= 1) {
    if (Array.isArray(element)) {
        return React.Children.map(element, inject);
    }
    return inject(element);
};

export default injectRecursively;

