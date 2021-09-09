import { API, Handler } from '@apis/index';
import { BuildGraphDataItem, BuildListDataItem } from '@models/index';
import {
  appLogger,
  getBuildGraphData,
  getBuildListData,
  responseBuilder,
} from '@utils/index';
import { Response } from 'express';

interface BuildsDataRequest {
  headers: {
    user: {
      'cognito:groups': string[];
      'cognito:username': string;
      email: string;
    };
  };
  params: {
    type: string;
  };
  query: {
    fromDate?: string;
    teamId?: string;
    toDate?: string;
  };
}

async function handler(
  request: BuildsDataRequest,
  response: Response
): Promise<any> {
  appLogger.info('API handler: BuildsDataRequest GET');

  const { headers, params, query } = request;
  const cognitoUserId = headers.user['cognito:username'];

  if (!cognitoUserId) {
    const err = new Error('Unauthorized');
    appLogger.error(err);
    return responseBuilder.unauthorized(err, response);
  }

  try {
    const data = {
      fromDate: new Date(),
      toDate: new Date(), //default is today
    };
    data.fromDate.setDate(data.fromDate.getDate() - 1); //default is yesterday

    if (query.teamId) {
      const key: string = 'teamIds';
      data[key] = query.teamId.split(',');
    }
    if (query.fromDate) {
      const key: string = 'fromDate';
      data[key] = new Date(parseInt(query.fromDate, 10));
    }
    if (query.toDate) {
      const key: string = 'toDate';
      data[key] = new Date(parseInt(query.toDate, 10));
    }

    if (params.type === 'graph') {
      const result: BuildGraphDataItem[] = await getBuildGraphData(data);
      appLogger.debug({ result });
      return responseBuilder.ok(result, response);
    }
    if (params.type === 'list') {
      const result: BuildListDataItem[] = await getBuildListData(data);
      appLogger.debug({ result });
      return responseBuilder.ok(result, response);
    }
    const err = new Error('Invalid Request');
    appLogger.error(err);
    return responseBuilder.badRequest(err, response);
  } catch (err) {
    appLogger.error(err);
    return responseBuilder.internalServerError(err, response);
  }
}

export const api: API = {
  handler: <Handler>(<unknown>handler),
  method: 'get',
  route: '/api/metrics/builds/:type',
};
