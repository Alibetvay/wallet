import React, { useCallback, useMemo, useRef, useState } from 'react';
import * as S from './NFT.style';
import {Badge, Button, Highlight, Icon, ListHeader, NavBar, Text} from '$uikit';
import Animated, {
  useAnimatedScrollHandler,
  useSharedValue,
} from 'react-native-reanimated';
import { ImageWithTitle } from '$core/NFT/ImageWithTitle/ImageWithTitle';
import { checkIsTonDiamondsNFT, maskifyTonAddress, ns } from '$utils';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslator } from '$hooks';
import { Properties } from '$core/NFT/Properties/Properties';
import { Details } from '$core/NFT/Details/Details';
import { About } from '$core/NFT/About/About';
import { NFTProps } from '$core/NFT/NFT.interface';
import { useNFT } from '$hooks/useNFT';
import { Linking, Platform, Share } from 'react-native';
import { TonDiamondFeature } from './TonDiamondFeature/TonDiamondFeature';
import { useDispatch, useSelector } from 'react-redux';
import { walletSelector } from '$store/wallet';
import { NFTModel, TonDiamondMetadata } from '$store/models';
import { useFlags } from '$utils/flags';
import { LinkingDomainButton } from './LinkingDomainButton';
import { nftsActions } from '$store/nfts';
import { useNavigation } from '$libs/navigation';
import { NFTTransferInputAddressModal } from '$core/ModalContainer/NFTTransferInputAddressModal/NFTTransferInputAddressModal';
import { Toast } from '$uikit/Toast/new';
import * as SO from '../ModalContainer/NFTOperations/NFTOperations.styles';
import { copyText } from '$hooks/useCopyText';

