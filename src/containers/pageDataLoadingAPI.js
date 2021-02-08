/**
 * Export loadData calls from ducks modules of different containers
 */
import { setInitialValues as CheckoutPageInitialValues } from './CheckoutPage/CheckoutPage.duck';
import { loadData as ListingPageLoader } from './ListingPage/ListingPage.duck';
import { loadData as SearchPageLoader } from './SearchPage/SearchPage.duck';

const getPageDataLoadingAPI = () => {
  return {
    CheckoutPage: {
      setInitialValues: CheckoutPageInitialValues,
    },
    ListingPage: {
      loadData: ListingPageLoader,
    },
    SearchPage: {
      loadData: SearchPageLoader,
    },
  };
};

export default getPageDataLoadingAPI;
