/*
 * Marketplace specific configuration.
 *
 * Every filter needs to have following keys:
 * - id:     Unique id of the filter.
 * - label:  The default label of the filter.
 * - type:   String that represents one of the existing filter components:
 *           BookingDateRangeFilter, KeywordFilter, PriceFilter,
 *           SelectSingleFilter, SelectMultipleFilter.
 * - group:  Is this 'primary' or 'secondary' filter?
 *           Primary filters are visible on desktop layout by default.
 *           Secondary filters are behind "More filters" button.
 *           Read more from src/containers/SearchPage/README.md
 * - queryParamNames: Describes parameters to be used with queries
 *                    (e.g. 'price' or 'pub_amenities'). Most of these are
 *                    the same between webapp URLs and API query params.
 *                    You can't change 'dates', 'price', or 'keywords'
 *                    since those filters are fixed to a specific attribute.
 * - config: Extra configuration that the filter component needs.
 *
 * Note 1: Labels could be tied to translation file
 *         by importing FormattedMessage:
 *         <FormattedMessage id="some.translation.key.here" />
 *
 * Note 2: If you need to add new custom filter components,
 *         you need to take those into use in:
 *         src/containers/SearchPage/FilterComponent.js
 *
 * Note 3: If you just want to create more enum filters
 *         (i.e. SelectSingleFilter, SelectMultipleFilter),
 *         you can just add more configurations with those filter types
 *         and tie them with correct extended data key
 *         (i.e. pub_<key> or meta_<key>).
 */

