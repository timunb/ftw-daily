import React from 'react';
import PropTypes from 'prop-types';
import { compose } from 'redux';
import { FormattedMessage, injectIntl, intlShape } from '../../util/reactIntl';
import { Form as FinalForm } from 'react-final-form';
import classNames from 'classnames';
import * as validators from '../../util/validators';
import { Form, PrimaryButton, FieldTextInput, FieldSelect, FieldPhoneNumberInput } from '../../components';

import css from './SignupForm.module.css';

const KEY_CODE_ENTER = 13;

const SignupFormComponent = props => (
  <FinalForm
    {...props}
    render={fieldRenderProps => {
      const {
        rootClassName,
        className,
        formId,
        handleSubmit,
        inProgress,
        invalid,
        intl,
        onOpenTermsOfService,
      } = fieldRenderProps;

      // email
      const emailLabel = intl.formatMessage({
        id: 'SignupForm.emailLabel',
      });
      const emailPlaceholder = intl.formatMessage({
        id: 'SignupForm.emailPlaceholder',
      });
      const emailRequiredMessage = intl.formatMessage({
        id: 'SignupForm.emailRequired',
      });
      const emailRequired = validators.required(emailRequiredMessage);
      const emailInvalidMessage = intl.formatMessage({
        id: 'SignupForm.emailInvalid',
      });
      const emailValid = validators.emailFormatValid(emailInvalidMessage);

      // user type
      const userTypeLabel = intl.formatMessage({
        id: 'SignupForm.userTypeLabel',
      });
      const userTypePlaceholder = intl.formatMessage({
        id: 'SignupForm.userTypePlaceholder',
      });

      const userTypeBooker = intl.formatMessage({
        id: 'SignupForm.userTypeBooker',
      });

      const userTypeOwner = intl.formatMessage({
        id: 'SignupForm.userTypeOwner',
      });
      const userTypeRequiredMessage = intl.formatMessage({
        id: 'SignupForm.userTypeRequired',
      });
      const userTypeRequired = validators.required(userTypeRequiredMessage);

      // password
      const passwordLabel = intl.formatMessage({
        id: 'SignupForm.passwordLabel',
      });
      const passwordPlaceholder = intl.formatMessage({
        id: 'SignupForm.passwordPlaceholder',
      });
      const passwordRequiredMessage = intl.formatMessage({
        id: 'SignupForm.passwordRequired',
      });
      const passwordMinLengthMessage = intl.formatMessage(
        {
          id: 'SignupForm.passwordTooShort',
        },
        {
          minLength: validators.PASSWORD_MIN_LENGTH,
        }
      );
      const passwordMaxLengthMessage = intl.formatMessage(
        {
          id: 'SignupForm.passwordTooLong',
        },
        {
          maxLength: validators.PASSWORD_MAX_LENGTH,
        }
      );
      const passwordMinLength = validators.minLength(
        passwordMinLengthMessage,
        validators.PASSWORD_MIN_LENGTH
      );
      const passwordMaxLength = validators.maxLength(
        passwordMaxLengthMessage,
        validators.PASSWORD_MAX_LENGTH
      );
      const passwordRequired = validators.requiredStringNoTrim(passwordRequiredMessage);
      const passwordValidators = validators.composeValidators(
        passwordRequired,
        passwordMinLength,
        passwordMaxLength
      );

      // firstName
      const firstNameLabel = intl.formatMessage({
        id: 'SignupForm.firstNameLabel',
      });
      const firstNamePlaceholder = intl.formatMessage({
        id: 'SignupForm.firstNamePlaceholder',
      });
      const firstNameRequiredMessage = intl.formatMessage({
        id: 'SignupForm.firstNameRequired',
      });
      const firstNameRequired = validators.required(firstNameRequiredMessage);

      // lastName
      const lastNameLabel = intl.formatMessage({
        id: 'SignupForm.lastNameLabel',
      });
      const lastNamePlaceholder = intl.formatMessage({
        id: 'SignupForm.lastNamePlaceholder',
      });
      const lastNameRequiredMessage = intl.formatMessage({
        id: 'SignupForm.lastNameRequired',
      });

      // phoneNumber
      const phoneLabel = intl.formatMessage({
        id: 'SignupForm.phoneLabel',
      });
      const phonePlaceholder = intl.formatMessage({
        id: 'SignupForm.phonePlaceholder',
      });
      const phoneNumberRequiredMessage = intl.formatMessage({
        id: 'SignupForm.phoneNumberRequired',
      });

      const lastNameRequired = validators.required(lastNameRequiredMessage);
      const phoneRequired = validators.required(phoneNumberRequiredMessage);

      const classes = classNames(rootClassName || css.root, className);
      const submitInProgress = inProgress;
      const submitDisabled = invalid || submitInProgress;

      const handleTermsKeyUp = e => {
        // Allow click action with keyboard like with normal links
        if (e.keyCode === KEY_CODE_ENTER) {
          onOpenTermsOfService();
        }
      };
      const termsLink = (
        <span
          className={css.termsLink}
          onClick={onOpenTermsOfService}
          role="button"
          tabIndex="0"
          onKeyUp={handleTermsKeyUp}
        >
          <FormattedMessage id="SignupForm.termsAndConditionsLinkText" />
        </span>
      );

      return (
        <Form className={classes} onSubmit={handleSubmit}>

          <div>
            <FieldTextInput
              type="email"
              id={formId ? `${formId}.email` : 'email'}
              name="email"
              autoComplete="email"
              label={emailLabel}
              placeholder={emailPlaceholder}
              validate={validators.composeValidators(emailRequired, emailValid)}
            />
            <div className={css.name}>
              <FieldTextInput
                className={css.firstNameRoot}
                type="text"
                id={formId ? `${formId}.fname` : 'fname'}
                name="fname"
                autoComplete="given-name"
                label={firstNameLabel}
                placeholder={firstNamePlaceholder}
                validate={firstNameRequired}
              />
              <FieldTextInput
                className={css.lastNameRoot}
                type="text"
                id={formId ? `${formId}.lname` : 'lname'}
                name="lname"
                autoComplete="family-name"
                label={lastNameLabel}
                placeholder={lastNamePlaceholder}
                validate={lastNameRequired}
              />
            </div>

            <FieldPhoneNumberInput
              className={css.password}
              name="phoneNumber"
              id={formId ? `${formId}.phoneNumber` : 'phoneNumber'}
              label={phoneLabel}
              placeholder={phonePlaceholder}
              validate={phoneRequired}
            />

            <FieldTextInput
              className={css.password}
              type="password"
              id={formId ? `${formId}.password` : 'password'}
              name="password"
              autoComplete="new-password"
              label={passwordLabel}
              placeholder={passwordPlaceholder}
              validate={passwordValidators}
            />

            <FieldSelect
              id={formId ? `${formId}.type` : 'type'}
              name="userType"
              className={css.usertype}
              label={userTypeLabel}
              validate={userTypeRequired}
            >
              <option disabled value="">
                {userTypePlaceholder}
              </option>

              <option key="booker" value="booker">
                {userTypeBooker}
              </option>

              <option key="owner" value="owner">
                {userTypeOwner}
              </option>

            </FieldSelect>
          </div>

          <div className={css.bottomWrapper}>
            <p className={css.bottomWrapperText}>
              <span class="SignupForm_termsText__1vEFM"><span>By signing up you accept the <span class="SignupForm_termsLink__3yzaD" role="button" tabindex="0"><a href="https://www.film-locations.co.uk/terms/" target="_blank">terms and conditions</a></span></span></span>
            </p>
            <div class="g-recaptcha" data-sitekey="6LdiajscAAAAAB2_yYK6tRuKHAzCotiXeQnPOhSx
"></div>
            <PrimaryButton type="submit" inProgress={submitInProgress} disabled={submitDisabled}>
              <FormattedMessage id="SignupForm.signUp" />
            </PrimaryButton>
          </div>
        </Form>
      );
    }}
  />
);

SignupFormComponent.defaultProps = { inProgress: false };

const { bool, func } = PropTypes;

SignupFormComponent.propTypes = {
  inProgress: bool,

  onOpenTermsOfService: func.isRequired,

  // from injectIntl
  intl: intlShape.isRequired,
};

const SignupForm = compose(injectIntl)(SignupFormComponent);
SignupForm.displayName = 'SignupForm';

export default SignupForm;
