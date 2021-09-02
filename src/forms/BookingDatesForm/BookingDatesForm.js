import React, { Component } from 'react';
import { string, bool, arrayOf, array, func } from 'prop-types';
import { compose } from 'redux';
import { Form as FinalForm, FormSpy } from 'react-final-form';
import classNames from 'classnames';
import moment from 'moment';
import config from '../../config';
import { FormattedMessage, intlShape, injectIntl } from '../../util/reactIntl';
import { required, bookingDatesRequired, composeValidators } from '../../util/validators';
import { START_DATE, END_DATE } from '../../util/dates';
import { propTypes } from '../../util/types';
import { Form, IconSpinner, PrimaryButton, FieldDateRangeInput, FieldCheckbox, FieldTextInput, FieldSelect } from '../../components';
import EstimatedBreakdownMaybe from './EstimatedBreakdownMaybe';

import css from './BookingDatesForm.module.css';

const identity = v => v;

export class BookingDatesFormComponent extends Component {
  constructor(props) {
    super(props);
    this.state = { focusedInput: null };
    this.handleFormSubmit = this.handleFormSubmit.bind(this);
    this.onFocusedInputChange = this.onFocusedInputChange.bind(this);
    this.handleOnChange = this.handleOnChange.bind(this);
    this.storeField = this.storeField.bind(this);
    this.togglePli = this.togglePli.bind(this);
  }

  // Function that can be passed to nested components
  // so that they can notify this component when the
  // focused input changes.
  onFocusedInputChange(focusedInput) {
    this.setState({ focusedInput });
  }

  storeField(e) {
    console.log(e.target.value);
  }

  togglePli(e) {
    alert('toggled');
    console.log(e.target.value);
  }

  // In case start or end date for the booking is missing
  // focus on that input, otherwise continue with the
  // default handleSubmit function.
  handleFormSubmit(e) {
    const { startDate, endDate } = e.bookingDates || {};
    if (!startDate) {
      e.preventDefault();
      this.setState({ focusedInput: START_DATE });
    } else if (!endDate) {
      e.preventDefault();
      this.setState({ focusedInput: END_DATE });
    } else {
      this.props.onSubmit(e);
    }
  }

  // When the values of the form are updated we need to fetch
  // lineItems from FTW backend for the EstimatedTransactionMaybe
  // In case you add more fields to the form, make sure you add
  // the values here to the bookingData object.
  handleOnChange(formValues) {
    const { startDate, endDate } =
      formValues.values && formValues.values.bookingDates ? formValues.values.bookingDates : {};
    const listingId = this.props.listingId;
    const isOwnListing = this.props.isOwnListing;

    if (startDate && endDate && !this.props.fetchLineItemsInProgress) {
      this.props.onFetchTransactionLineItems({
        bookingData: { startDate, endDate },
        listingId,
        isOwnListing,
      });
    }
  }

  setArrivalTime(value, id) {
    localStorage.setItem('arrivalTime', value);
  }

  setDepartureTime(value, id) {
    localStorage.setItem('departureTime', value);
  }

