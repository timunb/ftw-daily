import React from 'react';
import { renderShallow } from '../../util/test-helpers';
import { createUser, createListing, fakeIntl } from '../../util/test-data';
import { ManageListingCardComponent } from './ManageListingCard';

const noop = () => null;

describe('ManageListingCard', () => {
  it('matches snapshot', () => {
    const tree = renderShallow(
      <ManageListingCardComponent
        flattenedRoutes={[]}
        history={{ push: noop }}
        listing={createListing('listing1')}
        intl={fakeIntl}
        isMenuOpen={false}
        onCloseListing={noop}
        onOpenListing={noop}
        onToggleMenu={noop}
      />
    );
    expect(tree).toMatchSnapshot();
  });
});
