import React from 'react';
import Countdown, { CountdownRenderProps } from 'react-countdown';

interface ProgressCountdownProps {
  base: Date;
  deadline: Date;
  hideBar?: boolean;
  description: string;
}

const ProgressCountdown: React.FC<ProgressCountdownProps> = ({ base, deadline, hideBar, description }) => {
  const countdownRenderer = (countdownProps: CountdownRenderProps) => {
    const { days, hours, minutes, seconds } = countdownProps;
    const h = String(days * 24 + hours);
    const m = String(minutes);
    const s = String(seconds);
    return (
      <>
        {h.padStart(2, '0')}:{m.padStart(2, '0')}:{s.padStart(2, '0')}
      </>
    );
  };
  return (
    <>
      <Countdown className="" key={new Date().getTime()} date={deadline} renderer={countdownRenderer} />
    </>
  );
};

export default ProgressCountdown;
