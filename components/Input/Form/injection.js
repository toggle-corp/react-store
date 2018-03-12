/**
 * @author tnagorra <weathermist@gmail.com>
 */
import React from 'react';

export const ACTION = {
    inject: 'inject',
    skip: 'skip',
};

const injectRecursively = (element, injectionProperties) => {
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
            return e;
        }

        const { props: { formoverrides, ...originalProps } } = e;
        // Calculate new properties if the condition is true
        const { action, newProps } = getActionAndNewProps(originalProps, formoverrides);

        switch (action) {
            case ACTION.skip:
                return React.cloneElement(
                    e,
                    {
                        ...originalProps,
                        children: injectRecursively(originalProps.children, injectionProperties),
                    },
                );
            case ACTION.inject: {
                return React.cloneElement(
                    e,
                    {
                        ...originalProps,
                        ...newProps,
                        // children: injectRecursively(originalProps.children, injectionProperties),
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

