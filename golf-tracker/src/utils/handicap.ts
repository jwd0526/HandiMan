import { Round } from "shared";

export const calculateHandicap = (rounds: Round[]) => {
  if (rounds.length < 3) return 0;

  // Get the last 20 rounds
  const recentRounds = [...rounds]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 20);
  console.log(recentRounds);
  // Extract and sort differentials
  const difs = recentRounds
    .map((round) => round.differential)
    .sort((a, b) => a - b);

  console.log(difs);

  // Calculate handicap based on number of rounds
  switch (difs.length) {
    case 3:
      return Math.round((difs[0] - 2) * 10) / 10;
    case 4:
      return Math.round((difs[0] - 1) * 10) / 10;
    case 5:
      return Math.round(difs[0] * 10) / 10;
    case 6:
      return Math.round(((difs[0] + difs[1]) / 2 - 1) * 10) / 10;
    case 7:
    case 8:
      return Math.round(((difs[0] + difs[1]) / 2) * 10) / 10;
    case 9:
    case 10:
    case 11:
      return Math.round(((difs[0] + difs[1] + difs[2]) / 3) * 10) / 10;
    case 12:
    case 13:
    case 14:
      return (
        Math.round((difs.slice(0, 4).reduce((a, b) => a + b, 0) / 4) * 10) / 10
      );
    case 15:
    case 16:
      return (
        Math.round((difs.slice(0, 5).reduce((a, b) => a + b, 0) / 5) * 10) / 10
      );
    case 17:
    case 18:
      return (
        Math.round((difs.slice(0, 6).reduce((a, b) => a + b, 0) / 6) * 10) / 10
      );
    case 19:
      return (
        Math.round((difs.slice(0, 7).reduce((a, b) => a + b, 0) / 7) * 10) / 10
      );
    case 20:
      return (
        Math.round((difs.slice(0, 8).reduce((a, b) => a + b, 0) / 8) * 10) / 10
      );
    default:
      return 0;
  }
};