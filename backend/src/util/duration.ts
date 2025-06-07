export function duration(time1: string, time2: string) {
  return Math.abs(
    (new Date(`1970-01-01T${time1}Z`).valueOf() -
      new Date(`1970-01-01T${time2}Z`).valueOf()) /
      (1000 * 60 * 60),
  );
}
