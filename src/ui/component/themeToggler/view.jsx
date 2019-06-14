// @flow
import * as ICONS from 'constants/icons';
import * as SETTINGS from 'constants/settings';
import * as React from 'react';
import Button from 'component/button';
import Icon from 'component/common/icon';

import { Menu, MenuList, MenuButton, MenuItem, MenuLink } from '@reach/menu-button';

type Props = {
  currentTheme: string,
  automaticDarkModeEnabled: boolean,
  setClientSetting: (string, string | boolean) => void,
};

class ThemeToggler extends React.PureComponent<Props> {
  constructor(props: Props) {
    super(props);

    (this: any).onThemeToggle = this.onThemeToggle.bind(this);
  }

  onThemeToggle() {
    const { currentTheme, automaticDarkModeEnabled } = this.props;
    console.log('toggle', currentTheme);
    if (automaticDarkModeEnabled) {
      this.props.setClientSetting(SETTINGS.AUTOMATIC_DARK_MODE_ENABLED, false);
    }

    if (currentTheme === 'dark') {
      console.log('set');
      this.props.setClientSetting(SETTINGS.THEME, 'light');
    } else if (currentTheme === 'light') {
      this.props.setClientSetting(SETTINGS.THEME, 'dark');
    }
  }

  render() {
    const { currentTheme, automaticDarkModeEnabled } = this.props;

    return null;
  }
}

export default ThemeToggler;
