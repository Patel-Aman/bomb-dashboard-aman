import React, { useMemo } from 'react';

import { Button, Divider, Grid } from '@material-ui/core';
import { ThemeContext } from 'styled-components';

import useStatsForPool from '../../../hooks/useStatsForPool';
import { Bank } from '../../../bomb-finance';
import { getDisplayBalance } from '../../../utils/formatBalance';
import useStakedBalance from '../../../hooks/useStakedBalance';
import useStakedTokenPriceInDollars from '../../../hooks/useStakedTokenPriceInDollars';
import useEarnings from '../../../hooks/useEarnings';
import useBombStats from '../../../hooks/useBombStats';
import useShareStats from '../../../hooks/usetShareStats';
import useApprove, { ApprovalState } from '../../../hooks/useApprove';
import { AddIcon, RemoveIcon } from '../../../components/icons';
import FlashOnIcon from '@material-ui/icons/FlashOn';
import IconButton from '../../../components/IconButton';
import useModal from '../../../hooks/useModal';
import WithdrawModal from './WithdrawModal'; // may give error
import useWithdraw from '../../../hooks/useWithdraw';
import ZapModal from './ZapModal';
import DepositModal from './DepositeModal';
import useStake from '../../../hooks/useStake';
import useZap from '../../../hooks/useZap';
import useTokenBalance from '../../../hooks/useTokenBalance';
import { useContext } from 'react';
import styled from 'styled-components';
import useRedeem from '../../../hooks/useRedeem';

interface PoolsProps {
  bank: Bank;
}

