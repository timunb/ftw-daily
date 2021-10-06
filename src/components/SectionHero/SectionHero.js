import React from 'react';
import { string } from 'prop-types';
import { FormattedMessage } from '../../util/reactIntl';
import classNames from 'classnames';
import { NamedLink } from '../../components';
import css from './SectionHero.module.css';

const SectionHero = props => {
  const { rootClassName, className, currentUser } = props;

  const classes = classNames(rootClassName || css.root, className);

  // console.log('this is the user');
  // console.log(currentUser.attributes.profile.protectedData.userType);


  if (currentUser) {
    const isOwner = currentUser.attributes.profile.protectedData.userType === 'owner';
    const isBooker = currentUser.attributes.profile.protectedData.userType === 'booker';

    if (isOwner) {
      return (
        <div className={classes}>
          <div className={css.heroContent}>
            <h1 className={css.heroMainTitle}>
              <FormattedMessage id="SectionHero.title" />
            </h1>
            <p className="white-text">You are ready to start adding locations now!</p>

            <NamedLink className={css.heroButton} name="NewListingPage">
                <FormattedMessage id="SectionHero.browseButton" />
            </NamedLink>

          </div>
        </div>
      );
    } else {
      return (
        <div className={classes}>
          <div className={css.heroContent}>
            <h1 className={css.heroMainTitle}>
              <FormattedMessage id="SectionHero.title" />
            </h1>
            <p className="white-text">You are ready to start browsing our hundreds of locations now!</p>
            <a className="SectionHero_heroButton__1Am0q SectionHero_animation__3or2Z" href="https://film-locations.co.uk/locations">
              Browse Locations
            </a>
          </div>
        </div>
      );
    }

  } else {
    return (
      <div className={classes}>
        <div className={css.heroContent}>
          <h1 className={css.heroMainTitle}>
            <FormattedMessage id="SectionHero.title" />
          </h1>

          <a className="SectionHero_heroButton__1Am0q SectionHero_animation__3or2Z" href="https://film-locations.co.uk/locations">
            Browse Locations
          </a>
        </div>
      </div>
    );
  }





};

SectionHero.defaultProps = { rootClassName: null, className: null };

SectionHero.propTypes = {
  rootClassName: string,
  className: string,
};

export default SectionHero;
