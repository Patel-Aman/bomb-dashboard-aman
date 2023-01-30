import React, { useMemo } from 'react';

// UI
import { Button, Grid } from '@material-ui/core';
import useModal from '../../../hooks/useModal';
import WithdrawModal from './WithdrawModal';
import TokenSymbol from '../../../components/TokenSymbol';
import DepositModal from './DepositeModal';

// hooks
import useStatsForPool from '../../../hooks/useStatsForPool';
import useStakedBalance from '../../../hooks/useStakedBalance';
import useStakedTokenPriceInDollars from '../../../hooks/useStakedTokenPriceInDollars';
import useEarnings from '../../../hooks/useEarnings';
import useBombStats from '../../../hooks/useBombStats';
import useShareStats from '../../../hooks/usetShareStats';
import useApprove, { ApprovalState } from '../../../hooks/useApprove';
import useWithdraw from '../../../hooks/useWithdraw';
import useStake from '../../../hooks/useStake';
import useTokenBalance from '../../../hooks/useTokenBalance';
import useRedeem from '../../../hooks/useRedeem';

import { Bank } from '../../../bomb-finance';
import { getDisplayBalance } from '../../../utils/formatBalance';

interface PoolsProps {
  bank: Bank;
}

const Pools: React.FC<PoolsProps> = ({ bank }) => {
  const { onRedeem } = useRedeem(bank);
  const stakedBalance = useStakedBalance(bank.contract, bank.poolId);
  const [approveStatus, approve] = useApprove(bank.depositToken, bank.address);
  const { onWithdraw } = useWithdraw(bank);
  const { onStake } = useStake(bank);
  const tokenBalance = useTokenBalance(bank.depositToken);
  const bombStats = useBombStats();
  const tShareStats = useShareStats();
  const earnings = useEarnings(bank.contract, bank.earnTokenName, bank.poolId);
  let statsOnPool = useStatsForPool(bank);
  const stakedTokenPriceInDollars = useStakedTokenPriceInDollars(bank.depositTokenName, bank.depositToken);

  // withdraw modal
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

  // deposit modal
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

  const tokenStats = bank.earnTokenName === 'BSHARE' ? tShareStats : bombStats;

  const tokenPriceInDollarsEarn = useMemo(
    () => (tokenStats ? Number(tokenStats.priceInDollars).toFixed(2) : null),
    [tokenStats],
  );
  const tokenPriceInDollars = useMemo(
    () => (stakedTokenPriceInDollars ? stakedTokenPriceInDollars : null),
    [stakedTokenPriceInDollars],
  );

  // covert to dollars
  const earnedInDollarsEarned = (Number(tokenPriceInDollarsEarn) * Number(getDisplayBalance(earnings))).toFixed(2);
  const earnedInDollars = (
    Number(tokenPriceInDollars) * Number(getDisplayBalance(stakedBalance, bank.depositToken.decimal))
  ).toFixed(2);

  if (bank.depositTokenName === 'BBOND') {
    return <></>;
  }

  return (
    <>
      <div style={{ marginTop: '2vh' }}>
        <Grid container>
          <Grid item md={10}>
            <TokenSymbol symbol={bank.depositTokenName} size={34}></TokenSymbol>
            {bank.depositTokenName} <small className="recommended">Recommended</small>
          </Grid>
          <Grid item md={2}>
            TVL: ${statsOnPool?.TVL ? statsOnPool?.TVL : '--'}
          </Grid>
          <Grid item md={12}>
            <hr className="hr-line" />
          </Grid>
        </Grid>
        <Grid container spacing={4}>
          <Grid item md={2}>
            Daily Returns: <br /> {statsOnPool?.dailyAPR ? statsOnPool?.dailyAPR : '0.00'}%
          </Grid>

          <Grid item md={2}>
            Your Stake: <br />
            <TokenSymbol symbol={bank.depositTokenName} size={22}></TokenSymbol>{' '}
            {getDisplayBalance(stakedBalance, bank.depositToken.decimal)} <br /> {`≈ $${earnedInDollars}`}
          </Grid>

          <Grid item md={2}>
            Earned:
            <br /> <TokenSymbol symbol="BSHARE" size={22}></TokenSymbol> {getDisplayBalance(earnings)} <br />{' '}
            {`≈ $${earnedInDollarsEarned}`}
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
                      ? 'round-button disabled'
                      : 'round-button'
                  }
                >
                  Approve
                </Button>
              ) : (
                <Button className="round-button" onClick={() => (bank.closedForStaking ? null : onPresentDeposit())}>
                  Deposit
                </Button>
              )}

              {/* active if stake is not zero */}
              <Button
                onClick={onPresentWithdraw}
                className={Number(earnedInDollars) > 0 ? 'round-button' : 'round-button disabled'}
                disabled={Number(earnedInDollars) > 0 ? false : true}
              >
                Withdraw
              </Button>

              {/* active if earned > 0 */}
              <Button
                onClick={onRedeem}
                className={Number(earnedInDollarsEarned) > 0 ? 'round-button' : 'round-button disabled'}
                disabled={Number(earnedInDollarsEarned) > 0 ? false : true}
              >
                Claim Rewards <TokenSymbol symbol="BSHARE" size={22} />
              </Button>
            </div>
          </Grid>
        </Grid>
      </div>
    </>
  );
};

export default Pools;
