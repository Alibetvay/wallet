import { useWallet } from '@tonkeeper/shared/hooks';
import {
  Icon,
  Spacer,
  Steezy,
  Text,
  TouchableOpacity,
  View,
  deviceWidth,
  getWalletColorHex,
  isAndroid,
} from '@tonkeeper/uikit';
import React, { FC, memo, useCallback } from 'react';
import { Text as RNText } from 'react-native';
import { useNavigation } from '@tonkeeper/router';

const WalletSelectorComponent: FC = () => {
  const wallet = useWallet();
  const nav = useNavigation();

  const handlePress = useCallback(() => {
    nav.openModal('/switch-wallet');
  }, [nav]);

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={handlePress}>
        <View
          style={[
            styles.selectorContainer,
            { backgroundColor: getWalletColorHex(wallet.config.color) },
          ]}
        >
          <RNText style={styles.emoji.static}>{wallet.config.emoji}</RNText>
          <Spacer x={4} />
          <View style={styles.nameContainer}>
            <Text type="label2" numberOfLines={1}>
              {wallet.config.name}
            </Text>
          </View>
          <Spacer x={6} />
          <Icon name="ic-chevron-down-16" style={styles.icon.static} />
        </View>
      </TouchableOpacity>
    </View>
  );
};

export const WalletSelector = memo(WalletSelectorComponent);

const styles = Steezy.create({
  container: { alignItems: 'center' },
  selectorContainer: {
    height: 40,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 10,
    paddingRight: 12,
    borderRadius: 20,
  },
  nameContainer: {
    maxWidth: deviceWidth - 180,
  },
  icon: {
    opacity: 0.64,
  },
  emoji: {
    fontSize: isAndroid ? 17 : 20,
    marginTop: isAndroid ? -1 : 1,
  },
});