import React from 'react';
import { string, bool } from 'prop-types';
import { compose } from 'redux';
import { FormattedMessage, injectIntl, intlShape } from '../../util/reactIntl';
import { Form as FinalForm } from 'react-final-form';
import classNames from 'classnames';
import { Form, PrimaryButton, FieldTextInput, IconEnquiry } from '../../components';
import * as validators from '../../util/validators';
import { propTypes } from '../../util/types';
import { useLocation } from 'react-router-dom';

import css from './EnquiryForm.module.css';

const EnquiryFormComponent = props => (
  <FinalForm
    {...props}
    render={fieldRenderProps => {
      const {
        rootClassName,
        className,
        submitButtonWrapperClassName,
        formId,
        handleSubmit,
        inProgress,
        intl,
        listingTitle,
        authorDisplayName,
        sendEnquiryError,
      } = fieldRenderProps;

      const messageLabel = intl.formatMessage(
        {
          id: 'EnquiryForm.messageLabel',
        },
        { authorDisplayName }
      );
      const messagePlaceholder = intl.formatMessage(
        {
          id: 'EnquiryForm.messagePlaceholder',
        },
        { authorDisplayName }
      );
      const messageRequiredMessage = intl.formatMessage({
        id: 'EnquiryForm.messageRequired',
      });
      const messageRequired = validators.requiredAndNonEmptyString(messageRequiredMessage);

      const classes = classNames(rootClassName || css.root, className);
      const submitInProgress = inProgress;
      const submitDisabled = submitInProgress;

      const queryParams = new URLSearchParams(useLocation().search);
      const start_date = queryParams.get('start_date');
      const end_date = queryParams.get('end_date');
      const arrival_time = queryParams.get('arrival_time');
      const departure_time = queryParams.get('departure_time');
      const people = queryParams.get('people');
      const shoot_type = queryParams.get('shoot_type');
      const company_name = queryParams.get('company_name');
      const company_address = queryParams.get('company_address');

      const messageIntro = 'Hi, I am interested in hiring your location ' + listingTitle + '\n\n';

      var messageDates = '';
      var messageTimes = '';
      var peopleMessage = '';
      var shootType = '';
      var companyName = '';
      var companyAddress = '';

      if (start_date && end_date) {
        messageDates = 'I am interested in the following dates: ' + start_date + ' and ' + end_date + '. ';
      }

      if (arrival_time && departure_time) {
        messageTimes = 'I would like to hire the location between the hours of ' + arrival_time + ' and ' + departure_time + '.\n\n';
      }

      const otherInfo = 'Some additional information regarding my enquiry: \n\n';

      if (people) {
        peopleMessage = 'Number of people: ' + people + '\n';
      }

      if (shoot_type) {
        shootType = 'Shoot type: ' + shoot_type + '\n';
      }

      if (company_name) {
        companyName = 'Company Name: ' + company_name + '\n';
      }

      if (company_address) {
        companyAddress = 'Company Address: ' + company_address + '\n';
      }


      return (
        <Form className={classes} onSubmit={handleSubmit} enforcePagePreloadFor="OrderDetailsPage">
          <IconEnquiry className={css.icon} />
          <h2 className={css.heading}>
            <FormattedMessage id="EnquiryForm.heading" values={{ listingTitle }} />
          </h2>
          <FieldTextInput
            className={css.field}
            type="textarea"
            name="message"
            defaultValue={messageIntro + messageDates + messageTimes + otherInfo + peopleMessage + shootType + companyName + companyAddress}
            id={formId ? `${formId}.message` : 'message'}
            label={messageLabel}
            placeholder={messagePlaceholder}
            validate={messageRequired}
          />
          <div className={submitButtonWrapperClassName}>
            {sendEnquiryError ? (
              <p className={css.error}>
                <FormattedMessage id="EnquiryForm.sendEnquiryError" />
              </p>
            ) : null}
            <PrimaryButton type="submit" inProgress={submitInProgress} disabled={submitDisabled}>
              <FormattedMessage id="EnquiryForm.submitButtonText" />
            </PrimaryButton>
          </div>
        </Form>
      );
    }}
  />
);

EnquiryFormComponent.defaultProps = {
  rootClassName: null,
  className: null,
  submitButtonWrapperClassName: null,
  inProgress: false,
  sendEnquiryError: null,
};

EnquiryFormComponent.propTypes = {
  rootClassName: string,
  className: string,
  submitButtonWrapperClassName: string,

  inProgress: bool,

  listingTitle: string.isRequired,
  authorDisplayName: string.isRequired,
  sendEnquiryError: propTypes.error,

  // from injectIntl
  intl: intlShape.isRequired,
};

const EnquiryForm = compose(injectIntl)(EnquiryFormComponent);

EnquiryForm.displayName = 'EnquiryForm';

export default EnquiryForm;
