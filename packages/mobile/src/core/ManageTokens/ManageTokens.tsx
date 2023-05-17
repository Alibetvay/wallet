import React, { FC, useCallback, useState } from 'react';

import { Icon, Screen, Spacer, SText, View } from '$uikit';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { JettonBalanceModel } from '$store/models';
import { Address } from '$libs/Ton';
import { Tabs } from '../../tabs/Wallet/components/Tabs';
import { Steezy } from '$styles';
import { FlashList } from '@shopify/flash-list';
import { t } from '$translation';
import { List } from '$uikit/List/new';
import { ListSeparator } from '$uikit/List/new/ListSeparator';
import { StyleSheet } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { ContentType, Content } from '$core/ManageTokens/ManageTokens.types';
import { useJettonData } from '$core/ManageTokens/hooks/useJettonData';
import { useNftData } from '$core/ManageTokens/hooks/useNftData';
import { ScaleDecorator } from '$uikit/DraggableFlashList';
import { NestableDraggableFlatList } from '$uikit/DraggableFlashList/components/NestableDraggableFlatList';
import { NestableScrollContainer } from '$uikit/DraggableFlashList/components/NestableScrollContainer';
import { Haptics } from '$utils';
import { useTokenApprovalStore } from '$store/zustand/tokenApproval/useTokenApprovalStore';

export function reorderJettons(newOrder: JettonBalanceModel[]) {
  return newOrder.map((jettonBalance) => {
    const rawAddress = new Address(jettonBalance.jettonAddress).toString(false);
    return rawAddress;
  });
}

const FLashListItem = ({
  item,
  renderDragButton,
}: {
  item: Content;
  renderDragButton?: () => JSX.Element;
}) => {
  switch (item.type) {
    case ContentType.Title:
      return (
        <SText style={styles.flashListTitle} variant="h3" color="textPrimary">
          {item.title}
        </SText>
      );
    case ContentType.Spacer:
      return <Spacer y={item.bottom} />;
    case ContentType.Cell:
      const containerStyle = [
        item.isFirst && styles.firstListItem,
        item.isLast && styles.lastListItem,
        styles.containerListItem,
        item.attentionBackground && styles.attentionBackground,
      ];
      return (
        <View style={containerStyle}>
          <List.Item
            imageStyle={item.imageStyle}
            chevron={item.chevron}
            chevronColor={item.chevronColor}
            title={item.title}
            subtitle={item.subtitle}
            onPress={item.onPress}
            picture={item.picture}
            leftContent={item.leftContent}
            value={item.isDraggable && renderDragButton?.()}
          />
          {!item.isLast && <ListSeparator variant={item.separatorVariant} />}
        </View>
      );
  }
};

const DraggableFLashListItem = ({ item, drag, isActive }: { item: Content }) => {
  const handleDrag = useCallback(() => {
    drag?.();
    Haptics.impactMedium();
  }, [drag]);

  const renderDragButton = useCallback(() => {
    return (
      <TouchableOpacity disabled={isActive} onLongPress={handleDrag}>
        <Icon name="ic-reorder-28" color="iconSecondary" />
      </TouchableOpacity>
    );
  }, [handleDrag, isActive]);

  return (
    <ScaleDecorator>
      <FLashListItem item={item} renderDragButton={renderDragButton} />
    </ScaleDecorator>
  );
};

