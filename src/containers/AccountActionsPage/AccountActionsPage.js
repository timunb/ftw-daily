import React from 'react';
import { FormattedMessage, injectIntl, intlShape } from '../../util/reactIntl';
import {
  LayoutSideNavigation,
  LayoutWrapperMain,
  LayoutWrapperAccountSettingsSideNav,
  LayoutWrapperTopbar,
  LayoutWrapperFooter,
  Footer,
  Page,
  UserNav,
} from '../../components';
import { TopbarContainer } from '../../containers';

import css from './AccountActionsPage.module.css';

export const AccountActionsPage = props => {
  const {
    changePasswordError,
    changePasswordInProgress,
    currentUser,
    onChange,
    onSubmitChangePassword,
    onResetPassword,
    resetPasswordInProgress,
    resetPasswordError,
    passwordChanged,
    intl,
  } = props;

  const title = "Account Actions";

  return (
    <Page title={title}>
      <LayoutSideNavigation>
        <LayoutWrapperTopbar>
          <TopbarContainer
            currentPage="AccountActionsPage"
            desktopClassName={css.desktopTopbar}
            mobileClassName={css.mobileTopbar}
          />
          <UserNav selectedPageName="AccountActionsPage" />
        </LayoutWrapperTopbar>
        <LayoutWrapperAccountSettingsSideNav currentTab="AccountActionsPage" />
        <LayoutWrapperMain>
          <div className={css.content}>
            <h1 className={css.title}>
              <FormattedMessage id="AccountActions.heading" />
            </h1>
            <p>Please email <a href="mailto:support@film-locations.co.uk">support@film-locations.co.uk</a> if you wish to deactivate your account.</p>
          </div>
        </LayoutWrapperMain>
        <LayoutWrapperFooter>
          <Footer />
        </LayoutWrapperFooter>
      </LayoutSideNavigation>
    </Page>
  );
};

export default AccountActionsPage;
