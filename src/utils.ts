export function sum(values: number[]): number {
  return values.reduce((r, v) => r + v, 0);
}
export function avg(values: number[]): number {
  return sum(values) / values.length;
}

export function fullhours(timeSeconds: number) {
  return Math.floor(timeSeconds / 3600);
}

export function fullminutes(timeSeconds: number) {
  return Math.floor((timeSeconds % 3600) / 60);
}
export function justseconds(timeSeconds: number) {
  return Math.floor(timeSeconds % 60);
}

export function niceTime(timeSeconds: number) {
  if (isNaN(timeSeconds)) {
    return '-';
  }
  if (timeSeconds > 3600) {
    return `${fullhours(timeSeconds)}:${fullminutes(timeSeconds)}:${justseconds(timeSeconds)}`
  } else {
    return `${fullminutes(timeSeconds)}:${justseconds(timeSeconds)}`
  }
}

export function niceDate(timestampOrDate: Date|number) {
  const date = new Date(timestampOrDate);
  return date.toISOString().replace('T', ' ').substr(0, 19);
}