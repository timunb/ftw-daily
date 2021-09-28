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

  setNumberOfPeople(value, id) {
    localStorage.setItem('numberOfPeople', value);
  }

  setShootType(value, id) {
    localStorage.setItem('shootType', value);
  }

  setInsuranceProvider(value, id) {
    localStorage.setItem('insuranceProvider', value);
  }

  setPolicyNumber(value, id) {
    localStorage.setItem('policyNumber', value);
  }

  setExpiryDate(value, id) {
    localStorage.setItem('expiryDate', value);
  }

  setLiabilityValue(value, id) {
    localStorage.setItem('liabilityValue', value);
  }

  confirmPli(name) {
    const state = name.target.value;
    const element = document.getElementById('pliFields')

    if (state === true) {
      element.classList.add('show');
      localStorage.setItem('pliConfirmed', 'Yes');
    } else {
      element.classList.remove('show')
      localStorage.setItem('pliConfirmed', 'No');
    }
  }


  render() {
    const { rootClassName, queryParamNames, initialValues, className, price: unitPrice, ...rest } = this.props;
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

          const getDatesQueryParamName = queryParamNames => {
            return Array.isArray(queryParamNames)
              ? queryParamNames[0]
              : typeof queryParamNames === 'string'
              ? queryParamNames
              : 'dates';
          };

          const datesQueryParamName = getDatesQueryParamName(queryParamNames);
          const initialDates =
            initialValues && initialValues[datesQueryParamName]
              ? parseValue(initialValues[datesQueryParamName])
              : { dates: null };

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

          // Get dates from query string parameters
            function getParameterByName(name, url) {
               if (!url) url = window.location.href;
               name = name.replace(/[\[\]]/g, "\\$&");
               var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
                   results = regex.exec(url);
               if (!results) return null;
               if (!results[2]) return '';
               return decodeURIComponent(results[2].replace(/\+/g, " "));
           }

          // const queryDates = null;
          //
          // if (getParameterByName("start_date") && getParameterByName("end_date")) {
          //   const queryDates = {
          //     startDate: getParameterByName("start_date"),
          //     endDate: getParameterByName("end_date")
          //   };
          // }

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
                initialDates={initialDates}
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
                <option value="00:00">00:00
                </option><option value="00:30">00:30
                </option><option value="01:00">01:00
                </option><option value="01:30">01:30
                </option><option value="02:00">02:00
                </option><option value="02:30">02:30
                </option><option value="03:00">03:00
                </option><option value="03:30">03:30
                </option><option value="04:00">04:00
                </option><option value="04:30">04:30
                </option><option value="05:00">05:00
                </option><option value="05:30">05:30
                </option><option value="06:00">06:00
                </option><option value="06:30">06:30
                </option><option value="07:00">07:00
                </option><option value="07:30">07:30
                </option><option value="08:00">08:00
                </option><option value="08:30">08:30
                </option><option value="09:00">09:00
                </option><option value="09:30">09:30
                </option><option value="10:00">10:00
                </option><option value="10:30">10:30
                </option><option value="11:00">11:00
                </option><option value="11:30">11:30
                </option><option value="12:00">12:00
                </option><option value="12:30">12:30
                </option><option value="13:00">13:00
                </option><option value="13:30">13:30
                </option><option value="14:00">14:00
                </option><option value="14:30">14:30
                </option><option value="15:00">15:00
                </option><option value="15:30">15:30
                </option><option value="16:00">16:00
                </option><option value="16:30">16:30
                </option><option value="17:00">17:00
                </option><option value="17:30">17:30
                </option><option value="18:00">18:00
                </option><option value="18:30">18:30
                </option><option value="19:00">19:00
                </option><option value="19:30">19:30
                </option><option value="20:00">20:00
                </option><option value="20:30">20:30
                </option><option value="21:00">21:00
                </option><option value="21:30">21:30
                </option><option value="22:00">22:00
                </option><option value="22:30">22:30
                </option><option value="23:00">23:00
                </option><option value="23:30">23:30
                </option>
              </select>

              <label for="departureTime">Departure Time</label>
              <select id="departureTime" name="departure-time" onChange={e => this.setDepartureTime(e.target.value)}>
                <option disabled selected value="">
                  Pick a time
                </option>
                <option value="00:00">00:00
                </option><option value="00:30">00:30
                </option><option value="01:00">01:00
                </option><option value="01:30">01:30
                </option><option value="02:00">02:00
                </option><option value="02:30">02:30
                </option><option value="03:00">03:00
                </option><option value="03:30">03:30
                </option><option value="04:00">04:00
                </option><option value="04:30">04:30
                </option><option value="05:00">05:00
                </option><option value="05:30">05:30
                </option><option value="06:00">06:00
                </option><option value="06:30">06:30
                </option><option value="07:00">07:00
                </option><option value="07:30">07:30
                </option><option value="08:00">08:00
                </option><option value="08:30">08:30
                </option><option value="09:00">09:00
                </option><option value="09:30">09:30
                </option><option value="10:00">10:00
                </option><option value="10:30">10:30
                </option><option value="11:00">11:00
                </option><option value="11:30">11:30
                </option><option value="12:00">12:00
                </option><option value="12:30">12:30
                </option><option value="13:00">13:00
                </option><option value="13:30">13:30
                </option><option value="14:00">14:00
                </option><option value="14:30">14:30
                </option><option value="15:00">15:00
                </option><option value="15:30">15:30
                </option><option value="16:00">16:00
                </option><option value="16:30">16:30
                </option><option value="17:00">17:00
                </option><option value="17:30">17:30
                </option><option value="18:00">18:00
                </option><option value="18:30">18:30
                </option><option value="19:00">19:00
                </option><option value="19:30">19:30
                </option><option value="20:00">20:00
                </option><option value="20:30">20:30
                </option><option value="21:00">21:00
                </option><option value="21:30">21:30
                </option><option value="22:00">22:00
                </option><option value="22:30">22:30
                </option><option value="23:00">23:00
                </option><option value="23:30">23:30
                </option>
              </select>



              <label for="numberOfPeople">Number of People</label>
              <select id="numberOfPeople" name="numberOfPeople" onChange={e => this.setNumberOfPeople(e.target.value)}>
                <option disabled selected value="">
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
                <option value="11">
                  11
                </option>
                <option value="12">
                  12
                </option>
                <option value="13">
                  13
                </option>
                <option value="14">
                  14
                </option>
                <option value="15+">
                  15+
                </option>
              </select>

              <label for="shootType">Type of Shoot</label>
              <select id="shootType" name="shootType" onChange={e => this.setShootType(e.target.value)}>
              <option disabled selected value="">
                Pick a type
              </option>

              <option value="video">
                Filming
              </option>

              <option value="film">
                Still Photography Only
              </option>

              <option value="event">
                Event
              </option>

              </select>
              </div>

              <h2>PLI information</h2>

              <span class="FieldCheckbox_root__3zj8N">
              <input id="pliConfirm"
              class="FieldCheckbox_input__mLqZ5"
              type="checkbox"
              checked={this.state.check}
              onChange={(e) => {
                this.confirmPli({
                  target: {
                    name: e.target.name,
                    value: e.target.checked,
                  },
                });
              }}/>
              <label for="pliConfirm" class="FieldCheckbox_label__IMcLm">
              <span class="FieldCheckbox_checkboxWrapper__1s98A">
                <svg width="14" height="14" xmlns="http://www.w3.org/2000/svg"><g fill="none" fill-rule="evenodd"><g transform="translate(2 2)"><path class="FieldCheckbox_checked__cE7fY" d="M9.9992985 1.5048549l-.0194517 6.9993137C9.977549 9.3309651 9.3066522 10 8.4798526 10H1.5001008c-.8284271 0-1.5-.6715729-1.5-1.5l-.000121-7c0-.8284271.6715728-1.5 1.5-1.5h.000121l6.9993246.0006862c.8284272.000067 1.4999458.671694 1.499879 1.5001211a1.5002208 1.5002208 0 0 1-.0000059.0040476z"></path><path class="FieldCheckbox_box__2sdbR" stroke-width="2" d="M10.9992947 1.507634l-.0194518 6.9993137C10.9760133 9.8849417 9.8578519 11 8.4798526 11H1.5001008c-1.3807119 0-2.5-1.1192881-2.5-2.4999827L-1.0000202 1.5c0-1.3807119 1.119288-2.5 2.500098-2.5l6.9994284.0006862c1.3807118.0001115 2.4999096 1.11949 2.4997981 2.5002019-.0000018.003373-.0000018.003373-.0000096.0067458z"></path></g><path d="M5.636621 10.7824771L3.3573694 8.6447948c-.4764924-.4739011-.4764924-1.2418639 0-1.7181952.4777142-.473901 1.251098-.473901 1.7288122 0l1.260291 1.1254782 2.8256927-4.5462307c.3934117-.5431636 1.1545778-.6695372 1.7055985-.278265.5473554.3912721.6731983 1.150729.2797866 1.6951077l-3.6650524 5.709111c-.2199195.306213-.5803433.5067097-.9920816.5067097-.3225487 0-.6328797-.1263736-.8637952-.3560334z" fill="#FFF"></path></g></svg>
              </span>

              <span class="FieldCheckbox_text__1f3zE FieldCheckbox_textRoot__1FOIz">I confirm that I have Public Liability Insurance (PLI) for this shoot</span>
              </label>
              </span>


              <div id="pliFields" class="pli-fields">
                <label for="insuranceProvider">Insurance Provider name:</label>
                <input
                  id="insuranceProvider"
                  type="text"
                  value={this.state.name}
                  onChange={e => this.setInsuranceProvider(e.target.value)}
                />

                <label for="policyNumber">Policy Number:</label>
                <input
                  id="policyNumber"
                  type="text"
                  value={this.state.name}
                  onChange={e => this.setPolicyNumber(e.target.value)}
                />

                <label for="expiryDate">Expiry date:</label>
                <input
                  id="expiryDate"
                  type="text"
                  value={this.state.name}
                  onChange={e => this.setExpiryDate(e.target.value)}
                />

                <label for="liabilityValue">Value of public liability:</label>
                <input
                  id="liabilityValue"
                  type="text"
                  value={this.state.name}
                  onChange={e => this.setLiabilityValue(e.target.value)}
                />
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
  queryParamNames: arrayOf(string),
  initialValues: null
};

BookingDatesFormComponent.propTypes = {
  rootClassName: string,
  className: string,
  submitButtonWrapperClassName: string,
  queryParamNames: arrayOf(string),

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