  render() {
    const { rootClassName, className, price: unitPrice, ...rest } = this.props;
    const classes = classNames(rootClassName || css.root, className);

    if (!unitPrice) {
      return (
        <div className={classes}>
          <p className={css.error}>
            <FormattedMessage id="BookingDatesForm.listingPriceMissing" />
          </p>
        </div>
      );
    }
    if (unitPrice.currency !== config.currency) {
      return (
        <div className={classes}>
          <p className={css.error}>
            <FormattedMessage id="BookingDatesForm.listingCurrencyInvalid" />
          </p>
        </div>
      );
    }

    return (
      <FinalForm
        {...rest}
        unitPrice={unitPrice}
        onSubmit={this.handleFormSubmit}
        render={fieldRenderProps => {
          const {
            endDatePlaceholder,
            startDatePlaceholder,
            formId,
            handleSubmit,
            intl,
            isOwnListing,
            submitButtonWrapperClassName,
            unitType,
            values,
            timeSlots,
            fetchTimeSlotsError,
            lineItems,
            fetchLineItemsInProgress,
            fetchLineItemsError,
          } = fieldRenderProps;
          const { startDate, endDate } = values && values.bookingDates ? values.bookingDates : {};

          const bookingStartLabel = intl.formatMessage({
            id: 'BookingDatesForm.bookingStartTitle',
          });
          const bookingEndLabel = intl.formatMessage({
            id: 'BookingDatesForm.bookingEndTitle',
          });
          const requiredMessage = intl.formatMessage({
            id: 'BookingDatesForm.requiredDate',
          });
          const startDateErrorMessage = intl.formatMessage({
            id: 'FieldDateRangeInput.invalidStartDate',
          });
          const endDateErrorMessage = intl.formatMessage({
            id: 'FieldDateRangeInput.invalidEndDate',
          });
          const timeSlotsError = fetchTimeSlotsError ? (
            <p className={css.sideBarError}>
              <FormattedMessage id="BookingDatesForm.timeSlotsError" />
            </p>
          ) : null;

          // This is the place to collect breakdown estimation data.
          // Note: lineItems are calculated and fetched from FTW backend
          // so we need to pass only booking data that is needed otherwise
          // If you have added new fields to the form that will affect to pricing,
          // you need to add the values to handleOnChange function
          const bookingData =
            startDate && endDate
              ? {
                  unitType,
                  startDate,
                  endDate,
                }
              : null;

          const showEstimatedBreakdown =
            bookingData && lineItems && !fetchLineItemsInProgress && !fetchLineItemsError;

          const bookingInfoMaybe = showEstimatedBreakdown ? (
            <div className={css.priceBreakdownContainer}>
              <h3 className={css.priceBreakdownTitle}>
                <FormattedMessage id="BookingDatesForm.priceBreakdownTitle" />
              </h3>
              <EstimatedBreakdownMaybe bookingData={bookingData} lineItems={lineItems} />
            </div>
          ) : null;

          const loadingSpinnerMaybe = fetchLineItemsInProgress ? (
            <IconSpinner className={css.spinner} />
          ) : null;

          const bookingInfoErrorMaybe = fetchLineItemsError ? (
            <span className={css.sideBarError}>
              <FormattedMessage id="BookingDatesForm.fetchLineItemsError" />
            </span>
          ) : null;

          const dateFormatOptions = {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
          };

          const now = moment();
          const today = now.startOf('day').toDate();
          const tomorrow = now
            .startOf('day')
            .add(1, 'days')
            .toDate();
          const startDatePlaceholderText =
            startDatePlaceholder || intl.formatDate(today, dateFormatOptions);
          const endDatePlaceholderText =
            endDatePlaceholder || intl.formatDate(tomorrow, dateFormatOptions);
          const submitButtonClasses = classNames(
            submitButtonWrapperClassName || css.submitButtonWrapper
          );

          return (
            <Form onSubmit={handleSubmit} className={classes} enforcePagePreloadFor="CheckoutPage">
              {timeSlotsError}
              <FormSpy
                subscription={{ values: true }}
                onChange={values => {
                  this.handleOnChange(values);
                }}
              />
              <FieldDateRangeInput
                className={css.bookingDates}
                name="bookingDates"
                unitType={unitType}
                startDateId={`${formId}.bookingStartDate`}
                startDateLabel={bookingStartLabel}
                startDatePlaceholderText={startDatePlaceholderText}
                endDateId={`${formId}.bookingEndDate`}
                endDateLabel={bookingEndLabel}
                endDatePlaceholderText={endDatePlaceholderText}
                focusedInput={this.state.focusedInput}
                onFocusedInputChange={this.onFocusedInputChange}
                format={identity}
                timeSlots={timeSlots}
                useMobileMargins
                validate={composeValidators(
                  required(requiredMessage),
                  bookingDatesRequired(startDateErrorMessage, endDateErrorMessage)
                )}
                disabled={fetchLineItemsInProgress}
              />

              {bookingInfoMaybe}
              {loadingSpinnerMaybe}
              {bookingInfoErrorMaybe}

              <p className={css.smallPrint}>
                <FormattedMessage
                  id={
                    isOwnListing
                      ? 'BookingDatesForm.ownListing'
                      : 'BookingDatesForm.youWontBeChargedInfo'
                  }
                />
              </p>

              <h2>Additional Information</h2>
              <div class="additional-details">
              <label for="arrivalTime">Arrival Time</label>
              <select id="arrivalTime" name="arrival-time" onChange={e => this.setArrivalTime(e.target.value)}>
                <option disabled selected value="">
                  Pick a time
                </option>
                <option value="Before 9am">
                  Before 9am
                </option>
                <option value="9am-10am">
                  9am-10am
                </option>
                <option value="10am-11am">
                  10am-11am
                </option>
                <option value="11am-12pm">
                  11am-12pm
                </option>
                <option value="12pm-1pm">
                  12pm-1pm
                </option>
                <option value="1pm-2pm">
                  1pm-2pm
                </option>
                <option value="2pm-3pm">
                  2pm-3pm
                </option>
                <option value="3pm-4pm">
                  3pm-4pm
                </option>
                <option value="4pm-5pm">
                  4pm-5pm
                </option>
                <option value="After 5pm">
                  After 5pm
                </option>
              </select>

              <label for="departureTime">Departure Time</label>
              <select id="departureTime" name="departure-time" onChange={e => this.setDepartureTime(e.target.value)}>
                <option disabled selected value="">
                  Pick a time
                </option>
                <option value="Before 9am">
                  Before 9am
                </option>
                <option value="9am-10am">
                  9am-10am
                </option>
                <option value="10am-11am">
                  10am-11am
                </option>
                <option value="11am-12pm">
                  11am-12pm
                </option>
                <option value="12pm-1pm">
                  12pm-1pm
                </option>
                <option value="1pm-2pm">
                  1pm-2pm
                </option>
                <option value="2pm-3pm">
                  2pm-3pm
                </option>
                <option value="3pm-4pm">
                  3pm-4pm
                </option>
                <option value="4pm-5pm">
                  4pm-5pm
                </option>
                <option value="After 5pm">
                  After 5pm
                </option>
              </select>

                <FieldSelect
                  id="numberOfPeople"
                  name="number-of-people"
                  label="Number of people"
                >
                  <option disabled value="">
                    Pick a number
                  </option>
                  <option value="1">
                    1
                  </option>
                  <option value="2">
                    2
                  </option>
                  <option value="3">
                    3
                  </option>
                  <option value="4">
                    4
                  </option>
                  <option value="5">
                    5
                  </option>
                  <option value="6">
                    6
                  </option>

                  <option value="7">
                    7
                  </option>
                  <option value="8">
                    8
                  </option>
                  <option value="9">
                    9
                  </option>
                  <option value="10">
                    10
                  </option>
                  <option value="10+">
                    10+
                  </option>

                </FieldSelect>

                <FieldSelect
                  id="shootType"
                  name="shoot-type"
                  label="Type of Shoot"
                >
                  <option disabled value="">
                    Pick a type
                  </option>

                  <option value="video">
                    Video
                  </option>

                  <option value="film">
                    Film
                  </option>

                  <option value="event">
                    Event
                  </option>

                  <option value="other">
                    Other
                  </option>

                </FieldSelect>
              </div>

              <h2>PLI information</h2>
              <FieldCheckbox
                id="pliConfirm"
                name="pli-confirm"
                label="I confirm that I have Public Liability Insurance (PLI) for this shoot."
                value="pli-confirm"
                onChange={this.togglePli}
              />
              <div class="pli-fields">
                <FieldTextInput type="text" id="insuranceProvider" name="insuranceProvider" label="Insurance Provider name:" onChange={this.storeField}/>

                <FieldTextInput type="text" id="policyNumber" name="policyNumber" label="Policy number:" />

                <FieldTextInput type="text" id="expiryDate" name="expiryDate" label="Expiry date:" />

                <FieldTextInput type="text" id="liabilityValue" name="liabilityValue" label="Value of public liability:" />
              </div>
              <br />
              <div className={submitButtonClasses}>
                <PrimaryButton type="submit">
                  <FormattedMessage id="BookingDatesForm.requestToBook" />
                </PrimaryButton>
              </div>
            </Form>
          );
        }}
      />
    );
  }
}

BookingDatesFormComponent.defaultProps = {
  rootClassName: null,
  className: null,
  submitButtonWrapperClassName: null,
  price: null,
  isOwnListing: false,
  startDatePlaceholder: null,
  endDatePlaceholder: null,
  timeSlots: null,
  lineItems: null,
  fetchLineItemsError: null,
};

BookingDatesFormComponent.propTypes = {
  rootClassName: string,
  className: string,
  submitButtonWrapperClassName: string,

  unitType: propTypes.bookingUnitType.isRequired,
  price: propTypes.money,
  isOwnListing: bool,
  timeSlots: arrayOf(propTypes.timeSlot),

  onFetchTransactionLineItems: func.isRequired,
  lineItems: array,
  fetchLineItemsInProgress: bool.isRequired,
  fetchLineItemsError: propTypes.error,

  // from injectIntl
  intl: intlShape.isRequired,

  // for tests
  startDatePlaceholder: string,
  endDatePlaceholder: string,
};

const BookingDatesForm = compose(injectIntl)(BookingDatesFormComponent);
BookingDatesForm.displayName = 'BookingDatesForm';

export default BookingDatesForm;
