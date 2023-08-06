import React from 'react';
import BigNumber from 'bignumber.js';
import { useCopyText } from '$hooks/useCopyText';
import { useInstance } from '$hooks/useInstance';
import { useWallet } from '$hooks/useWallet';
import { Highlight, Icon, Separator, Skeleton, Text } from '$uikit';
import { toLocaleNumber } from '$utils';
import { debugLog } from '$utils/debugLog';
import { NFTOperationFooter, useNFTOperationState } from '../NFTOperationFooter';
import { NftSalePlaceParams, TxRequestBody } from '../TXRequest.types';
import { useDownloadNFT } from '../useDownloadNFT';
import { useUnlockVault } from '../useUnlockVault';
import { NFTOperations } from '../NFTOperations';
import * as S from '../NFTOperations.styles';
import { t } from '@tonkeeper/shared/i18n';
import { Ton } from '$libs/Ton';
import { Modal } from '@tonkeeper/uikit';
import { Address } from '@tonkeeper/core';

type NFTSalePlaceModalProps = TxRequestBody<NftSalePlaceParams>;

export const NFTSalePlaceModal = ({ params, ...options }: NFTSalePlaceModalProps) => {
  const item = useDownloadNFT(params.nftItemAddress);
  const { footerRef, onConfirm } = useNFTOperationState(options);
  const [isShownDetails, setIsShownDetails] = React.useState(false);
  const [txfee, setTxFee] = React.useState('');
  const copyText = useCopyText();

  const wallet = useWallet();
  const unlockVault = useUnlockVault();
  const operations = useInstance(() => {
    return new NFTOperations(wallet);
  });

  const toggleDetails = React.useCallback(() => {
    setIsShownDetails(!isShownDetails);
  }, [isShownDetails]);

  React.useEffect(() => {
    operations
      .salePlace(params)
      .then((operation) => operation.estimateFee())
      .then((fee) => setTxFee(fee))
      .catch((err) => {
        setTxFee('0.02');
        debugLog('[nft estimate fee]:', err);
      });
  }, []);

  const handleConfirm = onConfirm(async ({ startLoading }) => {
    const vault = await unlockVault();
    const privateKey = await vault.getTonPrivateKey();

    startLoading();

    const operation = await operations.salePlace(params);
    const deploy = await operation.send(privateKey);

    console.log('DEPLOY', deploy);
  });

  const fullPrice = React.useMemo(() => {
    return Ton.fromNano(params.fullPrice);
  }, []);

  const marketplaceFee = React.useMemo(() => {
    return Ton.fromNano(params.marketplaceFee);
  }, []);

  const royaltyAmount = React.useMemo(() => {
    return Ton.fromNano(params.royaltyAmount);
  }, []);

  const amount = React.useMemo(() => {
    return Ton.fromNano(params.amount);
  }, []);

  const blockchainFee = React.useMemo(() => {
    if (txfee !== '') {
      return new BigNumber(txfee).plus(amount).toString();
    }

    return false;
  }, [txfee]);

  const feeAndRoyalties = React.useMemo(() => {
    if (txfee !== '') {
      return new BigNumber(txfee)
        .plus(amount)
        .plus(marketplaceFee)
        .plus(royaltyAmount)
        .toString();
    }

    return false;
  }, [txfee]);

  const proceeds = React.useMemo(() => {
    if (feeAndRoyalties) {
      return new BigNumber(fullPrice).minus(feeAndRoyalties).toString();
    }

    return false;
  }, [fullPrice, feeAndRoyalties]);

  const isTG = (item.data?.dns || item.data?.metadata?.name)?.endsWith('.t.me');
  const isDNS = !!item.data?.dns && !isTG;

  const caption = React.useMemo(() => {
    let text = '...';
    if (item.data?.metadata) {
      text = `${item.data.dns || item.data.metadata.name}`;
    }

    if (item.data?.collection) {
      text += ` · ${isDNS ? 'TON DNS' : item.data.collection.name}`;
    }

    return item.data ? text : '...';
  }, [item.data]);

  return (
    <Modal>
      <Modal.Header gradient />
      <Modal.ScrollView scrollEnabled={isShownDetails}>
        <S.Container>
          <S.Center>
            <S.NFTItemPreview>
              <S.Image uri={item?.data?.metadata?.image} resize={512} />
            </S.NFTItemPreview>
            <S.CaptionWrap>
              <S.Caption>{caption}</S.Caption>
              {item.data?.approved_by?.length ? (
                <Icon style={{ marginLeft: 4 }} name="ic-verification-secondary-16" />
              ) : null}
            </S.CaptionWrap>
            <S.Title>{t('nft_sale_place_title')}</S.Title>
          </S.Center>
          <S.Info>
            <Highlight onPress={() => copyText(params.marketplaceAddress)}>
              <S.InfoItem>
                <S.InfoItemLabel>{t('nft_marketplace_address')}</S.InfoItemLabel>
                <S.InfoItemValueText>
                  {Address.toShort(params.marketplaceAddress, 6)}
                </S.InfoItemValueText>
              </S.InfoItem>
            </Highlight>
            <Separator />
            <Highlight onPress={() => fullPrice && copyText(toLocaleNumber(fullPrice))}>
              <S.InfoItem>
                <S.InfoItemLabel>{t('nft_price')}</S.InfoItemLabel>
                <S.InfoItemValue>
                  {fullPrice ? (
                    <Text variant="body1">{toLocaleNumber(fullPrice)} TON</Text>
                  ) : (
                    <Skeleton.Line width={80} />
                  )}
                </S.InfoItemValue>
              </S.InfoItem>
            </Highlight>
            <Separator />
            <Highlight onPress={() => proceeds && copyText(toLocaleNumber(proceeds))}>
              <S.InfoItem>
                <S.InfoItemLabel>{t('nft_proceeds')}</S.InfoItemLabel>
                <S.InfoItemValue>
                  {proceeds ? (
                    <Text variant="body1">{toLocaleNumber(proceeds)} TON</Text>
                  ) : (
                    <Skeleton.Line width={80} />
                  )}
                </S.InfoItemValue>
              </S.InfoItem>
            </Highlight>
            <Separator />
            <Highlight
              onPress={() => feeAndRoyalties && copyText(toLocaleNumber(feeAndRoyalties))}
            >
              <S.InfoItem>
                <S.InfoItemLabel>{t('nft_fee_and_royalties')}</S.InfoItemLabel>
                <S.InfoItemValue>
                  {feeAndRoyalties ? (
                    <Text variant="body1">{toLocaleNumber(feeAndRoyalties)} TON</Text>
                  ) : (
                    <Skeleton.Line width={80} />
                  )}
                </S.InfoItemValue>
              </S.InfoItem>
            </Highlight>
          </S.Info>
          {isShownDetails && (
            <S.Details>
              <Highlight onPress={() => copyText(params.nftItemAddress)}>
                <S.DetailItem>
                  <S.DetailItemLabel>NFT item ID</S.DetailItemLabel>
                  <S.DetailItemValueText>
                    {Address.toShort(params.nftItemAddress, 8)}
                  </S.DetailItemValueText>
                </S.DetailItem>
              </Highlight>
              <Highlight onPress={() => copyText(toLocaleNumber(marketplaceFee))}>
                <S.DetailItem>
                  <S.DetailItemLabel>Marketplace fee</S.DetailItemLabel>
                  <S.DetailItemValueText>
                    {toLocaleNumber(marketplaceFee)} TON
                  </S.DetailItemValueText>
                </S.DetailItem>
              </Highlight>
              <Highlight onPress={() => copyText(params.royaltyAddress)}>
                <S.DetailItem>
                  <S.DetailItemLabel>Royalty address</S.DetailItemLabel>
                  <S.DetailItemValueText>
                    {Address.toShort(params.royaltyAddress, 8)}
                  </S.DetailItemValueText>
                </S.DetailItem>
              </Highlight>
              <Highlight
                onPress={() => royaltyAmount && copyText(toLocaleNumber(royaltyAmount))}
              >
                <S.DetailItem>
                  <S.DetailItemLabel>Royalty</S.DetailItemLabel>
                  {royaltyAmount ? (
                    <Text variant="body2">{toLocaleNumber(royaltyAmount)} TON</Text>
                  ) : (
                    <Skeleton.Line width={80} />
                  )}
                </S.DetailItem>
              </Highlight>
              <Highlight
                onPress={() => blockchainFee && copyText(toLocaleNumber(blockchainFee))}
              >
                <S.DetailItem>
                  <S.DetailItemLabel>Blockchain fee</S.DetailItemLabel>
                  {blockchainFee ? (
                    <Text variant="body2">{toLocaleNumber(blockchainFee)} TON</Text>
                  ) : (
                    <Skeleton.Line width={80} />
                  )}
                </S.DetailItem>
              </Highlight>
            </S.Details>
          )}
          <S.Center>
            <S.ToggleDetailsButton onPress={toggleDetails}>
              <S.ToggleDetailsButtonTitle>
                {isShownDetails ? t('nft_hide_details') : t('nft_show_details')}
              </S.ToggleDetailsButtonTitle>
            </S.ToggleDetailsButton>
          </S.Center>
        </S.Container>
      </Modal.ScrollView>
      <Modal.Footer>
        <NFTOperationFooter onPressConfirm={handleConfirm} ref={footerRef} />
      </Modal.Footer>
    </Modal>
  );
};