export const NFT: React.FC<NFTProps> = ({ route }) => {
  const flags = useFlags(['disable_nft_markets', 'disable_apperance']);

  const dispatch = useDispatch();
  const nav = useNavigation();
  const { address } = useSelector(walletSelector);
  const nftFromHistory = useNFT(route.params.keyPair);

  const [nft, setNft] = useState(nftFromHistory);

  const setOwnerAddress = React.useCallback(
    (options: { ownerAddress: string }) => {
      if (!nft.ownerAddress) {
        const updatedNft = { ...nft, ownerAddress: options.ownerAddress };
        dispatch(nftsActions.setNFT({ nft: updatedNft }));
        setNft(updatedNft);
      }
    },
    [nft],
  );

  const isDNS = !!nft.dns;
  const isTonDiamondsNft = checkIsTonDiamondsNFT(nft);

  const t = useTranslator();
  const scrollTop = useSharedValue(0);
  const scrollRef = useRef<Animated.ScrollView>(null);
  const { bottom: bottomInset } = useSafeAreaInsets();
  const canTransfer = useMemo(
    () => {
      console.log('nft.ownerAddress', nft.ownerAddress);
      return nft.ownerAddress === address.ton
    },
    [nft.ownerAddress, address.ton],
  );

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollTop.value = event.contentOffset.y;
    },
  });

  const handleOpenInMarketplace = useCallback(() => {
    if (!nft.marketplaceURL) {
      return;
    }
    Linking.openURL(nft.marketplaceURL);
  }, [nft.marketplaceURL]);

  const handleTransferNft = useCallback(() => {
    nav.openModal('NFTTransferInputAddress', { 
      nftAddress: nft.address 
    });
  }, [nft.address]);

  const handleShare = useCallback(() => {
    if (!nft.marketplaceURL) {
      return;
    }
    Share.share({
      url: nft.marketplaceURL,
      title: nft.name,
      message: Platform.OS === 'android' ? nft.marketplaceURL : undefined,
    });
  }, [nft.marketplaceURL, nft.name]);

  const isOnSale = useMemo(() => !!nft.sale, [nft.sale]);

  const lottieUri = isTonDiamondsNft ? nft.metadata?.lottie : undefined;

  const videoUri = isTonDiamondsNft ? nft.metadata?.animation_url : undefined;

  const title = useMemo(() => {
    if (isDNS) {
      return nft.dns;
    }

    return nft.name || maskifyTonAddress(nft.address);
  }, [isDNS, nft.dns, nft.name, nft.address]);

  return (
    <S.Wrap>
      <NavBar
        rightContent={
          nft.marketplaceURL && (
            <Button
              onPress={handleShare}
              size="navbar_icon"
              mode="secondary"
              before={<Icon name="ic-share-16" color="foregroundPrimary" />}
            />
          )
        }
        isModal
        scrollTop={scrollTop}
        titleProps={{ numberOfLines: 1 }}
      >
        {title}
      </NavBar>
      <S.ContentWrap>
        <Animated.ScrollView
          alwaysBounceVertical={false}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="none"
          ref={scrollRef}
          contentContainerStyle={{
            paddingHorizontal: ns(16),
            paddingBottom: bottomInset,
          }}
          onScroll={scrollHandler}
          scrollEventThrottle={16}
        >
          {nft.name || nft.collection?.name || nft.content.image.baseUrl ? (
            <ImageWithTitle
              uri={isDNS ? undefined : nft.content.image.baseUrl}
              lottieUri={lottieUri}
              videoUri={videoUri}
              title={nft.dns || nft.name}
              collection={isDNS ? 'TON DNS' : nft.collection?.name}
              isVerified={isDNS || nft.isApproved}
              description={nft.description}
              isOnSale={isOnSale}
            />
          ) : null}
          {nft.collection ? (
            <About
              collection={isDNS ? 'TON DNS' : nft.collection.name}
              description={isDNS ? t('nft_about_dns') : nft.collection.description}
            />
          ) : null}
          {isTonDiamondsNft && !flags.disable_apperance ? (
            <TonDiamondFeature nft={nft as NFTModel<TonDiamondMetadata>} />
          ) : null}
          <S.ButtonWrap>
            {nft.ownerAddress && (
              <Button
                style={{ marginBottom: ns(16) }}
                onPress={handleTransferNft}
                // disabled={!canTransfer}
                size="large"
              >
                {isDNS ? t('nft_transfer_dns') : t('nft_transfer_nft')}
              </Button>
            )}
            {isOnSale ? (
              <S.OnSaleText>
                <Text variant="body2" color="foregroundSecondary">
                  {t('nft_on_sale_text')}
                </Text>
              </S.OnSaleText>
            ) : null}
            {!!nft.dns && (
              <LinkingDomainButton
                disabled={isOnSale}
                onLink={setOwnerAddress}
                ownerAddress={nft.ownerAddress}
                domainAddress={nft.address}
                domain={nft.dns}
              />
            )}
          
          <ListHeader 
            title="Debug"
          />
          <SO.Details>
            <Highlight onPress={() => copyText(nft.ownerAddress)}>
              <SO.DetailItem>
                <SO.DetailItemLabel>nft.ownerAddress</SO.DetailItemLabel>
                <SO.DetailItemValueText>{nft.ownerAddress}</SO.DetailItemValueText>
              </SO.DetailItem>
            </Highlight>
            <Highlight onPress={() => copyText(address.ton)}>
              <SO.DetailItem>
                <SO.DetailItemLabel>address.ton</SO.DetailItemLabel>
                <SO.DetailItemValueText>{address.ton}</SO.DetailItemValueText>
              </SO.DetailItem>
            </Highlight>
            <Highlight onPress={() => copyText(canTransfer)}>
              <SO.DetailItem>
                <SO.DetailItemLabel>canTransfer</SO.DetailItemLabel>
                <SO.DetailItemValueText>{String(canTransfer)}</SO.DetailItemValueText>
              </SO.DetailItem>
            </Highlight>
          </SO.Details>

            {nft.marketplaceURL && !flags.disable_nft_markets ? (
              <Button
                style={{ marginBottom: ns(16) }}
                mode={'secondary'}
                onPress={handleOpenInMarketplace}
                size="large"
              >
                {t('nft_open_in_marketplace')}
              </Button>
            ) : null}
          </S.ButtonWrap>
          <Properties properties={nft.attributes} />
          <Details
            ownerAddress={nft.ownerAddressToDisplay || nft.ownerAddress}
            contractAddress={nft.address}
          />
        </Animated.ScrollView>
      </S.ContentWrap>
    </S.Wrap>
  );
};