export const filters = [
  {
    id: 'dates',
    label: 'Dates',
    type: 'BookingDateRangeFilter',
    group: 'primary',
    // Note: BookingDateRangeFilter is fixed filter,
    // you can't change "queryParamNames: ['dates'],"
    queryParamNames: ['dates'],
    config: {},
  },
  {
    id: 'price',
    label: 'Price',
    type: 'PriceFilter',
    group: 'primary',
    // Note: PriceFilter is fixed filter,
    // you can't change "queryParamNames: ['price'],"
    queryParamNames: ['price'],
    // Price filter configuration
    // Note: unlike most prices this is not handled in subunits
    config: {
      min: 0,
      max: 1000,
      step: 5,
    },
  },
  {
    id: 'keyword',
    label: 'Keyword',
    type: 'KeywordFilter',
    group: 'primary',
    // Note: KeywordFilter is fixed filter,
    // you can't change "queryParamNames: ['keywords'],"
    queryParamNames: ['keywords'],
    // NOTE: If you are ordering search results by distance
    // the keyword search can't be used at the same time.
    // You can turn on/off ordering by distance from config.js file.
    config: {},
  },
  {
    id: 'category',
    label: 'Category',
    type: 'SelectSingleFilter',
    group: 'secondary',
    queryParamNames: ['pub_category'],
    config: {
      // "key" is the option you see in Flex Console.
      // "label" is set here for the UI only.
      // Note: label is not added through the translation files
      // to make filter customizations a bit easier.
      options: [
        { key: 'residential', label: 'Residential (i.e. homes, apartments, estates, private outdoor spaces)' },
        { key: 'non-residential', label: 'Non-residential (i.e. venues, commercial spaces, offices, exterior locations)' },
        { key: 'transport', label: 'Transport (i.e. vehicles, aircraft) ' },
      ],
    },
  },
  {
    id: 'amenities',
    label: 'Amenities',
    type: 'SelectMultipleFilter',
    group: 'secondary',
    queryParamNames: ['pub_amenities'],
    config: {
      // Optional modes: 'has_all', 'has_any'
      // https://www.sharetribe.com/api-reference/marketplace.html#extended-data-filtering
      searchMode: 'has_all',

      // "key" is the option you see in Flex Console.
      // "label" is set here for this web app's UI only.
      // Note: label is not added through the translation files
      // to make filter customizations a bit easier.
      options: [
        {
          key: 'architecural',
          label: 'Architectual',
        },
        {
          key: 'art_deco',
          label: 'Art Deco',
        },
        {
          key: 'boho_chic',
          label: 'Boho Chic',
        },
        {
          key: 'botanical',
          label: 'Botanical',
        },

        {
          key: 'brutalist_architecture',
          label: 'Brutalist Architecture',
        },

        {
          key: 'concrete',
          label: 'Concrete',
        },

        {
          key: 'derelict_buildings',
          label: 'Derelict Buildings',
        },

        {
          key: 'distressed_walls',
          label: 'Distressed Walls',
        },
        {
          key: 'driveways',
          label: 'Driveways',
        },

        {
          key: 'elizabethan',
          label: 'Elizabethan',
        },

        {
          key: 'faded_grandeur',
          label: 'Faded Grandeur',
        },

        {
          key: 'feminine',
          label: 'Feminine',
        },

        {
          key: 'georgian',
          label: 'Georgian',
        },

        {
          key: 'industrial',
          label: 'Industrial',
        },

        {
          key: 'kitchens',
          label: 'Kitchens',
        },

        {
          key: 'loft_style',
          label: 'Loft Style',
        },

        {
          key: 'midcentury_modern',
          label: 'Midcentury Modern',
        },

        {
          key: 'modern',
          label: 'Modern',
        },

        {
          key: 'moroccan_style_locations',
          label: 'Moroccan Style Locations',
        },

        {
          key: 'north_american_style_in_uk',
          label: 'North American Style In UK',
        },

        {
          key: 'offices',
          label: 'Offices',
        },

        {
          key: 'retro',
          label: 'Retro',
        },

        {
          key: 'rooftop',
          label: 'Rooftop',
        },

        {
          key: 'scandinavian_style',
          label: 'Scandinavian Style',
        },

        {
          key: 'shabby_chic',
          label: 'Shabby Chic',
        },

        {
          key: 'victorian',
          label: 'Victorian',
        },

        {
          key: 'wood_panelled_rooms',
          label: 'Wood Panelled Rooms',
        },

      ],
    },
  },
  {
    id: 'types',
    label: 'Types',
    type: 'SelectMultipleFilter',
    group: 'secondary',
    queryParamNames: ['pub_types'],
    config: {
      // Optional modes: 'has_all', 'has_any'
      // https://www.sharetribe.com/api-reference/marketplace.html#extended-data-filtering
      searchMode: 'has_all',

      // "key" is the option you see in Flex Console.
      // "label" is set here for this web app's UI only.
      // Note: label is not added through the translation files
      // to make filter customizations a bit easier.

      options: [
        { key: 'houses', label: 'Houses' },
        { key: 'apartments', label: 'Apartments' },
        { key: 'everyday_homes', label: 'Everyday Homes' },
        { key: 'studios', label: 'Studios' },
        { key: 'venues', label: 'Venues' },
        { key: 'warehouse', label: 'Warehouses' },
        { key: 'manor_houses', label: 'Manor Houses' },
        { key: 'modern_mansions', label: 'Modern Mansions' },
        { key: 'country_locations', label: 'Country Locations' },
        { key: 'beach_houses', label: 'Beach Houses' },
        { key: 'outdoor_locations', label: 'Outdoor Locations' },
        { key: 'vehicles_and_aircraft', label: 'Vehicles and Aircraft' },
        { key: 'european_locations', label: 'European Locations' },
        { key: 'international_locations', label: 'International Locations' },
      ],
    },
  },

  {
    id: 'areas',
    label: 'Areas',
    type: 'SelectMultipleFilter',
    group: 'secondary',
    queryParamNames: ['pub_areas'],
    config: {
      // Optional modes: 'has_all', 'has_any'
      // https://www.sharetribe.com/api-reference/marketplace.html#extended-data-filtering
      searchMode: 'has_all',

      // "key" is the option you see in Flex Console.
      // "label" is set here for this web app's UI only.
      // Note: label is not added through the translation files
      // to make filter customizations a bit easier.
      options: [
        { key: 'london', label: 'London' },
        { key: 'north_london', label: 'North London' },
        { key: 'south_london', label: 'South London' },
        { key: 'east_london', label: 'East London' },
        { key: 'west_london', label: 'West London' },
        { key: 'greater_london', label: 'Greater London' },
        { key: 'south_west', label: 'South West' },
        { key: 'west_midlands', label: 'West Midlands' },
        { key: 'east_midlands', label: 'East Midlands' },
        { key: 'east_england', label: 'East England' },
        { key: 'east_yorkshire', label: 'East Yorkshire' },
        { key: 'north_east', label: 'North East' },
        { key: 'northern_ireland', label: 'Northern Ireland' },
        { key: 'south_east', label: 'South East' },
        { key: 'north_west', label: 'North West' },
        { key: 'wales', label: 'Wales' },
        { key: 'east_of_england', label: 'East Of England' },
        { key: 'oxford', label: 'Oxford' },
        { key: 'scotland', label: 'Scotland' },
        { key: 'europe', label: 'Europe' },
        { key: 'international', label: 'International' },

      ],
    },
  },
];

export const sortConfig = {
  // Enable/disable the sorting control in the SearchPage
  active: true,

  // Note: queryParamName 'sort' is fixed,
  // you can't change it since Flex API expects it to be named as 'sort'
  queryParamName: 'sort',

  // Internal key for the relevance option, see notes below.
  relevanceKey: 'relevance',

  // Keyword filter is sorting the results already by relevance.
  // If keyword filter is active, we need to disable sorting.
  conflictingFilters: ['keyword'],

  options: [
    { key: 'createdAt', label: 'Newest' },
    { key: '-createdAt', label: 'Oldest' },
    { key: '-price', label: 'Lowest price' },
    { key: 'price', label: 'Highest price' },

    // The relevance is only used for keyword search, but the
    // parameter isn't sent to the Marketplace API. The key is purely
    // for handling the internal state of the sorting dropdown.
    { key: 'relevance', label: 'Relevance', longLabel: 'Relevance (Keyword search)' },
  ],
};
