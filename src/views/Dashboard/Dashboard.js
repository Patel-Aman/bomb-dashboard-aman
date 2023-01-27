import './Dashboard.css';

import React, { useMemo, useCallback } from 'react';
import Page from '../../components/Page';
import { createGlobalStyle } from 'styled-components';
import TokenSymbol from '../../components/TokenSymbol';
import useBombStats from '../../hooks/useBombStats';
import useBondStats from '../../hooks/useBondStats';
import usebShareStats from '../../hooks/usebShareStats';
import { roundAndFormatNumber } from '../../0x';
import MetamaskFox from '../../assets/img/metamask-fox.svg';
import { Box, Button, Card, Grid, Divider, Table } from '@material-ui/core';
import { TableBody, TableCell, TableContainer, TableHead, TableRow } from '@material-ui/core';
import useCurrentEpoch from '../../hooks/useCurrentEpoch';
import useBondsPurchasable from '../../hooks/useBondsPurchasable';
import { getDisplayBalance } from '../../utils/formatBalance';
import useBombFinance from '../../hooks/useBombFinance';
import useCashPriceInEstimatedTWAP from '../../hooks/useCashPriceInEstimatedTWAP';
import ProgressCountdown from './components/ProgressCountdown';
import useTreasuryAllocationTimes from '../../hooks/useTreasuryAllocationTimes';
import moment from 'moment';
import useTotalValueLocked from '../../hooks/useTotalValueLocked';
import { Helmet } from 'react-helmet';
import HomeImage from '../../assets/img/background.jpg';
import { ReactComponent as IconDiscord } from '../../assets/img/discord.svg';
// import useStatsForPool from '../../hooks/useStatsForPool';
// import useBanks from '../../hooks/useBanks';
// import useRedeem from '../../hooks/useRedeem';
import useTotalStakedOnBoardroom from '../../hooks/useTotalStakedOnBoardroom';
import useEarningsOnBoardroom from '../../hooks/useEarningsOnBoardroom';
import useStakedBalanceOnBoardroom from '../../hooks/useStakedBalanceOnBoardroom';
import useStakedTokenPriceInDollars from '../../hooks/useStakedTokenPriceInDollars';
import useHarvestFromBoardroom from '../../hooks/useHarvestFromBoardroom';
import useClaimRewardCheck from '../../hooks/boardroom/useClaimRewardCheck';
import useWithdrawCheck from '../../hooks/boardroom/useWithdrawCheck';
import useRedeemOnBoardroom from '../../hooks/useRedeemOnBoardroom';
import useBanks from '../../hooks/useBanks';
import Pools from './components/pools';
import useCashPriceInLastTWAP from '../../hooks/useCashPriceInLastTWAP'; // maybe important later
import { BOND_REDEEM_PRICE, BOND_REDEEM_PRICE_BN } from '../../bomb-finance/constants';
import { useTransactionAdder } from '../../state/transactions/hooks';
import useTokenBalance from '../../hooks/useTokenBalance';
import useWallet from 'use-wallet';
import useApprove, { ApprovalState } from '../../hooks/useApprove';
import UnlockWallet from '../../components/UnlockWallet';
import useCatchError from '../../hooks/useCatchError';
import useModal from '../../hooks/useModal';
import ExchangeModal from '../Bond/components/ExchangeModal';
import useFetchBoardroomAPR from '../../hooks/useFetchBoardroomAPR';

const BackgroundImage = createGlobalStyle`
  body {
    background: url(${HomeImage}) repeat !important;
    background-size: cover !important;
    background-color: #171923;
  }
`;

const TITLE = 'bomb.money | Dashboard';

