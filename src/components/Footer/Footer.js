import React from 'react';
import { string } from 'prop-types';
import { FormattedMessage, injectIntl, intlShape } from '../../util/reactIntl';
import classNames from 'classnames';
import { twitterPageURL } from '../../util/urlHelpers';
import config from '../../config';
import {
  IconSocialMediaFacebook,
  IconSocialMediaInstagram,
  IconSocialMediaTwitter,
  Logo,
  ExternalLink,
  NamedLink,
} from '../../components';

import css from './Footer.module.css';

const renderSocialMediaLinks = intl => {
  const { siteFacebookPage, siteInstagramPage, siteTwitterHandle } = config;
  const siteTwitterPage = twitterPageURL(siteTwitterHandle);

  const goToFb = intl.formatMessage({ id: 'Footer.goToFacebook' });
  const goToInsta = intl.formatMessage({ id: 'Footer.goToInstagram' });
  const goToTwitter = intl.formatMessage({ id: 'Footer.goToTwitter' });

  const fbLink = siteFacebookPage ? (
    <ExternalLink key="linkToFacebook" href={siteFacebookPage} className={css.icon} title={goToFb}>
      <IconSocialMediaFacebook />
    </ExternalLink>
  ) : null;

  const twitterLink = siteTwitterPage ? (
    <ExternalLink
      key="linkToTwitter"
      href={siteTwitterPage}
      className={css.icon}
      title={goToTwitter}
    >
      <IconSocialMediaTwitter />
    </ExternalLink>
  ) : null;

  const instragramLink = siteInstagramPage ? (
    <ExternalLink
      key="linkToInstagram"
      href={siteInstagramPage}
      className={css.icon}
      title={goToInsta}
    >
      <IconSocialMediaInstagram />
    </ExternalLink>
  ) : null;
  return [fbLink, twitterLink, instragramLink].filter(v => v != null);
};

const Footer = props => {
  const { rootClassName, className, intl } = props;
  const socialMediaLinks = renderSocialMediaLinks(intl);
  const classes = classNames(rootClassName || css.root, className);

  return (
    <div className={classes}>
      <div className={css.topBorderWrapper}>
        <div className={css.content}>
          <div className={css.someLiksMobile}>{socialMediaLinks}</div>
          <div className={css.links}>
            <div className={css.organization} id="organization">
              <NamedLink name="LandingPage" className={css.logoLink}>
                <Logo format="desktop" className={css.logo} />
              </NamedLink>
              <div className={css.organizationInfo}>
                <p className={css.organizationDescription}>
                  © 2021 Film Locations. All Rights Reserved Website by <a title="Unbranded Manchester" href="http://www.unbrandedmanchester.com/web-design-manchester" target="_blank" className="unbrandedmanchester" rel="noopener">Unbranded Manchester</a>
                </p>
                <p className={css.organizationCopyright}>
                  <NamedLink name="LandingPage" className={css.copyrightLink}>
                    VAT No. 466410158 • CR Number - 05983518
                  </NamedLink>
                </p>
              </div>
            </div>
            <div className={css.infoLinks}>
              <h3 className="woohoo">Community</h3>
              <nav className="footer-nav--pages"><ul id="menu-community-1" className="nav"><li className="menu-item menu-for-hosts"><a href="https://www.film-locations.co.uk/become-a-host/">For Hosts</a></li><li className="menu-item menu-for-producers"><a href="https://www.film-locations.co.uk/hire-a-space/">For Producers</a></li></ul></nav>
            </div>

            <div className={css.infoLinks}>
              <h3 className="woohoo">Personal</h3>
              <nav className="footer-nav--pages"><ul id="menu-personal-1" className="nav"><li className="menu-item menu-become-a-host"><a href="https://www.film-locations.co.uk/become-a-host">Become A Host</a></li><li className="menu-item menu-log-in"><a href="https://www.film-locations.co.uk/my-account">Log in</a></li><li className="menu-item menu-my-account"><a href="https://www.film-locations.co.uk/my-account">My Account</a></li></ul></nav>
            </div>
            <div className={css.infoLinks}>
              <h3 className="woohoo">About Us</h3>
              <nav className="footer-nav--pages"><ul id="menu-about-1" className="nav"><li className="menu-item menu-how-it-works"><a href="https://www.film-locations.co.uk/how-it-works/">How It Works</a></li><li className="menu-item menu-pricing"><a href="https://www.film-locations.co.uk/pricing/">Pricing</a></li></ul></nav>
            </div>
          </div>
          <div className={css.copyrightAndTermsMobile}>
            <NamedLink name="LandingPage" className={css.organizationCopyrightMobile}>
              <FormattedMessage id="Footer.copyright" />
            </NamedLink>
            <div className={css.tosAndPrivacyMobile}>
              <NamedLink name="PrivacyPolicyPage" className={css.privacy}>
                <FormattedMessage id="Footer.privacy" />
              </NamedLink>
              <NamedLink name="TermsOfServicePage" className={css.terms}>
                <FormattedMessage id="Footer.terms" />
              </NamedLink>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

Footer.defaultProps = {
  rootClassName: null,
  className: null,
};

Footer.propTypes = {
  rootClassName: string,
  className: string,
  intl: intlShape.isRequired,
};

export default injectIntl(Footer);
