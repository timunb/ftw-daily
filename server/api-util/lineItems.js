const { calculateQuantityFromDates, calculateTotalFromLineItems } = require('./lineItemHelpers');
const { types } = require('sharetribe-flex-sdk');
const { Money } = types;

// This bookingUnitType needs to be one of the following:
// line-item/night, line-item/day or line-item/units
const bookingUnitType = 'line-item/day';
const PROVIDER_COMMISSION_PERCENTAGE = -10;

// console.log(localStorage.getItem('totalOvertimeHours'));
// console.log(parseInt(localStorage.getItem('totalOvertimeHours')));

/** Returns collection of lineItems (max 50)
 *
 * Each line items has following fields:
 * - `code`: string, mandatory, indentifies line item type (e.g. \"line-item/cleaning-fee\"), maximum length 64 characters.
 * - `unitPrice`: money, mandatory
 * - `lineTotal`: money
 * - `quantity`: number
 * - `percentage`: number (e.g. 15.5 for 15.5%)
 * - `seats`: number
 * - `units`: number
 * - `includeFor`: array containing strings \"customer\" or \"provider\", default [\":customer\"  \":provider\" ]
 *
 * Line item must have either `quantity` or `percentage` or both `seats` and `units`.
 *
 * `includeFor` defines commissions. Customer commission is added by defining `includeFor` array `["customer"]` and provider commission by `["provider"]`.
 *
 * @param {Object} listing
 * @param {Object} bookingData
 * @returns {Array} lineItems
 */
exports.transactionLineItems = (listing, bookingData) => {
  const unitPrice = listing.attributes.price;
  const { startDate, endDate, hasParkingFee, hasCleaningFee, hasSecurityFee, hasLargeShootFee, hasOvertimeFee } = bookingData;

  /**
   * If you want to use pre-defined component and translations for printing the lineItems base price for booking,
   * you should use one of the codes:
   * line-item/night, line-item/day or line-item/units (translated to persons).
   *
   * Pre-definded commission components expects line item code to be one of the following:
   * 'line-item/provider-commission', 'line-item/customer-commission'
   *
   * By default BookingBreakdown prints line items inside LineItemUnknownItemsMaybe if the lineItem code is not recognized. */

  const booking = {
    code: bookingUnitType,
    unitPrice,
    quantity: calculateQuantityFromDates(startDate, endDate, bookingUnitType),
    includeFor: ['customer', 'provider'],
  };

  const resolveParkingFeePrice = listing => {
    const publicData = listing.attributes.publicData;
    const parkingFee = publicData && publicData.parkingFee;
    const { amount, currency } = parkingFee;

    if (amount && currency) {
      return new Money(amount, currency);
    }

    return null;
  };

  const resolveCleaningFeePrice = listing => {
    const publicData = listing.attributes.publicData;
    const cleaningFee = publicData && publicData.cleaningFee;
    const { amount, currency } = cleaningFee;

    if (amount && currency) {
      return new Money(amount, currency);
    }

    return null;
  };

  const resolveLargeShootFeePrice = listing => {
    const publicData = listing.attributes.publicData;
    const largeShootFee = publicData && publicData.largeShootFee;
    const { amount, currency } = largeShootFee;

    if (amount && currency) {
      return new Money(amount, currency);
    }

    return null;
  };

  const resolveOvertimeFeePrice = listing => {
    const publicData = listing.attributes.publicData;
    const overtimeFee = publicData && publicData.overtimeFee;
    const { amount, currency } = overtimeFee;

    if (amount && currency) {
      return new Money(amount, currency);
    }

    return null;
  };

  const resolveSecurityFeePrice = listing => {
    const publicData = listing.attributes.publicData;
    const securityFee = publicData && publicData.securityFee;
    const { amount, currency } = securityFee;

    if (amount && currency) {
      return new Money(amount, currency);
    }

    return null;
  };

  const parkingFeePrice = hasParkingFee ? resolveParkingFeePrice(listing) : null;
  const parkingFee = parkingFeePrice
   ? [
       {
         code: 'line-item/parking-fee',
         unitPrice: parkingFeePrice,
         quantity: 1,
         includeFor: ['customer', 'provider'],
       },
     ]
   : [];

  const cleaningFeePrice = hasCleaningFee ? resolveCleaningFeePrice(listing) : null;
  const cleaningFee = cleaningFeePrice
   ? [
       {
         code: 'line-item/cleaning-fee',
         unitPrice: cleaningFeePrice,
         quantity: 1,
         includeFor: ['customer', 'provider'],
       },
     ]
   : [];

   const largeShootFeePrice = hasLargeShootFee ? resolveLargeShootFeePrice(listing) : null;
   const largeShootFee = largeShootFeePrice
    ? [
        {
          code: 'line-item/large-shoot-fee',
          unitPrice: largeShootFeePrice,
          quantity: 1,
          includeFor: ['customer', 'provider'],
        },
      ]
    : [];



    const overtimeFeePrice = hasOvertimeFee ? resolveOvertimeFeePrice(listing) : null;
    const overtimeFee = overtimeFeePrice
     ? [
         {
           code: 'line-item/overtime-fee',
           unitPrice: overtimeFeePrice,
           quantity: 0,
           includeFor: ['customer', 'provider'],
         },
       ]
     : [];

   const securityFeePrice = hasSecurityFee ? resolveSecurityFeePrice(listing) : null;
   const securityFee = securityFeePrice
    ? [
        {
          code: 'line-item/security-fee',
          unitPrice: securityFeePrice,
          quantity: 1,
          includeFor: ['customer', 'provider'],
        },
      ]
    : [];


  const providerCommission = {
    code: 'line-item/provider-commission',
    unitPrice: calculateTotalFromLineItems([booking, ...parkingFee, ...cleaningFee, ...securityFee, ...largeShootFee, ...overtimeFee]),
    percentage: PROVIDER_COMMISSION_PERCENTAGE,
    includeFor: ['provider'],
  };

  const lineItems = [booking, ...parkingFee, ...cleaningFee, ...securityFee, ...largeShootFee, ...overtimeFee, providerCommission];

  return lineItems;
};
