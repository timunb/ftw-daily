import React, { Component, useState } from 'react';
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
import { formatMoney } from '../../util/currency';
import { types as sdkTypes } from '../../util/sdkLoader';
import { Form, IconSpinner, PrimaryButton, FieldDateRangeInput, FieldCheckbox, FieldTextInput, FieldSelect } from '../../components';
import EstimatedBreakdownMaybe from './EstimatedBreakdownMaybe';
import { useLocation } from 'react-router-dom';
import css from './BookingDatesForm.module.css';
import { SingleDatePicker } from 'react-dates';


const { Money } = sdkTypes;

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
    const hasCleaningFee = this.props.cleaningFee;
    const hasParkingFee = this.props.parkingFee;
    const hasSecurityFee = this.props.securityFee;
    var hasOvertimeFee = false;
    var hasLargeShootFee = false;
    var arrivalOvertimeHours = 0
    var departureOvertimeHours = 0;
    var totalOvertimeHours = 0;
    // Calculate overtime from arrival time
    if (formValues.active == "arrivalTime" && formValues.values.arrivalTime && this.props.overtimeFee) {
      var arrTime = formValues.values.arrivalTime;
      localStorage.setItem('arrivalTime', arrTime);

      var arrivalOvertime = 0;
      var overTimeAm = 0;
      var overTimePm = 0;

      if (arrTime.includes("AM")) {
        var selectedTimeAm = arrTime.replace("AM", "").split(":", 2)[0];
        // console.log(selectedTime);
        if (selectedTimeAm < 9 && selectedTimeAm != 12) {
          overTimeAm = Math.abs(9 - selectedTimeAm)
        }

        if (selectedTimeAm == 12) {
          overTimeAm = 9;
        }

      }

      if (arrTime.includes("PM")) {
        var selectedTimePm = arrTime.replace("PM", "").split(":", 2)[0];
        // console.log(selectedTime);
        if (selectedTimePm > 5) {
          overTimeAm = Math.abs(selectedTimePm - 5)
        }

      }

      arrivalOvertime = Math.abs(overTimeAm + overTimePm)

      arrivalOvertimeHours = arrivalOvertime;
      localStorage.setItem('arrivalOvertime', arrivalOvertime);
      console.log(arrivalOvertime);
    }

    console.log(formValues.active);

    // Calculate overtime from arrival time
    if (formValues.active == "departureTime" && formValues.values.departureTime && this.props.overtimeFee) {
      var depTime = formValues.values.departureTime;
      localStorage.setItem('arrivalTime', depTime);

      var departureOvertime = 0;
      var overTimeAm = 0;
      var overTimePm = 0;

      if (depTime.includes("AM")) {
        var selectedTimeAm = depTime.replace("AM", "").split(":", 2)[0];
        // console.log(selectedTime);
        if (selectedTimeAm < 9 && selectedTimeAm != 12) {
          overTimeAm = Math.abs(9 - selectedTimeAm)
        }

        if (selectedTimeAm == 12) {
          overTimeAm = 9;
        }

      }

      if (depTime.includes("PM")) {
        var selectedTimePm = depTime.replace("PM", "").split(":", 2)[0];
        // console.log(selectedTime);
        if (selectedTimePm > 5) {
          overTimeAm = Math.abs(selectedTimePm - 5)
        }

      }
      departureOvertime = Math.abs(overTimeAm + overTimePm)
      departureOvertimeHours = departureOvertime;

      localStorage.setItem('departureOvertime', departureOvertime);

      console.log(departureOvertime);
    }

    totalOvertimeHours = Math.abs(Number(localStorage.getItem('departureOvertime')) + Number(localStorage.getItem('arrivalOvertime')));

    localStorage.setItem('totalOvertimeHours', totalOvertimeHours);

    if (totalOvertimeHours > 0) {
      hasOvertimeFee = this.props.overtimeFee;
    }

    if (this.props.largeShootFee) {
      if (formValues.active == "numberOfPeople") {
        localStorage.setItem('numberOfPeople', formValues.values.numberOfPeople);
      }

      if ((formValues.active == "numberOfPeople" && formValues.values.numberOfPeople == "15 plus") || localStorage.getItem('numberOfPeople') == "15 plus") {
        hasLargeShootFee = this.props.largeShootFee;
      }
    }

    const listingId = this.props.listingId;
    const isOwnListing = this.props.isOwnListing;

    if (startDate && endDate && !this.props.fetchLineItemsInProgress) {
      this.props.onFetchTransactionLineItems({
        bookingData: { startDate, endDate, hasCleaningFee, hasParkingFee, hasSecurityFee, hasLargeShootFee, hasOvertimeFee },
        listingId,
        isOwnListing,
      });
    }
  }

  componentWillMount(){
    localStorage.removeItem('numberOfPeople');
  }

  componentDidMount() {

    // localStorage.removeItem('numberOfPeople');

    if (!localStorage.getItem('departureOvertime')) {
      localStorage.setItem('departureOvertime', 0);
    }
    if (!localStorage.getItem('arrivalOvertime')) {
      localStorage.setItem('arrivalOvertime', 0);
    }

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

  setInsuranceProviderContact(value, id) {
    localStorage.setItem('insuranceProviderContact', value);
  }

  setPolicyNumber(value, id) {
    localStorage.setItem('policyNumber', value);
  }

  setExpiryDate(startingDate) {
    setTimeout(function() {
      var newExpiryDate = document.getElementById("expiryDate").value;
      localStorage.setItem('expiryDate', newExpiryDate);
    }, 200);

  }

  setLiabilityValue(value, id) {
    localStorage.setItem('liabilityValue', value);
  }

  setContactNumber(value, id) {
    localStorage.setItem('contactNumber', value);
  }

  setCompanyName(value, id) {
    localStorage.setItem('companyName', value);
  }

  setCompanyAddress(value, id) {
    localStorage.setItem('companyAddress', value);
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

  confirmTerms(name) {
    const state = name.target.value;
    const element = document.getElementById('formSubmit')

    if (state === true) {
      element.removeAttribute("disabled");
      localStorage.setItem('termsConfirmed', 'Yes');
    } else {
      element.disabled = true;
      localStorage.setItem('termsConfirmed', 'No');
    }
  }


  render() {
    const { rootClassName, queryParamNames, initialValues, className, price: unitPrice, ...rest } = this.props;
    const classes = classNames(rootClassName || css.root, className);

    if (localStorage.getItem('numberOfPeople') === null) {
      localStorage.removeItem('numberOfPeople');
    }

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
            parkingFee,
            cleaningFee,
            securityFee,
            largeShootFee,
            overtimeFee,
          } = fieldRenderProps;

          const formattedParkingFee = parkingFee
            ? formatMoney(
                intl,
                new Money(parkingFee.amount, parkingFee.currency)
              )
            : null;

          const formattedCleaningFee = cleaningFee
            ? formatMoney(
                intl,
                new Money(cleaningFee.amount, cleaningFee.currency)
              )
            : null;

          const formattedSecurityFee = securityFee
            ? formatMoney(
                intl,
                new Money(securityFee.amount, securityFee.currency)
              )
            : null;

            const formattedOvertimeFee = overtimeFee
              ? formatMoney(
                  intl,
                  new Money(overtimeFee.amount, overtimeFee.currency)
                )
              : null;

          const formattedLargeShootFee = largeShootFee
            ? formatMoney(
                intl,
                new Money(largeShootFee.amount, largeShootFee.currency)
              )
            : null;

          const cleaningFeeLabel = intl.formatMessage(
            { id: 'BookingDatesForm.cleaningFeeLabel' },
            { fee: formattedCleaningFee }
          );

          const parkingFeeLabel = intl.formatMessage(
            { id: 'BookingDatesForm.parkingFeeLabel' },
            { fee: formattedParkingFee }
          );

          const securityFeeLabel = intl.formatMessage(
            { id: 'BookingDatesForm.securityFeeLabel' },
            { fee: formattedSecurityFee }
          );

          const overtimeFeeLabel = intl.formatMessage(
            { id: 'BookingDatesForm.overtimeFeeLabel' },
            { fee: formattedOvertimeFee }
          );

          const largeShootFeeLabel = intl.formatMessage(
            { id: 'BookingDatesForm.largeShootFeeLabel' },
            { fee: formattedLargeShootFee }
          );

          const additionalFeesMaybe = parkingFee || cleaningFee || securityFee || overtimeFee || largeShootFee? (
            <h2>Additional Fees:</h2>
          ) : null;

          const parkingFeeMaybe = parkingFee ? (
            <div>{parkingFeeLabel}</div>
          ) : null;

          const cleaningFeeMaybe = cleaningFee ? (
            <div>{cleaningFeeLabel}</div>
          ) : null;

          const securityFeeMaybe = securityFee ? (
            <div>{securityFeeLabel}</div>
          ) : null;

          const overtimeFeeMaybe = overtimeFee ? (
            <div>{overtimeFeeLabel}</div>
          ) : null;

          const largeShootFeeMaybe = largeShootFee ? (
            <div>{largeShootFeeLabel}</div>
          ) : null;

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

          const queryParams = new URLSearchParams(useLocation().search);
          const start_date = queryParams.get('start_date');
          const end_date = queryParams.get('end_date');

          const arrival_time = queryParams.get('arrival_time');
          const departure_time = queryParams.get('departure_time');
          const people = queryParams.get('people');
          const shoot_type = queryParams.get('shoot_type');
          const company_name = queryParams.get('company_name');
          const company_address = queryParams.get('company_address');
          const contact_number = queryParams.get('contact_number');

          const [startingDate, setStartDate] = useState(new Date());

          var defaultContact = '';
          var defaultCompany = '';
          var defaultCompanyAddress = '';

          if (contact_number) {
            defaultContact = contact_number;
          }

          if (company_name) {
            defaultCompany = company_name;
          }

          if (company_address) {
            defaultCompanyAddress = company_address;
          }

          setTimeout(function() {
            if (shoot_type) {
              document.getElementById('shootType').value = shoot_type;
            }
          }, 400);


          var queryDates = null;

          if (start_date && end_date) {
            queryDates = {
              startDate: start_date,
              endDate: end_date
            };
          }

          return (
            <Form onSubmit={handleSubmit} className={classes} enforcePagePreloadFor="CheckoutPage">
              {timeSlotsError}
              <FormSpy
                onChange={values => {
                  this.handleOnChange(values);
                }}
              />
              <FieldDateRangeInput
                className={css.bookingDates}
                name="bookingDates"
                initialDates={queryDates}
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

              <label htmlFor="numberOfPeople">Number of People</label>

              <FieldSelect
                id="numberOfPeople"
                name="numberOfPeople"
              >
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
                <option value="15 plus">
                  15+
                </option>

              </FieldSelect>

              {additionalFeesMaybe}
              {parkingFeeMaybe}
              {cleaningFeeMaybe}
              {securityFeeMaybe}
              {largeShootFeeMaybe}
              {overtimeFeeMaybe}
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
              <div className="additional-details">
              <label htmlFor="arrivalTime">Arrival Time</label>
                <FieldSelect
                  id="arrivalTime"
                  name="arrivalTime"
                >
                <option disabled selected value="">
                  Pick a time
                </option>
                <option value="12:00 AM">12:00 AM
                </option><option value="12:30 AM">12:30 AM
                </option><option value="1:00 AM">1:00 AM
                </option><option value="1:30 AM">1:30 AM
                </option><option value="2:00 AM">2:00 AM
                </option><option value="2:30 AM">2:30 AM
                </option><option value="3:00 AM">3:00 AM
                </option><option value="3:30 AM">3:30 AM
                </option><option value="4:00 AM">4:00 AM
                </option><option value="4:30 AM">4:30 AM
                </option><option value="5:00 AM">5:00 AM
                </option><option value="5:30 AM">5:30 AM
                </option><option value="6:00 AM">6:00 AM
                </option><option value="6:30 AM">6:30 AM
                </option><option value="7:00 AM">7:00 AM
                </option><option value="7:30 AM">7:30 AM
                </option><option value="8:00 AM">8:00 AM
                </option><option value="8:30 AM">8:30 AM
                </option><option value="9:00 AM">9:00 AM
                </option><option value="9:30 AM">9:30 AM
                </option><option value="10:00 AM">10:00 AM
                </option><option value="10:30 AM">10:30 AM
                </option><option value="11:00 AM">11:00 AM
                </option><option value="11:30 AM">11:30 AM
                </option><option value="12:30 PM">12:30 PM
                </option><option value="1:00 PM">1:00 PM
                </option><option value="1:30 PM">1:30 PM
                </option><option value="2:00 PM">2:00 PM
                </option><option value="2:30 PM">2:30 PM
                </option><option value="3:00 PM">3:00 PM
                </option><option value="3:30 PM">3:30 PM
                </option><option value="4:00 PM">4:00 PM
                </option><option value="4:30 PM">4:30 PM
                </option><option value="5:00 PM">5:00 PM
                </option><option value="5:30 PM">5:30 PM
                </option><option value="6:00 PM">6:00 PM
                </option><option value="6:30 PM">6:30 PM
                </option><option value="7:00 PM">7:00 PM
                </option><option value="7:30 PM">7:30 PM
                </option><option value="8:00 PM">8:00 PM
                </option><option value="8:30 PM">8:30 PM
                </option><option value="9:00 PM">9:00 PM
                </option><option value="9:30 PM">9:30 PM
                </option><option value="10:00 PM">10:00 PM
                </option><option value="10:30 PM">10:30 PM
                </option><option value="11:00 PM">11:00 PM
                </option><option value="11:30 PM">11:30 PM
                </option>
              </FieldSelect>

              <label htmlFor="departureTime">Departure Time</label>
              <FieldSelect
                id="departureTime"
                name="departureTime"
              >
                <option disabled selected value="">
                  Pick a time
                </option>
                <option value="12:00 AM">12:00 AM
                </option><option value="12:30 AM">12:30 AM
                </option><option value="1:00 AM">1:00 AM
                </option><option value="1:30 AM">1:30 AM
                </option><option value="2:00 AM">2:00 AM
                </option><option value="2:30 AM">2:30 AM
                </option><option value="3:00 AM">3:00 AM
                </option><option value="3:30 AM">3:30 AM
                </option><option value="4:00 AM">4:00 AM
                </option><option value="4:30 AM">4:30 AM
                </option><option value="5:00 AM">5:00 AM
                </option><option value="5:30 AM">5:30 AM
                </option><option value="6:00 AM">6:00 AM
                </option><option value="6:30 AM">6:30 AM
                </option><option value="7:00 AM">7:00 AM
                </option><option value="7:30 AM">7:30 AM
                </option><option value="8:00 AM">8:00 AM
                </option><option value="8:30 AM">8:30 AM
                </option><option value="9:00 AM">9:00 AM
                </option><option value="9:30 AM">9:30 AM
                </option><option value="10:00 AM">10:00 AM
                </option><option value="10:30 AM">10:30 AM
                </option><option value="11:00 AM">11:00 AM
                </option><option value="11:30 AM">11:30 AM
                </option><option value="12:30 PM">12:30 PM
                </option><option value="1:00 PM">1:00 PM
                </option><option value="1:30 PM">1:30 PM
                </option><option value="2:00 PM">2:00 PM
                </option><option value="2:30 PM">2:30 PM
                </option><option value="3:00 PM">3:00 PM
                </option><option value="3:30 PM">3:30 PM
                </option><option value="4:00 PM">4:00 PM
                </option><option value="4:30 PM">4:30 PM
                </option><option value="5:00 PM">5:00 PM
                </option><option value="5:30 PM">5:30 PM
                </option><option value="6:00 PM">6:00 PM
                </option><option value="6:30 PM">6:30 PM
                </option><option value="7:00 PM">7:00 PM
                </option><option value="7:30 PM">7:30 PM
                </option><option value="8:00 PM">8:00 PM
                </option><option value="8:30 PM">8:30 PM
                </option><option value="9:00 PM">9:00 PM
                </option><option value="9:30 PM">9:30 PM
                </option><option value="10:00 PM">10:00 PM
                </option><option value="10:30 PM">10:30 PM
                </option><option value="11:00 PM">11:00 PM
                </option><option value="11:30 PM">11:30 PM
                </option>
              </FieldSelect>

              <label htmlFor="shootType">Type of Shoot</label>
              <select id="shootType" name="shootType" onChange={e => this.setShootType(e.target.value)}>
              <option disabled selected value="">
                Pick a type
              </option>

              <option value="video">
                Filming
              </option>

              <option value="photography">
                Still Photography Only
              </option>

              <option value="event">
                Event
              </option>

              </select>

              <label htmlFor="contactNumber">Contact Number</label>
              <input
                id="contactNumber"
                type="text"
                value={this.state.name}
                defaultValue={defaultContact}
                onChange={e => this.setContactNumber(e.target.value)}
              />

              <label htmlFor="companyName">Company Name</label>
              <input
                id="companyName"
                type="text"
                value={this.state.name}
                defaultValue={defaultCompany}
                onChange={e => this.setCompanyName(e.target.value)}
              />

              <label htmlFor="companyAddress">Company Address</label>
              <input
                id="companyAddress"
                type="text"
                value={this.state.name}
                defaultValue={defaultCompanyAddress}
                onChange={e => this.setCompanyAddress(e.target.value)}
              />

              </div>

              <h2>PLI information</h2>

              <span className="FieldCheckbox_root__3zj8N">
              <input id="pliConfirm"
              className="FieldCheckbox_input__mLqZ5"
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
              <label htmlFor="pliConfirm" className="FieldCheckbox_label__IMcLm">
              <span className="FieldCheckbox_checkboxWrapper__1s98A">
                <svg width="14" height="14" xmlns="http://www.w3.org/2000/svg"><g fill="none" fillRule="evenodd"><g transform="translate(2 2)"><path className="FieldCheckbox_checked__cE7fY" d="M9.9992985 1.5048549l-.0194517 6.9993137C9.977549 9.3309651 9.3066522 10 8.4798526 10H1.5001008c-.8284271 0-1.5-.6715729-1.5-1.5l-.000121-7c0-.8284271.6715728-1.5 1.5-1.5h.000121l6.9993246.0006862c.8284272.000067 1.4999458.671694 1.499879 1.5001211a1.5002208 1.5002208 0 0 1-.0000059.0040476z"></path><path className="FieldCheckbox_box__2sdbR"  strokeWidth="2" d="M10.9992947 1.507634l-.0194518 6.9993137C10.9760133 9.8849417 9.8578519 11 8.4798526 11H1.5001008c-1.3807119 0-2.5-1.1192881-2.5-2.4999827L-1.0000202 1.5c0-1.3807119 1.119288-2.5 2.500098-2.5l6.9994284.0006862c1.3807118.0001115 2.4999096 1.11949 2.4997981 2.5002019-.0000018.003373-.0000018.003373-.0000096.0067458z"></path></g><path d="M5.636621 10.7824771L3.3573694 8.6447948c-.4764924-.4739011-.4764924-1.2418639 0-1.7181952.4777142-.473901 1.251098-.473901 1.7288122 0l1.260291 1.1254782 2.8256927-4.5462307c.3934117-.5431636 1.1545778-.6695372 1.7055985-.278265.5473554.3912721.6731983 1.150729.2797866 1.6951077l-3.6650524 5.709111c-.2199195.306213-.5803433.5067097-.9920816.5067097-.3225487 0-.6328797-.1263736-.8637952-.3560334z" fill="#FFF"></path></g></svg>
              </span>

              <span className="FieldCheckbox_text__1f3zE FieldCheckbox_textRoot__1FOIz">I confirm that I have Public Liability Insurance (PLI) for this shoot</span>
              </label>
              </span>


              <div id="pliFields" className="pli-fields">
                <label htmlFor="insuranceProvider">Insurance Provider name:</label>
                <input
                  id="insuranceProvider"
                  type="text"
                  value={this.state.name}
                  onChange={e => this.setInsuranceProvider(e.target.value)}
                />

                <label htmlFor="insuranceProvider">Insurance Provider Contact Details:</label>
                <input
                  id="insuranceProviderContact"
                  type="text"
                  value={this.state.name}
                  onChange={e => this.setInsuranceProviderContact(e.target.value)}
                />

                <label htmlFor="policyNumber">Policy Number:</label>
                <input
                  id="policyNumber"
                  type="text"
                  value={this.state.name}
                  onChange={e => this.setPolicyNumber(e.target.value)}
                />

                <label htmlFor="expiryDate">Expiry date:</label>

                <SingleDatePicker
                  date={this.state.date} // momentPropTypes.momentObj or null
                  onDateChange={date => this.setState({ date })} // PropTypes.func.isRequired
                  focused={this.state.focused} // PropTypes.bool
                  onFocusChange={({ focused }) => this.setState({ focused })} // PropTypes.func.isRequired
                  id="expiryDate" // PropTypes.string.isRequired,
                  onClose={(date) => this.setExpiryDate(date)}
                />



                <label htmlFor="liabilityValue">Value of public liability:</label>
                <input
                  id="liabilityValue"
                  type="text"
                  value={this.state.name}
                  onChange={e => this.setLiabilityValue(e.target.value)}
                />
              </div>


              <span className="FieldCheckbox_root__3zj8N">
              <input id="termsConfirm"
              className="FieldCheckbox_input__mLqZ5"
              type="checkbox"
              checked={this.state.check}
              onChange={(e) => {
                this.confirmTerms({
                  target: {
                    name: e.target.name,
                    value: e.target.checked,
                  },
                });
              }}/>
              <label htmlFor="termsConfirm" className="FieldCheckbox_label__IMcLm">
              <span className="FieldCheckbox_checkboxWrapper__1s98A">
                <svg width="14" height="14" xmlns="http://www.w3.org/2000/svg"><g fill="none" fillRule="evenodd"><g transform="translate(2 2)"><path className="FieldCheckbox_checked__cE7fY" d="M9.9992985 1.5048549l-.0194517 6.9993137C9.977549 9.3309651 9.3066522 10 8.4798526 10H1.5001008c-.8284271 0-1.5-.6715729-1.5-1.5l-.000121-7c0-.8284271.6715728-1.5 1.5-1.5h.000121l6.9993246.0006862c.8284272.000067 1.4999458.671694 1.499879 1.5001211a1.5002208 1.5002208 0 0 1-.0000059.0040476z"></path><path className="FieldCheckbox_box__2sdbR"  strokeWidth="2" d="M10.9992947 1.507634l-.0194518 6.9993137C10.9760133 9.8849417 9.8578519 11 8.4798526 11H1.5001008c-1.3807119 0-2.5-1.1192881-2.5-2.4999827L-1.0000202 1.5c0-1.3807119 1.119288-2.5 2.500098-2.5l6.9994284.0006862c1.3807118.0001115 2.4999096 1.11949 2.4997981 2.5002019-.0000018.003373-.0000018.003373-.0000096.0067458z"></path></g><path d="M5.636621 10.7824771L3.3573694 8.6447948c-.4764924-.4739011-.4764924-1.2418639 0-1.7181952.4777142-.473901 1.251098-.473901 1.7288122 0l1.260291 1.1254782 2.8256927-4.5462307c.3934117-.5431636 1.1545778-.6695372 1.7055985-.278265.5473554.3912721.6731983 1.150729.2797866 1.6951077l-3.6650524 5.709111c-.2199195.306213-.5803433.5067097-.9920816.5067097-.3225487 0-.6328797-.1263736-.8637952-.3560334z" fill="#FFF"></path></g></svg>
              </span>

              <span className="FieldCheckbox_text__1f3zE FieldCheckbox_textRoot__1FOIz">I confirm that I have read the <a href="https://www.film-locations.co.uk/producer-terms-and-conditions/" target="_blank">terms and conditions</a></span>
              </label>
              </span>

              <br />
              <div className={submitButtonClasses}>
                <PrimaryButton disabled type="submit" id="formSubmit">
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
