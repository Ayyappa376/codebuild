import { config } from '@root/config';

export function getBuildTableName(): string {
  return `${config.defaults.orgId}_${config.metricsTables.buildTable}`;
}

export function getRepoTableName(): string {
  return `${config.defaults.orgId}_${config.metricsTables.repoTable}`;
}

export function getReqTableName(): string {
  return `${config.defaults.orgId}_${config.metricsTables.reqTable}`;
}

export function getQualityTableName(): string {
  return `${config.defaults.orgId}_${config.metricsTables.qualityTable}`;
}
