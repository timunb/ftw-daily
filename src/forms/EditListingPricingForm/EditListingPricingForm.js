import React from 'react';
import { bool, func, shape, string } from 'prop-types';
import { compose } from 'redux';
import { Form as FinalForm } from 'react-final-form';
import { intlShape, injectIntl, FormattedMessage } from '../../util/reactIntl';
import classNames from 'classnames';
import config from '../../config';
import { LINE_ITEM_NIGHT, LINE_ITEM_DAY, propTypes } from '../../util/types';
import * as validators from '../../util/validators';
import { formatMoney } from '../../util/currency';
import { types as sdkTypes } from '../../util/sdkLoader';
import { Button, Form, FieldCurrencyInput } from '../../components';
import css from './EditListingPricingForm.module.css';

const { Money } = sdkTypes;

export const EditListingPricingFormComponent = props => (
  <FinalForm
    {...props}
    render={formRenderProps => {
      const {
        className,
        disabled,
        ready,
        handleSubmit,
        intl,
        invalid,
        pristine,
        saveActionMsg,
        updated,
        updateInProgress,
        fetchErrors,
        currentListing,
      } = formRenderProps;

      const unitType = config.bookingUnitType;
      const isNightly = unitType === LINE_ITEM_NIGHT;
      const isDaily = unitType === LINE_ITEM_DAY;

      const translationKey = isNightly
        ? 'EditListingPricingForm.pricePerNight'
        : isDaily
        ? 'EditListingPricingForm.pricePerDay'
        : 'EditListingPricingForm.pricePerUnit';

      const pricePerUnitMessage = intl.formatMessage({
        id: translationKey,
      });

      const pricePlaceholderMessage = intl.formatMessage({
        id: 'EditListingPricingForm.priceInputPlaceholder',
      });

      const priceRequired = validators.required(
        intl.formatMessage({
          id: 'EditListingPricingForm.priceRequired',
        })
      );
      const minPrice = new Money(config.listingMinimumPriceSubUnits, config.currency);
      const minPriceRequired = validators.moneySubUnitAmountAtLeast(
        intl.formatMessage(
          {
            id: 'EditListingPricingForm.priceTooLow',
          },
          {
            minPrice: formatMoney(intl, minPrice),
          }
        ),
        config.listingMinimumPriceSubUnits
      );
      const priceValidators = config.listingMinimumPriceSubUnits
        ? validators.composeValidators(priceRequired, minPriceRequired)
        : priceRequired;

      const classes = classNames(css.root, className);
      const submitReady = (updated && pristine) || ready;
      const submitInProgress = updateInProgress;
      const submitDisabled = invalid || disabled || submitInProgress;
      const { updateListingError, showListingsError } = fetchErrors || {};
      const existingParkingFee = currentListing.attributes.publicData.parkingFee;
      const existingCleaningFee = currentListing.attributes.publicData.cleaningFee;
      const existingSecurityFee = currentListing.attributes.publicData.securityFee;
      const existingLargeShootFee = currentListing.attributes.publicData.largeShootFee;
      const existingOvertimeFee = currentListing.attributes.publicData.overtimeFee;

      return (
        <Form onSubmit={handleSubmit} className={classes}>
          {updateListingError ? (
            <p className={css.error}>
              <FormattedMessage id="EditListingPricingForm.updateFailed" />
            </p>
          ) : null}
          {showListingsError ? (
            <p className={css.error}>
              <FormattedMessage id="EditListingPricingForm.showListingFailed" />
            </p>
          ) : null}
          <FieldCurrencyInput
            id="price"
            name="price"
            className={css.priceInput}
            autoFocus
            label={pricePerUnitMessage}
            placeholder={pricePlaceholderMessage}
            currencyConfig={config.currencyConfig}
            validate={priceValidators}
          />

          {existingParkingFee ? (
            <FieldCurrencyInput
              id="parkingFee"
              name="parkingFee"
              className={css.parkingFeeInput}
              autoFocus
              label="Parking:﻿ Fees for parking permits and spaces etc"
              placeholder="Enter your parking fee if applicable"
              currencyConfig={config.currencyConfig}
            />
          ) : null}

          {existingCleaningFee ? (
            <FieldCurrencyInput
              id="cleaningFee"
              name="cleaningFee"
              className={css.cleaningFeeInput}
              autoFocus
              label="Cleaning: ﻿Pre/post-shoot cleaning fees"
              placeholder="Enter your cleaning fee if applicable"
              currencyConfig={config.currencyConfig}
            />
          ) : null}

          {existingSecurityFee ? (
            <FieldCurrencyInput
              id="securityFee"
              name="securityFee"
              className={css.securityFeeInput}
              autoFocus
              label="Security: ﻿Fees if your location is required to hire security﻿"
              placeholder="Enter your security fee if applicable"
              currencyConfig={config.currencyConfig}
            />
          ) : null}

          {existingLargeShootFee ? (
            <FieldCurrencyInput
              id="largeShootFee"
              name="largeShootFee"
              className={css.largeShootFeeInput}
              autoFocus
              label="Large Shoot Fee (Above 15 crew): If a shoot has a large crew or the production is complex/has a high impact on your location."
              placeholder="Enter your large shoot fee if applicable"
              currencyConfig={config.currencyConfig}
            />
          ) : null}

          {existingOvertimeFee ? (
            <FieldCurrencyInput
              id="overtimeFee"
              name="overtimeFee"
              className={css.overtimeFeeInput}
              autoFocus
              label="Overtime fee: How much you charge per hour (post shoot) if a shoot runs past agreed booking time"
              placeholder="Enter your overtime fee if applicable"
              currencyConfig={config.currencyConfig}
            />
          ) : null}

          <Button
            className={css.submitButton}
            type="submit"
            inProgress={submitInProgress}
            disabled={submitDisabled}
            ready={submitReady}
          >
            {saveActionMsg}
          </Button>
        </Form>
      );
    }}
  />
);

EditListingPricingFormComponent.defaultProps = { fetchErrors: null };

EditListingPricingFormComponent.propTypes = {
  intl: intlShape.isRequired,
  onSubmit: func.isRequired,
  saveActionMsg: string.isRequired,
  disabled: bool.isRequired,
  ready: bool.isRequired,
  updated: bool.isRequired,
  updateInProgress: bool.isRequired,
  fetchErrors: shape({
    showListingsError: propTypes.error,
    updateListingError: propTypes.error,
  }),
};

export default compose(injectIntl)(EditListingPricingFormComponent);
