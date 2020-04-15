import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Modal, Form } from 'antd';

/**
 * The component containing the modal and form for setting settings for widgets.
 */
function ComponentSettings({
  visible,
  closeModal,
  children,
  submitForm,
}) {
  return (
    <Modal
      bodyStyle={{ padding: '1em' }}
      width={750}
      visible={visible}
      title="Component Settings"
      /**
       * On pressing the "OK" button at the footer of the modal, call the "submitForm"
       * and "closeModal" prop methods in the parent component (the widget). This will get
       * all off the form values, validate them and close the modal if everything is valid.
       */
      okText="Done"
      onOk={() => {
        submitForm();
        closeModal();
      }}
      footer={null}
      /**
       * On pressing the "Cancel" button at the footer of the modal, close the modal.
       */
      onCancel={() => closeModal()}
    >
      {children}
      {/* {!validForm ? <Alert message="Incomplete form." type="warning" showIcon /> : null} */}
    </Modal>
  );
}

ComponentSettings.propTypes = {
  /** Whether the modal is visible or not. */
  visible: PropTypes.bool.isRequired,
  /** The function to handle the closing of the modal. */
  closeModal: PropTypes.func.isRequired,
  /** Children prop */
  children: PropTypes.node,
  /** The function to handle the submission of the form. */
  submitForm: PropTypes.func.isRequired,
};

ComponentSettings.defaultProps = {
  children: [],
};

// const SettingsForm = Form.create({ name: 'horizontal_login' })(ComponentSettings);

export default ComponentSettings;
