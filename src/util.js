let
  mPow = Math.pow,
  mRound = Math.round,
  mFloor = Math.floor,
  mRandom = Math.random

export function getNiceTime(millis){
  let h, m, s, ms,
    seconds,
    timeAsString = '';

  seconds = millis/1000; // → millis to seconds
  h = mFloor(seconds / (60 * 60));
  m = mFloor((seconds % (60 * 60)) / 60);
  s = mFloor(seconds % (60));
  ms = mRound((seconds - (h * 3600) - (m * 60) - s) * 1000);

  timeAsString += h + ':';
  timeAsString += m < 10 ? '0' + m : m;
  timeAsString += ':';
  timeAsString += s < 10 ? '0' + s : s;
  timeAsString += ':';
  timeAsString += ms === 0 ? '000' : ms < 10 ? '00' + ms : ms < 100 ? '0' + ms : ms;

  //console.log(h, m, s, ms);
  return {
    hour: h,
    minute: m,
    second: s,
    millisecond: ms,
    timeAsString: timeAsString,
    timeAsArray: [h, m, s, ms]
  };
}