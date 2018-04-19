import React from 'react';

/*
 * FaramContext
 *
 * A react context to pass apis
 */

const FaramContext = {
    Group: React.createContext(undefined),
    List: React.createContext(undefined),
};
export default FaramContext;