const Pools: React.FC<PoolsProps> = ({ bank }) => {
  const { onRedeem } = useRedeem(bank);
  const { color: themeColor } = useContext(ThemeContext);
  const stakedBalance = useStakedBalance(bank.contract, bank.poolId);
  const [approveStatus, approve] = useApprove(bank.depositToken, bank.address);
  const { onWithdraw } = useWithdraw(bank);
  const { onStake } = useStake(bank);
  const { onZap } = useZap(bank);
  const tokenBalance = useTokenBalance(bank.depositToken);

  const [onPresentWithdraw, onDismissWithdraw] = useModal(
    <WithdrawModal
      max={stakedBalance}
      decimals={bank.depositToken.decimal}
      onConfirm={(amount) => {
        if (Number(amount) <= 0 || isNaN(Number(amount))) return;
        onWithdraw(amount);
        onDismissWithdraw();
      }}
      tokenName={bank.depositTokenName}
    />,
  );

  const [onPresentZap, onDissmissZap] = useModal(
    <ZapModal
      decimals={bank.depositToken.decimal}
      onConfirm={(zappingToken, tokenName, amount) => {
        if (Number(amount) <= 0 || isNaN(Number(amount))) return;
        onZap(zappingToken, tokenName, amount);
        onDissmissZap();
      }}
      tokenName={bank.depositTokenName}
    />,
  );

  const [onPresentDeposit, onDismissDeposit] = useModal(
    <DepositModal
      max={tokenBalance}
      decimals={bank.depositToken.decimal}
      onConfirm={(amount) => {
        if (Number(amount) <= 0 || isNaN(Number(amount))) return;
        onStake(amount);
        onDismissDeposit();
      }}
      tokenName={bank.depositTokenName}
    />,
  );

  const bombStats = useBombStats();
  const tShareStats = useShareStats();

  const earnings = useEarnings(bank.contract, bank.earnTokenName, bank.poolId);
  const tokenStats = bank.earnTokenName === 'BSHARE' ? tShareStats : bombStats;

  const tokenPriceInDollarsEarn = useMemo(
    () => (tokenStats ? Number(tokenStats.priceInDollars).toFixed(2) : null),
    [tokenStats],
  );

  const earnedInDollarsEarned = (Number(tokenPriceInDollarsEarn) * Number(getDisplayBalance(earnings))).toFixed(2);

  const stakedTokenPriceInDollars = useStakedTokenPriceInDollars(bank.depositTokenName, bank.depositToken);

  const tokenPriceInDollars = useMemo(
    () => (stakedTokenPriceInDollars ? stakedTokenPriceInDollars : null),
    [stakedTokenPriceInDollars],
  );

  let statsOnPool = useStatsForPool(bank);
  const earnedInDollars = (
    Number(tokenPriceInDollars) * Number(getDisplayBalance(stakedBalance, bank.depositToken.decimal))
  ).toFixed(2);

  if (bank.depositTokenName === 'BBOND') {
    return <></>;
  }

  return (
    <>
      <div style={{ marginTop: '2vh' }}>
        <div>
          <span>
            {bank.depositTokenName} <small className="recommended">Recommended</small>
          </span>
          <p>TVL: ${statsOnPool?.TVL ? statsOnPool?.TVL : '--'}</p>
        </div>
        <Divider />

        <Grid container spacing={2}>
          <Grid item md={2}>
            Daily Returns: {statsOnPool?.dailyAPR ? '0.00' : statsOnPool?.dailyAPR}%
          </Grid>
          <Grid item md={2}>
            Your Stake: {getDisplayBalance(stakedBalance, bank.depositToken.decimal)} ≈ {`≈ $${earnedInDollars}`}
          </Grid>
          <Grid item md={2}>
            Earned: {getDisplayBalance(earnings)} ≈ {`≈ $${earnedInDollarsEarned}`}
          </Grid>

          <Grid item md={6}>
            <div>
              {approveStatus !== ApprovalState.APPROVED ? (
                <Button
                  disabled={
                    bank.closedForStaking ||
                    approveStatus === ApprovalState.PENDING ||
                    approveStatus === ApprovalState.UNKNOWN
                  }
                  onClick={approve}
                  className={
                    bank.closedForStaking ||
                    approveStatus === ApprovalState.PENDING ||
                    approveStatus === ApprovalState.UNKNOWN
                      ? '' // active btn
                      : '' // disable
                  }
                  variant="contained"
                  style={{ marginTop: '20px' }}
                >
                  DIPOSIT
                </Button>
              ) : (
                <>
                  <IconButton onClick={onPresentWithdraw}>
                    <RemoveIcon />
                  </IconButton>
                  <StyledActionSpacer />
                  <IconButton
                    disabled={
                      bank.closedForStaking ||
                      bank.depositTokenName === 'BOMB-BSHARE-LP' ||
                      bank.depositTokenName === 'BOMB' ||
                      bank.depositTokenName === 'BOMB-BTCB-LP' ||
                      bank.depositTokenName === '80BOMB-20BTCB-LP' ||
                      bank.depositTokenName === '80BSHARE-20WBNB-LP' ||
                      bank.depositTokenName === 'BUSM-BUSD-LP' ||
                      bank.depositTokenName === 'BBOND'
                    }
                    onClick={() => (bank.closedForStaking ? null : onPresentZap())}
                  >
                    <FlashOnIcon style={{ color: themeColor.grey[400] }} />
                  </IconButton>
                  <StyledActionSpacer />
                  <IconButton
                    disabled={bank.closedForStaking}
                    onClick={() => (bank.closedForStaking ? null : onPresentDeposit())}
                  >
                    <AddIcon />
                  </IconButton>
                </>
              )}
            </div>

            <Button onClick={onRedeem} className="shinyButtonSecondary">
              Withdraw
            </Button>

            <Button onClick={onRedeem} className="shinyButtonSecondary">
              Claim
            </Button>
          </Grid>
        </Grid>
      </div>
    </>
  );
};

const StyledCardActions = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 28px;
  width: 100%;
`;

const StyledActionSpacer = styled.div`
  height: ${(props) => props.theme.spacing[4]}px;
  width: ${(props) => props.theme.spacing[4]}px;
`;

export default Pools;