export const ManageTokens: FC = () => {
  const { bottom: bottomInset } = useSafeAreaInsets();
  const [tab, setTab] = useState<string>('tokens');
  const jettonData = useJettonData();
  const nftData = useNftData();
  const hasWatchedCollectiblesTab = useTokenApprovalStore(
    (state) => state.hasWatchedCollectiblesTab,
  );
  const setHasWatchedCollectiblesTab = useTokenApprovalStore(
    (state) => state.actions.setHasWatchedCollectiblesTab,
  );

  const withCollectibleDot = React.useMemo(() => {
    return !hasWatchedCollectiblesTab;
  }, [hasWatchedCollectiblesTab]);

  const renderJettonList = useCallback(() => {
    return (
      <FlashList
        estimatedItemSize={76}
        contentContainerStyle={StyleSheet.flatten([
          styles.flashList.static,
          { paddingBottom: bottomInset },
        ])}
        data={jettonData}
        renderItem={FLashListItem}
      />
    );
    // TODO: draggable flashlist
    return (
      <NestableScrollContainer>
        {jettonData.pending.length > 0 && (
          <>
            <SText style={styles.flashListTitle} variant="h3" color="textPrimary">
              {t('approval.pending')}
            </SText>
            <NestableDraggableFlatList
              keyExtractor={(item) => item?.id}
              contentContainerStyle={StyleSheet.flatten([styles.flashList.static])}
              data={jettonData.pending}
              renderItem={DraggableFLashListItem}
            />
            <Spacer y={16} />
          </>
        )}
        {jettonData.enabled.length > 0 && (
          <>
            <SText style={styles.flashListTitle} variant="h3" color="textPrimary">
              {t('approval.accepted')}
            </SText>
            <NestableDraggableFlatList
              keyExtractor={(item) => item?.id}
              contentContainerStyle={StyleSheet.flatten([styles.flashList.static])}
              data={jettonData.enabled}
              renderItem={DraggableFLashListItem}
            />
            <Spacer y={16} />
          </>
        )}
        {jettonData.disabled.length > 0 && (
          <>
            <SText style={styles.flashListTitle} variant="h3" color="textPrimary">
              {t('approval.declined')}
            </SText>
            <NestableDraggableFlatList
              keyExtractor={(item) => item?.id}
              contentContainerStyle={StyleSheet.flatten([styles.flashList.static])}
              data={jettonData.disabled}
              renderItem={DraggableFLashListItem}
            />
            <Spacer y={16} />
          </>
        )}
      </NestableScrollContainer>
    );
  }, [bottomInset, jettonData]);

  const renderTabs = useCallback(() => {
    return (
      <Screen>
        <Tabs>
          <View style={{ flex: 1 }}>
            <Tabs.Header withBackButton style={styles.tabsHeader}>
              <Tabs.Bar
                // TODO: Remove hardcoded inline styles
                indicatorStyle={{ bottom: 0 }}
                itemStyle={{ paddingTop: 16, paddingBottom: 8 }}
                onChange={({ value }) => {
                  setTab(value);
                  if (value === 'collectibles') {
                    setHasWatchedCollectiblesTab(true);
                  }
                }}
                value={tab}
                items={[
                  { label: t('wallet.tonkens_tab_lable'), value: 'tokens' },
                  {
                    label: t('wallet.collectibles_tab_lable'),
                    value: 'collectibles',
                    withDot: withCollectibleDot,
                  },
                ]}
              />
            </Tabs.Header>
            <Tabs.PagerView>
              <Tabs.Section index={0}>{renderJettonList()}</Tabs.Section>
              <Tabs.Section index={1}>
                <FlashList
                  keyExtractor={(item) => item?.id}
                  estimatedItemSize={76}
                  contentContainerStyle={StyleSheet.flatten([
                    styles.flashList.static,
                    { paddingBottom: bottomInset },
                  ])}
                  data={nftData}
                  renderItem={FLashListItem}
                />
              </Tabs.Section>
            </Tabs.PagerView>
          </View>
        </Tabs>
      </Screen>
    );
  }, [
    bottomInset,
    nftData,
    renderJettonList,
    setHasWatchedCollectiblesTab,
    tab,
    withCollectibleDot,
  ]);

  if (nftData.length) {
    return renderTabs();
  } else {
    return (
      <Screen>
        <Screen.Header title={t('approval.manage_tokens')} />
        <Screen.FlashList
          keyExtractor={(item) => item?.id}
          estimatedItemSize={76}
          renderItem={FLashListItem}
          contentContainerStyle={StyleSheet.flatten([
            styles.flashList.static,
            { paddingBottom: bottomInset },
          ])}
          data={nftData.length ? nftData : jettonData}
        />
      </Screen>
    );
  }
};

const styles = Steezy.create(({ safeArea, corners, colors }) => ({
  tabsHeader: {
    position: 'relative',
    paddingTop: safeArea.top,
    paddingBottom: 16,
  },
  flashList: {
    paddingHorizontal: 16,
  },
  flashListTitle: {
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  firstListItem: {
    borderTopLeftRadius: corners.medium,
    borderTopRightRadius: corners.medium,
  },
  lastListItem: {
    borderBottomLeftRadius: corners.medium,
    borderBottomRightRadius: corners.medium,
  },
  containerListItem: {
    overflow: 'hidden',
    backgroundColor: colors.backgroundContent,
  },
  attentionBackground: {
    backgroundColor: colors.backgroundContentAttention,
  },
}));