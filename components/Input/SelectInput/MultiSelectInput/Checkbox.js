import PropTypes from 'prop-types';
import React from 'react';

import { iconNames } from '../../../../constants';
import styles from '../options.scss';

const propTypes = {
    active: PropTypes.bool.isRequired,
};

export default class Checkbox extends React.PureComponent {
    static propTypes = propTypes;

    render() {
        const { active } = this.props;
        const classNames = ['checkbox', styles.checkbox];

        if (active) {
            classNames.push(iconNames.checkbox);
        } else {
            classNames.push(iconNames.checkboxOutlineBlank);
        }

        return <span className={classNames.join(' ')} />;
    }
}

