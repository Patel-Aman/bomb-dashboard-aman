import './Dashboard.css';

import React, { useMemo } from 'react';
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
import ProgressCountdown from '../Boardroom/components/ProgressCountdown';
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

const BackgroundImage = createGlobalStyle`
  body {
    background: url(${HomeImage}) repeat !important;
    background-size: cover !important;
    background-color: #171923;
  }
`;

const TITLE = 'bomb.money | Dashboard';

function Dashboard() {
  // const [banks] = useBanks();
  // const activeBanks = banks.filter((bank) => !bank.finished);
  // let pools = {};

  // for (let pool of activeBanks) {
  //   pools[pool.poolId] = pool;
  // }
  // console.log(pools);
  const [banks] = useBanks();

  const activeBanks = banks.filter((bank) => !bank.finished);
  const bombFinance = useBombFinance();
  const bombStats = useBombStats();
  const bShareStats = usebShareStats();
  const tBondStats = useBondStats();
  const TVL = useTotalValueLocked();
  const cashStat = useCashPriceInEstimatedTWAP();
  const bondStat = useBondStats();
  const bondsPurchasable = useBondsPurchasable();
  const totalStaked = useTotalStakedOnBoardroom();
  const earnings = useEarningsOnBoardroom();
  const stakedBalance = useStakedBalanceOnBoardroom();

  const { onReward } = useHarvestFromBoardroom();
  const { onRedeem } = useRedeemOnBoardroom();
  const canClaimReward = useClaimRewardCheck();
  const canWithdraw = useWithdrawCheck();

  // console.log(pools[1]);
  // const statsOnPool_BombBtcb = useStatsForPool(pools[1]);
  // console.log(statsOnPool_BombBtcb);
  // const redeem = useRedeem(pools[1]);
  // console.log('redeem' + redeem);

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
          <Card style={{ padding: '2vw', margin: '2vh' }}>
            <Box p={2} style={{ textAlign: 'center' }}>
              Bomb Finance Summary
            </Box>
            <Divider />

            <Grid container spacing={3}>
              <Grid item md={8}>
                <TableContainer>
                  <Table sx={{ minWidth: 650 }} aria-label="simple table">
                    <TableHead>
                      <TableRow>
                        <TableCell></TableCell>
                        <TableCell align="right">Current Supply</TableCell>
                        <TableCell align="right">Total Supply</TableCell>
                        <TableCell align="right">Price</TableCell>
                        <TableCell align="right"></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      <TableRow>
                        <TableCell component="th" scope="row">
                          <TokenSymbol symbol="BOMB" style={{ height: '20px', width: '20px' }} />
                          <span>BOMB</span>
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
                      <TableRow>
                        <TableCell component="th" scope="row">
                          <TokenSymbol symbol="BSHARE" />
                          <span>BSHARE</span>
                        </TableCell>
                        <TableCell align="right">{roundAndFormatNumber(bShareCirculatingSupply, 2)}</TableCell>
                        <TableCell align="right">{roundAndFormatNumber(bShareTotalSupply, 2)}</TableCell>
                        <TableCell align="right">
                          ${bSharePriceInDollars ? bSharePriceInDollars : '-.--'} <br />
                          {bSharePriceInBNB ? bSharePriceInBNB : '-.----'}
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

                      <TableRow>
                        <TableCell component="th" scope="row">
                          <TokenSymbol symbol="BBOND" style={{ height: '20px', width: '20px' }} />
                          <span>BBOND</span>
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

              <Grid item md={4}>
                <p>Current Epoch</p>
                <h2>{Number(currentEpoch)}</h2>
                <Divider />
                <p>Next Epoch in</p>
                <Card className="align-left">
                  <ProgressCountdown base={moment().toDate()} hideBar={true} deadline={to} description="Next Epoch" />
                </Card>
                <Divider />

                <div className="swap">
                  <p>
                    Live TWAP: <span style={{ color: 'green' }}>{scalingFactor}</span>
                  </p>
                  <p>
                    TVL: <span style={{ color: 'green' }}>${Number(TVL).toFixed(3)}</span>
                  </p>
                  <p>
                    Last Epoch TWAP: <span style={{ color: 'green' }}>1.22</span>
                  </p>
                </div>
              </Grid>
            </Grid>
          </Card>
        </Grid>
        <Grid item md={8}>
          <a
            href="https://bombbshare.medium.com/the-bomb-cycle-how-to-print-forever-e89dc82c12e5"
            target="_blank"
            rel="noreferrer noopener"
          >
            Read Investment Strategy
          </a>
          <Button
            style={{ marginLeft: '10px', marginBottom: '5px' }}
            variant="contained"
            href="https://app.bogged.finance/bsc/swap?tokenIn=0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c&tokenOut=0x522348779DCb2911539e76A1042aA922F9C47Ee3"
          >
            Invest Now
          </Button>

          <Grid container spacing={2}>
            <Grid item md={6}>
              <Button
                style={{ marginLeft: '10px', width: '90%' }}
                variant="contained"
                href="https://discord.bomb.money/"
                target="_blank"
                disableElevation
              >
                <IconDiscord
                  style={{
                    fill: 'blue',
                    height: '20px',
                    backgroundColor: 'rgba(255, 255, 255, 0.5)',
                  }}
                />
                Chat on Discord
              </Button>
            </Grid>
            <Grid item md={6}>
              <Button
                style={{ marginLeft: '10px', width: '90%' }}
                variant="contained"
                href="https://docs.bomb.money/"
                target="_blank"
                disableElevation
              >
                <img src="" alt="" />
                Read Docs
              </Button>
            </Grid>
          </Grid>
          <Card style={{ padding: '2vw', margin: '2vh' }}>
            <img src="" alt="" />
            <Grid container spacing={3}>
              <Grid item md={8}>
                <h2>
                  Boardroom <span className="recommended">Recommended</span>
                </h2>

                <p>Stake BSHARE and earn BOMB every epoch</p>
              </Grid>
              <Grid item md={4}>
                TVL: $1,008,430
              </Grid>
              <Divider />
            </Grid>

            <Box style={{ textAlign: 'end' }}>
              Total Staked: <img src="" alt="" /> {getDisplayBalance(totalStaked)}
            </Box>

            <Grid container spacing={2}>
              <Grid item md={2}>
                Daily Returns: 2%
              </Grid>
              <Grid item md={2}>
                Your Stake: {`${getDisplayBalance(stakedBalance)} ≈ ${tokenPriceInDollarsStake}`}
              </Grid>
              <Grid item md={2}>
                Earned: {`${getDisplayBalance(earnings)} ≈ ${earnedInDollars}`}
              </Grid>

              <Grid item md={6}>
                <Button variant="contained" style={{ marginLeft: '10px', marginBottom: '5px' }}>
                  {'Deposit >>>'}
                </Button>
                <Button
                  disabled={stakedBalance.eq(0) || !canWithdraw}
                  onClick={onRedeem}
                  className={
                    stakedBalance.eq(0) || !canWithdraw ? 'shinyButtonDisabledSecondary' : 'shinyButtonSecondary'
                  }
                >
                  Withdraw
                </Button>
                <Button
                  onClick={onReward}
                  className={earnings.eq(0) || !canClaimReward ? 'shinyButtonDisabled' : 'shinyButton'}
                  disabled={earnings.eq(0) || !canClaimReward}
                >
                  Claim Reward
                </Button>
              </Grid>
            </Grid>
          </Card>
        </Grid>

        <Grid item md={4}>
          <Card style={{ padding: '2vw', margin: '2vh', height: '70%' }}>
            <h2>Latest News</h2>
          </Card>
        </Grid>
      </Grid>

      <Divider />

      {/* Bombfarm */}
      <Card style={{ padding: '2vw', margin: '2vh' }}>
        <h3>Bomb Farms</h3>
        <p>Stake your LP tokens in our farms to start earning $BSHARE</p>

        <Button variant="contained">Claim All</Button>

        {activeBanks
          .filter((bank) => bank.sectionInUI === 3)
          .map((bank) => (
            <React.Fragment key={bank.name}>
              <Pools bank={bank} />
            </React.Fragment>
          ))}
      </Card>

      {/* Bonds */}

      <Card style={{ padding: '2vw', margin: '2vh' }}>
        <img src="" alt="" />
        <h3>Bonds</h3>
        <p>BBOND can be purchased only on contraction periods, when TWAP of BOMB is below 1</p>

        <Grid container spacing={2}>
          <Grid item md={3}>
            <p>Current Price: (Bomb)^2</p>

            <h3>BBond = {Number(bondStat?.tokenInFtm).toFixed(4) || '-'} BTCB</h3>
          </Grid>

          <Grid item md={3}>
            <p>Available to redeem:</p>

            <h3>
              <img src="" alt="" /> {getDisplayBalance(bondsPurchasable, 18, 4)}
            </h3>
          </Grid>

          <Grid item md={6}>
            <Grid container>
              <Grid item md={12}>
                <div>Purchase BBond Bomb is over peg</div>
              </Grid>
              <Grid item md={12}>
                <Button>
                  Purchase <img src="" alt="" />
                </Button>
              </Grid>
            </Grid>

            <Divider />
            <Grid container>
              <Grid item md={12}>
                <div>Redeem Bomb</div>
              </Grid>
              <Grid item md={12}>
                <Button>
                  Redeem <img src="" alt="" />
                </Button>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Card>
    </Page>
  );
}

export default Dashboard;