function Dashboard() {
  // here
  const bombFinance = useBombFinance();
  const bondsPurchasable = useBondsPurchasable();
  const bondStat = useBondStats();
  const isBondPurchasable = useMemo(() => Number(bondStat?.tokenInFtm) < 1.01, [bondStat]);
  const {
    contracts: { Treasury },
  } = useBombFinance();
  const bondBalance = useTokenBalance(bombFinance?.BBOND);
  const { account } = useWallet();
  const [approveStatus, approve] = useApprove(bombFinance.BOMB, Treasury.address);
  const catchError = useCatchError();
  const balance = useTokenBalance(bombFinance.BBOND);

  let [onPresent, onDismiss] = useModal(
    <ExchangeModal
      title="Purchase"
      description={
        !isBondPurchasable
          ? 'BOMB is over peg'
          : getDisplayBalance(bondsPurchasable, 18, 4) + ' BBOND available for purchase'
      }
      max={balance}
      onConfirm={(value) => {
        handleRedeemBonds(value);
        onDismiss();
      }}
      action="Purchase"
      tokenName="BOMB"
    />,
  );
  const onPresentPurchase = onPresent;

  [onPresent, onDismiss] = useModal(
    <ExchangeModal
      title="Redeem"
      description={`${getDisplayBalance(bondBalance)} BBOND Available in wallet`}
      max={balance}
      onConfirm={(value) => {
        handleRedeemBonds(value);
        onDismiss();
      }}
      action="Redeem"
      tokenName="BBOND"
    />,
  );

  const [banks] = useBanks();
  const cashPrice = useCashPriceInLastTWAP();
  const addTransaction = useTransactionAdder();

  const isBondRedeemable = useMemo(() => cashPrice.gt(BOND_REDEEM_PRICE_BN), [cashPrice]);

  const handleRedeemBonds = useCallback(
    async (amount) => {
      const tx = await bombFinance.redeemBonds(amount);
      addTransaction(tx, { summary: `Redeem ${amount} BBOND` });
    },
    [bombFinance, addTransaction],
  );

  const activeBanks = banks.filter((bank) => !bank.finished);
  const bombStats = useBombStats();
  const bShareStats = usebShareStats();
  const tBondStats = useBondStats();
  const TVL = useTotalValueLocked();
  const cashStat = useCashPriceInEstimatedTWAP();
  const totalStaked = useTotalStakedOnBoardroom();
  const earnings = useEarningsOnBoardroom();
  const stakedBalance = useStakedBalanceOnBoardroom();
  const boardroomAPR = useFetchBoardroomAPR();

  const { onReward } = useHarvestFromBoardroom();
  const { onRedeem } = useRedeemOnBoardroom();
  const canClaimReward = useClaimRewardCheck();
  const canWithdraw = useWithdrawCheck();

  const currentEpoch = useCurrentEpoch();
  const { to } = useTreasuryAllocationTimes();

  const scalingFactor = useMemo(() => (cashStat ? Number(cashStat.priceInDollars).toFixed(4) : null), [cashStat]);
  const bombCirculatingSupply = useMemo(() => (bombStats ? String(bombStats.circulatingSupply) : null), [bombStats]);
  const bShareCirculatingSupply = useMemo(
    () => (bShareStats ? String(bShareStats.circulatingSupply) : null),
    [bShareStats],
  );
  const bombTotalSupply = useMemo(() => (bombStats ? String(bombStats.totalSupply) : null), [bombStats]);
  const bShareTotalSupply = useMemo(() => (bShareStats ? String(bShareStats.totalSupply) : null), [bShareStats]);
  const tBondCirculatingSupply = useMemo(
    () => (tBondStats ? String(tBondStats.circulatingSupply) : null),
    [tBondStats],
  );
  const tBondTotalSupply = useMemo(() => (tBondStats ? String(tBondStats.totalSupply) : null), [tBondStats]);

  const bombPriceInDollars = useMemo(
    () => (bombStats ? Number(bombStats.priceInDollars).toFixed(2) : null),
    [bombStats],
  );
  const bSharePriceInDollars = useMemo(
    () => (bShareStats ? Number(bShareStats.priceInDollars).toFixed(2) : null),
    [bShareStats],
  );
  const tBondPriceInDollars = useMemo(
    () => (tBondStats ? Number(tBondStats.priceInDollars).toFixed(2) : null),
    [tBondStats],
  );
  const tBondPriceInBNB = useMemo(() => (tBondStats ? Number(tBondStats.tokenInFtm).toFixed(4) : null), [tBondStats]);

  const bombPriceInBNB = useMemo(() => (bombStats ? Number(bombStats.tokenInFtm).toFixed(4) : null), [bombStats]);
  const bSharePriceInBNB = useMemo(
    () => (bShareStats ? Number(bShareStats.tokenInFtm).toFixed(4) : null),
    [bShareStats],
  );
  const tokenPriceInDollars = useMemo(
    () => (bombStats ? Number(bombStats.priceInDollars).toFixed(2) : null),
    [bombStats],
  );

  const stakedTokenPriceInDollars = useStakedTokenPriceInDollars('BSHARE', bombFinance.BSHARE);

  const tokenPriceInDollarsStake = useMemo(
    () =>
      stakedTokenPriceInDollars
        ? (Number(stakedTokenPriceInDollars) * Number(getDisplayBalance(stakedBalance))).toFixed(2).toString()
        : null,
    [stakedTokenPriceInDollars, stakedBalance],
  );

  const earnedInDollars = (Number(tokenPriceInDollars) * Number(getDisplayBalance(earnings))).toFixed(2);

  return (
    <Page>
      <Helmet>
        <title>{TITLE}</title>
      </Helmet>
      <BackgroundImage />

      <Grid container spacing={3}>
        <Grid item xs={12} sm={12}>
          <Card className="transparent-card">
            <Box p={2} style={{ textAlign: 'center' }} className="line head">
              Bomb Finance Summary
            </Box>

            <Grid container spacing={1}>
              <Grid item md={6}>
                <TableContainer>
                  <Table sx={{ minWidth: 650 }} aria-label="simple table">
                    <TableHead>
                      <TableRow className="line">
                        <TableCell></TableCell>
                        <TableCell className="line table-head">Current Supply</TableCell>
                        <TableCell className="line table-head">Total Supply</TableCell>
                        <TableCell className="line table-head">Price</TableCell>
                        <TableCell></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody className="table-values">
                      <TableRow className="line">
                        <TableCell component="th" scope="row">
                          <TokenSymbol symbol="BOMB" size={32} />
                          <span className="item">BOMB</span>
                        </TableCell>
                        <TableCell align="right">{roundAndFormatNumber(bombCirculatingSupply, 2)}</TableCell>
                        <TableCell align="right">{roundAndFormatNumber(bombTotalSupply, 2)}</TableCell>
                        <TableCell align="right">
                          ${bombPriceInDollars ? roundAndFormatNumber(bombPriceInDollars, 2) : '-.--'}
                          <br />
                          {bombPriceInBNB ? bombPriceInBNB : '-.----'} BTC
                        </TableCell>
                        <TableCell align="right">
                          <Button
                            onClick={() => {
                              bombFinance.watchAssetInMetamask('BOMB');
                            }}
                          >
                            {' '}
                            <b>+</b>&nbsp;&nbsp;
                            <img alt="metamask fox" style={{ width: '20px' }} src={MetamaskFox} />
                          </Button>
                        </TableCell>
                      </TableRow>
                      <TableRow className="line">
                        <TableCell component="th" scope="row">
                          <TokenSymbol symbol="BSHARE" size={32} />
                          <span className="item">BSHARE</span>
                        </TableCell>
                        <TableCell align="right">{roundAndFormatNumber(bShareCirculatingSupply, 2)}</TableCell>
                        <TableCell align="right">{roundAndFormatNumber(bShareTotalSupply, 2)}</TableCell>
                        <TableCell align="right">
                          ${bSharePriceInDollars ? bSharePriceInDollars : '-.--'} <br />
                          {bSharePriceInBNB ? bSharePriceInBNB : '-.----'} BTC
                        </TableCell>
                        <TableCell align="right">
                          <Button
                            onClick={() => {
                              bombFinance.watchAssetInMetamask('BSHARE');
                            }}
                          >
                            {' '}
                            <b>+</b>&nbsp;&nbsp;
                            <img alt="metamask fox" style={{ width: '20px' }} src={MetamaskFox} />
                          </Button>
                        </TableCell>
                      </TableRow>

                      <TableRow className="line">
                        <TableCell component="th" scope="row">
                          <TokenSymbol symbol="BBOND" size={32} />
                          <span className="item">BBOND</span>
                        </TableCell>
                        <TableCell align="right">{roundAndFormatNumber(tBondCirculatingSupply, 2)}</TableCell>
                        <TableCell align="right">{roundAndFormatNumber(tBondTotalSupply, 2)}</TableCell>
                        <TableCell align="right">
                          ${tBondPriceInDollars ? tBondPriceInDollars : '-.--'} <br />{' '}
                          {tBondPriceInBNB ? tBondPriceInBNB : '-.----'} BTC
                        </TableCell>
                        <TableCell align="right">
                          <Button
                            onClick={() => {
                              bombFinance.watchAssetInMetamask('BBOND');
                            }}
                          >
                            {' '}
                            <b>+</b>&nbsp;&nbsp;
                            <img alt="metamask fox" style={{ width: '20px' }} src={MetamaskFox} />
                          </Button>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </Grid>

              <Grid item md={4}></Grid>

              <Grid item md={2} className="epoch">
                <p>Current Epoch</p>
                <h2 className="line">{Number(currentEpoch)}</h2>
                <p>Next Epoch in</p>
                <ProgressCountdown
                  base={moment().toDate()}
                  hideBar={true}
                  deadline={to}
                  description="Next Epoch"
                />{' '}
                <Divider className="line" />
                <div className="swap">
                  <p>
                    Live TWAP: <span className="green">{scalingFactor}</span>
                  </p>
                  <p>
                    TVL: <span className="green">${Number(TVL).toFixed(3)}</span>
                  </p>
                  <p>
                    Last Epoch TWAP: <span className="green">{scalingFactor}</span>
                  </p>
                </div>
              </Grid>
            </Grid>
          </Card>
        </Grid>
        <Grid item md={8}>
          <Grid container spacing={1}>
            <Grid item md={12} style={{ textAlign: 'right' }}>
              <a
                href="https://bombbshare.medium.com/the-bomb-cycle-how-to-print-forever-e89dc82c12e5"
                target="_blank"
                rel="noreferrer noopener"
                className="ris-link"
              >
                Read Investment Strategy
              </a>
            </Grid>
            <Grid item md={12}>
              <Button
                href="https://app.bogged.finance/bsc/swap?tokenIn=0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c&tokenOut=0x522348779DCb2911539e76A1042aA922F9C47Ee3"
                className="box-button"
              >
                Invest Now
              </Button>
            </Grid>

            <Grid container spacing={2}>
              <Grid item md={6}>
                <Button href="https://discord.bomb.money/" target="_blank" className="color-gray" disableElevation>
                  <IconDiscord
                    style={{
                      fill: 'blue',
                      height: '20px',
                    }}
                  />
                  Chat on Discord
                </Button>
              </Grid>
              <Grid item md={6}>
                <Button href="https://docs.bomb.money/" target="_blank" className="color-gray" disableElevation>
                  <img src="" alt="" />
                  Read Docs
                </Button>
              </Grid>
            </Grid>
          </Grid>

          <Card className="transparent-card">
            <Grid container>
              <Grid item md={1}>
                <TokenSymbol symbol="BSHARE" size={64} />
              </Grid>
              <Grid item md={8}>
                <h2>
                  Boardroom <span className="recommended">Recommended</span>
                </h2>
                <p>Stake BSHARE and earn BOMB every epoch</p>
              </Grid>
              <Grid item md={3}>
                TVL: ${TVL.toFixed(2)} {/*change later */}
              </Grid>
              <Grid item md={12}>
                <hr className="hr-line" />
              </Grid>
            </Grid>
            <br />

            <Grid container spacing={2}>
              <Grid item md={8}></Grid>
              <Grid item md={4}>
                Total Staked: <TokenSymbol symbol="BSHARE" size={26} />
                {getDisplayBalance(totalStaked)}
              </Grid>
              <Grid item md={2}>
                Daily Returns: <br /> {(boardroomAPR / 365).toFixed(2)}%
              </Grid>
              <Grid item md={2}>
                Your Stake:
                <br /> <TokenSymbol symbol="BSHARE" size={26} />
                {getDisplayBalance(stakedBalance)} <br /> ≈ ${tokenPriceInDollarsStake}
              </Grid>
              <Grid item md={2}>
                Earned: <br /> <TokenSymbol symbol="BOMB" size={26} />
                {getDisplayBalance(earnings)} <br /> ≈ ${earnedInDollars}
              </Grid>

              <Grid item md={6}>
                <Button className="round-button">{'Deposit'}</Button>
                <Button
                  disabled={stakedBalance.eq(0) || !canWithdraw}
                  onClick={onRedeem}
                  className={
                    stakedBalance.eq(0) || !canWithdraw
                      ? 'round-button disabled' // disbaled
                      : 'round-button' // enabled
                  }
                >
                  Withdraw
                </Button>
                <Button
                  onClick={onReward}
                  className={earnings.eq(0) || !canClaimReward ? 'round-button disabled' : 'round-button'}
                  disabled={earnings.eq(0) || !canClaimReward}
                >
                  Claim Rewards <TokenSymbol symbol="BSHARE" size={22} />
                </Button>
              </Grid>
            </Grid>
          </Card>
        </Grid>

        <Grid item md={4}>
          <Card className="transparent-card latest-news-box">
            <h2 className="latest-news">Latest News</h2>
          </Card>
        </Grid>
      </Grid>

      <Divider />

      {/* Bombfarm */}
      <Card className="transparent-card">
        <Grid container>
          <Grid item md={10}>
            <h3>Bomb Farms</h3>
            <p>Stake your LP tokens in our farms to start earning $BSHARE</p>
          </Grid>
          <Grid item md={2}>
            <Button className="round-button disabled" disabled>
              Claim All <TokenSymbol symbol="BSHARE" size={22} />
            </Button>
          </Grid>
        </Grid>

        {activeBanks
          .filter((bank) => bank.sectionInUI === 3)
          .map((bank) => (
            <React.Fragment key={bank.name}>
              <Pools bank={bank} />
            </React.Fragment>
          ))}
      </Card>

      {/* Bonds */}

      <Card className="transparent-card">
        <Grid container spacing={2}>
          <Grid item md={1}>
            <TokenSymbol symbol="BBOND" size={64}></TokenSymbol>
          </Grid>
          <Grid item md={11}>
            <h3>Bonds</h3>
            <p>BBOND can be purchased only on contraction periods, when TWAP of BOMB is below 1</p>
          </Grid>
          <Grid item md={3}>
            <p>Current Price: (Bomb)^2</p>

            <h3>BBond = {Number(bondStat?.tokenInFtm).toFixed(4) || '-'} BTCB</h3>
          </Grid>

          <Grid item md={3}>
            <p>Available to redeem:</p>

            <h3>
              <TokenSymbol symbol="BBOND" size={26}></TokenSymbol>
              {getDisplayBalance(bondsPurchasable, 18, 4)}
            </h3>
          </Grid>

          <Grid item md={6}>
            <Grid container>
              <Grid item md={6}>
                <div>Purchase BBond</div>
                <div>Bomb is over peg</div>
              </Grid>
              <Grid item md={6}>
                {!!account ? (
                  <>
                    {approveStatus !== ApprovalState.APPROVED ? (
                      <Button
                        className={
                          approveStatus === ApprovalState.PENDING || approveStatus === ApprovalState.UNKNOWN
                            ? 'round-button disabled'
                            : 'round-button'
                        }
                        disabled={approveStatus === ApprovalState.PENDING || approveStatus === ApprovalState.UNKNOWN}
                        onClick={() => catchError(approve(), `Unable to approve BOMB`)}
                      >
                        {`Approve BOMB`}
                      </Button>
                    ) : (
                      <Button className="round-button" onClick={onPresentPurchase}>
                        Purchase
                      </Button>
                    )}
                  </>
                ) : (
                  <UnlockWallet />
                )}
              </Grid>
              <Grid item md={12}>
                <hr className="hr-line"></hr>
              </Grid>
            </Grid>

            <Grid container>
              <Grid item md={6}>
                <div>Redeem Bomb</div>
              </Grid>
              <Grid item md={6}>
                {!!account ? (
                  <>
                    {approveStatus !== ApprovalState.APPROVED &&
                    !(!bondStat || bondBalance.eq(0) || !isBondRedeemable) ? (
                      <Button
                        className={
                          approveStatus === ApprovalState.PENDING || approveStatus === ApprovalState.UNKNOWN
                            ? 'round-button disabled'
                            : 'round-button'
                        }
                        disabled={approveStatus === ApprovalState.PENDING || approveStatus === ApprovalState.UNKNOWN}
                        onClick={() => catchError(approve(), `Unable to approve BBOND`)}
                      >
                        Approve BBOND
                      </Button>
                    ) : (
                      <Button
                        className={
                          !bondStat || bondBalance.eq(0) || !isBondRedeemable ? 'round-button disabled' : 'round-button'
                        }
                        onClick={onPresent}
                        disabled={!bondStat || bondBalance.eq(0) || !isBondRedeemable}
                      >
                        {!isBondRedeemable ? `Enabled when 10,000 BOMB > ${BOND_REDEEM_PRICE}BTC` : null || 'Reedem'}
                      </Button>
                    )}
                  </>
                ) : (
                  <UnlockWallet />
                )}
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Card>
    </Page>
  );
}

export default Dashboard;
