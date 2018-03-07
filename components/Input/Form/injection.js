/**
 * @author tnagorra <weathermist@gmail.com>
 */
import React from 'react';

export const ACTION = {
    inject: 'inject',
    skip: 'skip',
    skipTree: 'skipTree',
};

const injectRecursively = (element, injectionProperties) => {
    // Get action to do, and new props for that action
    const getActionAndNewProps = (props) => {
        let action;
        let newProps;

        injectionProperties.some((injectionProperty) => {
            action = injectionProperty.getAction(props);

            // get newProps if action is inject
            if (action === ACTION.inject) {
                newProps = injectionProperty.getProperty(props);
            }

            // continue while ACTION is not skip
            return action !== ACTION.skip;
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

        // Calculate new properties if the condition is true
        const { props } = e;
        const { action, newProps } = getActionAndNewProps(props);

        switch (action) {
            case ACTION.skipTree:
                return e;
            case ACTION.skip:
                return React.cloneElement(
                    e,
                    {
                        ...props,
                        children: injectRecursively(props.children, injectionProperties),
                    },
                );
            case ACTION.inject:
                return React.cloneElement(
                    e,
                    {
                        ...props,
                        ...newProps,
                    },
                );
            default:
                console.error('Unidentified action', action);
                return e;
        }
    };

    if (React.Children.count(element) <= 1) {
        return inject(element);
    }
    return React.Children.map(element, inject);
};

export default injectRecursively;

