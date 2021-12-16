import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import css from './IconSocialMediaLinkedIn.module.css';

const IconSocialMediaLinkedIn = props => {
  const { rootClassName, className } = props;
  const classes = classNames(rootClassName || css.root, className);
  return (
    <svg
      className={classes}
      width="16"
      height="17"
      viewBox="0 0 16 17"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M3.58,16.09H.26V5.41H3.58ZM1.92,4A1.93,1.93,0,1,1,3.84,2,1.94,1.94,0,0,1,1.92,4ZM16,16.09H12.69v-5.2c0-1.24,0-2.83-1.73-2.83S9,9.41,9,10.8v5.29H5.66V5.41H8.84V6.87h.05A3.48,3.48,0,0,1,12,5.14c3.35,0,4,2.21,4,5.08v5.87Z" transform="translate(0 -0.09)"
        fillRule="evenodd"
      />
    </svg>
  );
};

IconSocialMediaLinkedIn.defaultProps = { rootClassName: null, className: null };

const { string } = PropTypes;

IconSocialMediaLinkedIn.propTypes = { rootClassName: string, className: string };

export default IconSocialMediaLinkedIn;
