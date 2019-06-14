// @flow
import * as ICONS from 'constants/icons';
import * as React from 'react';
import { withRouter } from 'react-router';
import Button from 'component/button';
import LbcSymbol from 'component/common/lbc-symbol';
import WunderBar from 'component/wunderbar';
import Icon from 'component/common/icon';
import ThemeToggler from 'component/themeToggler';
import { Menu, MenuList, MenuButton, MenuItem, MenuLink } from '@reach/menu-button';
import * as SETTINGS from 'constants/settings';
type Props = {
  autoUpdateDownloaded: boolean,
  balance: string,
  isUpgradeAvailable: boolean,
  roundedBalance: number,
  downloadUpgradeRequested: any => void,
  history: { push: string => void },
};

const Header = (props: Props) => {
  const {
    autoUpdateDownloaded,
    downloadUpgradeRequested,
    isUpgradeAvailable,
    roundedBalance,
    history,
    setClientSetting,
    currentTheme,
    automaticDarkModeEnabled,
  } = props;

  const showUpgradeButton = autoUpdateDownloaded || (process.platform === 'linux' && isUpgradeAvailable);

  function handleThemeToggle() {
    if (automaticDarkModeEnabled) {
      setClientSetting(SETTINGS.AUTOMATIC_DARK_MODE_ENABLED, false);
    }

    if (currentTheme === 'dark') {
      setClientSetting(SETTINGS.THEME, 'light');
    } else {
      setClientSetting(SETTINGS.THEME, 'dark');
    }
  }

  return (
    <header className="header">
      <div className="header__contents">
        <div className="header__navigation">
          <Button
            className="header__navigation-item header__navigation-item--lbry"
            label={__('LBRY')}
            icon={ICONS.LBRY}
            navigate="/"
          />
          {/* @if TARGET='app' */}
          <div className="header__navigation-arrows">
            <Button
              className="header__navigation-item header__navigation-item--back"
              description={__('Navigate back')}
              onClick={() => window.history.back()}
              icon={ICONS.ARROW_LEFT}
              iconSize={15}
            />

            <Button
              className="header__navigation-item header__navigation-item--forward"
              description={__('Navigate forward')}
              onClick={() => window.history.forward()}
              icon={ICONS.ARROW_RIGHT}
              iconSize={15}
            />
          </div>
          {/* @endif */}
        </div>

        <WunderBar />

        <div className="header__navigation">
          <Menu>
            <MenuButton className="header__navigation-item menu__title">
              <Icon icon={ICONS.ACCOUNT} />
              {roundedBalance > 0 ? (
                <React.Fragment>
                  {roundedBalance} <LbcSymbol />
                </React.Fragment>
              ) : (
                __('Account')
              )}
            </MenuButton>
            <MenuList>
              <MenuItem className="menu__link" onSelect={() => history.push(`/$/account`)}>
                {' '}
                <Icon aria-hidden icon={ICONS.OVERVIEW} />
                {__('Overview')}
              </MenuItem>
              <MenuItem className="menu__link" onSelect={() => history.push(`/$/wallet`)}>
                <Icon aria-hidden icon={ICONS.WALLET} />
                {__('Wallet')}
              </MenuItem>
              <MenuItem className="menu__link" onSelect={() => history.push(`/$/publish`)}>
                <Icon aria-hidden icon={ICONS.UPLOAD} />
                {__('Publish')}
              </MenuItem>
            </MenuList>
          </Menu>

          {/* @if TARGET='app' */}
          {showUpgradeButton && (
            <Button
              className="header__navigation-item header__navigation-item--right-action header__navigation-item--upgrade"
              icon={ICONS.DOWNLOAD}
              iconSize={24}
              label={__('Upgrade App')}
              onClick={downloadUpgradeRequested}
            />
          )}
          {/* @endif */}
          <Menu>
            <MenuButton className="header__navigation-item menu__title">
              <Icon icon={ICONS.SETTINGS} />
            </MenuButton>
            <MenuList>
              <MenuItem className="menu__link" onSelect={() => history.push(`/$/settings`)}>
                <Icon aria-hidden icon={ICONS.SETTINGS} />
                {__('Settings')}
              </MenuItem>
              <MenuItem className="menu__link" onSelect={() => history.push(`/$/help`)}>
                <Icon aria-hidden icon={ICONS.HELP} />
                {__('Help')}
              </MenuItem>
              <MenuItem className="menu__link" onSelect={handleThemeToggle}>
                <Icon icon={currentTheme === 'dark' ? ICONS.DARK : ICONS.LIGHT} />
                {currentTheme === 'dark' ? 'Dark' : 'Light'}
              </MenuItem>
            </MenuList>
          </Menu>
        </div>
      </div>
    </header>
  );
};

export default withRouter(Header);
