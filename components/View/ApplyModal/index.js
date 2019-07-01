import PropTypes from 'prop-types';
import React from 'react';
import Faram from '@togglecorp/faram';

import PrimaryButton from '../../Action/Button/PrimaryButton';
import DangerButton from '../../Action/Button/DangerButton';

import Modal from '../Modal';
import ModalHeader from '../Modal/Header';
import ModalBody from '../Modal/Body';
import ModalFooter from '../Modal/Footer';

const noOp = () => undefined;

const propTypes = {
    className: PropTypes.string,
    children: PropTypes.node.isRequired,
    title: PropTypes.string.isRequired,
    onClose: PropTypes.func,
    onApply: PropTypes.func,
    schema: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
};

const defaultProps = {
    className: '',
    onClose: noOp,
    onApply: noOp,
};


// FIXME: remove this or move this to better place
export default class ApplyModal extends React.PureComponent {
    static propTypes = propTypes;

    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.state = {
            faramValues: {},
            faramErrors: {},
        };
    }

    getClassName = () => {
        const { className } = this.props;
        const classNames = [
            className,
            'apply-modal',
        ];

        return classNames.join(' ');
    }

    handleFaramSuccess = (values) => {
        const { onApply } = this.props;
        if (onApply) {
            onApply(values);
        }
    }

    handleFaramFailure = (faramErrors) => {
        this.setState({ faramErrors });
    }

    handleFaramChange = (faramValues, faramErrors) => {
        this.setState({
            faramValues,
            faramErrors,
        });
    }

    render() {
        const className = this.getClassName();
        const {
            onClose,
            title,
            children,
            schema,
        } = this.props;

        const {
            faramValues,
            faramErrors,
        } = this.state;

        return (
            <Modal
                className={className}
                closeOnEscape
                onClose={onClose}
            >
                <Faram
                    onChange={this.handleFaramChange}
                    onValidationFailure={this.handleFaramFailure}
                    onValidationSuccess={this.handleFaramSuccess}
                    schema={schema}
                    value={faramValues}
                    error={faramErrors}
                >
                    <ModalHeader title={title} />
                    <ModalBody>
                        {children}
                    </ModalBody>
                    <ModalFooter>
                        <DangerButton
                            onClick={onClose}
                            autoFocus
                        >
                            Close
                        </DangerButton>
                        <PrimaryButton type="submit">
                            Apply
                        </PrimaryButton>
                    </ModalFooter>
                </Faram>
            </Modal>
        );
    }
}
