export function durationOverlapTime(
  startPeakTime: string,
  endPeakTime: string,
  startTime: string,
  endTime: string,
) {
  const peakStart =
    new Date(`1970-01-01T${startPeakTime}Z`).valueOf() / (1000 * 60 * 60);
  const peakEnd =
    new Date(`1970-01-01T${endPeakTime}Z`).valueOf() / (1000 * 60 * 60);
  const start =
    new Date(`1970-01-01T${startTime}Z`).valueOf() / (1000 * 60 * 60);
  const end = new Date(`1970-01-01T${endTime}Z`).valueOf() / (1000 * 60 * 60);

  const overlapStart = Math.max(start, peakStart);

  const overlapEnd = Math.min(end, peakEnd);

  return overlapStart < overlapEnd ? overlapEnd - overlapStart : 0;
}
