import { API, Handler } from '@apis/index';
import { AssessmentQuestion, Questionnaire, UserDocument } from '@models/index';
import { config } from '@root/config';
import {
  appLogger,
  AssessmentDocument,
  getAssessmentHistory,
  //  getLatestAssessment,
  getPerformanceMetricsConstant,
  getQuestionCategoryFromQuestionnaire,
  getQuestionDetails,
  getQuestionnaireId,
  getResultLevels,
  getTeamIds,
  getTeamIdsByQuestionnaire,
  getTeamMembers,
//  getTeamsMappedToQuestionnaire,
  getUserAllAssessment,
  getUserDocument,
  responseBuilder,
} from '@utils/index';
import { Response } from 'express';
import { writeFileSync } from 'fs';
import { getResponseBody, HistoryAcknowledgement } from './getResponseBody';

interface HistoryRequest {
  headers: {
    user: {
      'cognito:groups': string[];
      'cognito:username': string;
      email: string;
    };
  };
  query: {
    after: string;
    limit: string;
    page: string;
    questionnaireId: string;
    questionnaireVersion: string;
    type: string;
  };
}

async function handler(
  request: HistoryRequest,
  response: Response
): Promise<any> {
  appLogger.info({ HistoryRequest: request }, 'Inside Handler');

  const { headers, query } = request;
  if (!headers.user) {
    const err = new Error('InvalidUser');
    appLogger.error(err, 'Unauthorized');
    return responseBuilder.unauthorized(err, response);
  }
  const {
    user: { email: userId, 'cognito:username': cognitoUserId },
  } = headers;
  const { type, questionnaireId, questionnaireVersion } = query;
  const weightageCoefficient = config.defaults.scoreCoeff;
  const performanceMetricsConstant = await getPerformanceMetricsConstant();

  try {
    if (type === 'team') {
      const teamsManagedByUser: string[] = await getTeamIds(
        headers.user['cognito:groups'][0] === 'Admin'
          ? 'admin'
          : headers.user.email
      );
      appLogger.info({ getTeamIds: teamsManagedByUser });
      if (teamsManagedByUser.length === 0) {
        const noTeamsManaged: HistoryAcknowledgement = <
          HistoryAcknowledgement
        >{};
        return responseBuilder.ok(noTeamsManaged, response);
      }
      let totalAssessment = [];
      const assessmentHistoryAllTeams: {
        [key: string]: HistoryAcknowledgement;
      } = {};

      for (const teamManagedByUser of teamsManagedByUser) {
        totalAssessment =
          questionnaireId && questionnaireVersion
            ? await getAssessmentHistory({
                questionnaireId,
                questionnaireVersion,
                team: teamManagedByUser,
                type: 'qid_team',
                userId,
              })
            : await getAssessmentHistory({
                team: teamManagedByUser,
                type: 'team_name',
                userId,
              });

        appLogger.info({ getAssessmentHistory: totalAssessment });
        if (totalAssessment.length === 0) {
          continue;
        }
        //        const latestAssessments = await getLatestAssessment(totalAssessment);
        //        appLogger.info({ getLatestAssessment: latestAssessments });
        assessmentHistoryAllTeams[teamManagedByUser] = getResponseBody(
          //          latestAssessments
          totalAssessment
        );
      }

      const userLevels = await getResultLevels();
      appLogger.info({ getResultConfig: userLevels });

      if (questionnaireId) {
        const questionnaireDetails: Questionnaire = await getQuestionnaireId(
          questionnaireId,
          questionnaireVersion
        );
        appLogger.info({ getQuestionnaireId: questionnaireDetails });
        //TODO: list of teams are not proper, use the teams managed by the logged in user.
//        const teamsMappedToQuestionnaire = await getTeamsMappedToQuestionnaire(
//          questionnaireId
//        );
        const questions: string[] = questionnaireDetails.questions;
        const categoryQues = {};
        const questionsDetails = {};
        for (const questionId of questions) {
          const quesDetails: AssessmentQuestion = await getQuestionDetails(
            questionId
          );
          appLogger.info({ getQuestionDetails: quesDetails });
          const questionCategory = await getQuestionCategoryFromQuestionnaire(
            questionId,
            questionnaireId,
            questionnaireVersion
          );
          quesDetails.category = questionCategory;
          questionsDetails[questionId] = quesDetails;
          if (categoryQues[questionCategory]) {
            categoryQues[questionCategory] += 1;
          } else {
            categoryQues[questionCategory] = 1;
          }
        }
        appLogger.info({
          assessmentHistoryAllTeams,
          categoryQues,
          questionsDetails,
          userLevels,
        });
        return responseBuilder.ok(
          {
            categoryList: categoryQues,
//            mappedTeams: teamsMappedToQuestionnaire,
            mappedTeams: teamsManagedByUser,
            performanceMetricsConstant,
            questionsDetails,
            teams: assessmentHistoryAllTeams,
            userLevels,
            weightageCoefficient,
          },
          response
        );
      }

      return responseBuilder.ok(
        {
          teams: assessmentHistoryAllTeams,
          userLevels
        },
        response
      );
    }

    if (type === 'manager') {
      const userDocument: UserDocument = await getUserDocument({
        cognitoUserId,
      });
      appLogger.info({ getUserDocument: userDocument });
      const managees: string[] = [];
      managees.push(userId);
      const manageeAssessmentHistory: AssessmentDocument[] = await getAssessmentHistory(
        { userId, type, teamMembers: managees }
      );
      appLogger.info({ getAssessmentHistory: manageeAssessmentHistory });
      return responseBuilder.ok(
        getResponseBody(manageeAssessmentHistory),
        response
      );
    }

    const assessmentHistory: AssessmentDocument[] = await getUserAllAssessment({
      userId,
    });
    appLogger.info({ getUserAllAssessment: assessmentHistory });
    const acknowledgement: HistoryAcknowledgement = getResponseBody(
      assessmentHistory
    );
    return responseBuilder.ok(acknowledgement, response);
  } catch (err) {
    const noTeamsManaged: HistoryAcknowledgement = <HistoryAcknowledgement>{};
    return responseBuilder.ok(noTeamsManaged, response);
  }
}

export const api: API = {
  handler: <Handler>(<unknown>handler),
  method: 'get',
  route: '/api/v2/assessment/history',
};

/* tslint:disable */
export const dataDump = async (x: any, y: any) => {
  const questionnaireDetails: Questionnaire = await getQuestionnaireId(y);
  const myResult: any[] = new Array();
  const questionNAnswers: any = {};
  const userList: any = {};
  const weightageCoefficient = config.defaults.scoreCoeff;
  for (const questionId of questionnaireDetails.questions) {
    const quesDetails = await getQuestionDetails(questionId);
    questionNAnswers[questionId] = quesDetails;
  }
  const teamlist: string[] = await getTeamIdsByQuestionnaire(y);

  for (const teamName of teamlist) {
    const teamMembersForTeam: string[] = await getTeamMembers(teamName);
    teamMembersForTeam.forEach((v: any) => {
      userList[v] = teamName;
    });
  }

  const teamMembersForATeam: string[] = await getTeamMembers('Other');
  const assessmentHistory: AssessmentDocument[] = await getAssessmentHistory({
    userId: x,
    type: 'all_teams',
    teamMembers: teamMembersForATeam,
    questionnaireId: y,
  });
  for (const val of assessmentHistory) {
    if (val.assessmentDetails) {
      const list: any[] = Object.keys(val.assessmentDetails);
      let maxAnswersCount = 0;
      list.forEach((quesId: string) => {
        if (questionNAnswers[quesId]) {
          const numberOfAnswers = Object.keys(questionNAnswers[quesId].answers)
            .length;
          if (numberOfAnswers > maxAnswersCount) {
            maxAnswersCount = numberOfAnswers;
          }
        }
      });
      for (const quesId of list) {
        const selection: string = val.assessmentDetails
          ? val.assessmentDetails[quesId].answers[0]
          : '@N/A';
        const data = {
          assessmentName: val.assessmentName,
          date: val.date,
          team: userList[val.userId],
          user: val.userId,
        };
        if (questionNAnswers[quesId]) {
          data['question'] = questionNAnswers[quesId].question;
          data['answerSelected'] = questionNAnswers[quesId].answers[selection]
            ? questionNAnswers[quesId].answers[selection].answer
            : '';
          data['answer-Weightage'] = questionNAnswers[quesId].answers[selection]
            ? questionNAnswers[quesId].answers[selection].weightageFactor *
              weightageCoefficient
            : '';
          Object.keys(questionNAnswers[quesId].answers).forEach(
            (aid: string, i: number) => {
              data[`Option${i}`] = questionNAnswers[quesId].answers[aid]
                ? questionNAnswers[quesId].answers[aid].answer
                : '';
              data[`Option${i}-Weightage`] = questionNAnswers[quesId].answers[
                aid
              ]
                ? questionNAnswers[quesId].answers[aid].weightageFactor *
                  weightageCoefficient
                : '';
            }
          );
          const numberOfAnswers = Object.keys(questionNAnswers[quesId].answers)
            .length;
          if (numberOfAnswers < maxAnswersCount) {
            for (let i = numberOfAnswers; i < maxAnswersCount; i += 1) {
              data[`Option${i}`] = '';
              data[`Option${i}-Weightage`] = '';
            }
          }
        } else {
          const quesDetails = await getQuestionDetails(quesId);
          data['question'] = quesDetails.question;
          data['answerSelected'] = quesDetails.answers[selection]
            ? quesDetails.answers[selection].answer
            : '';
          data['answer-Weightage'] = quesDetails.answers[selection]
            ? quesDetails.answers[selection].weightageFactor *
              weightageCoefficient
            : '';
          Object.keys(quesDetails.answers).forEach((aid: string, i: number) => {
            data[`Option${i}`] = quesDetails.answers[aid]
              ? quesDetails.answers[aid].answer
              : '';
            data[`Option${i}-Weightage`] = quesDetails.answers[aid]
              ? quesDetails.answers[aid].weightageFactor * weightageCoefficient
              : '';
          });
          const numberOfAnswers = Object.keys(questionNAnswers[quesId].answers)
            .length;
          if (numberOfAnswers < maxAnswersCount) {
            for (let i = numberOfAnswers; i < maxAnswersCount; i += 1) {
              data[`Option${i}`] = '';
              data[`Option${i}-Weightage`] = '';
            }
          }
        }
        myResult.push(data);
      }
    }
  }
  const json2xls = require('json2xls');
  const xls = json2xls(myResult);
  writeFileSync(`${y}-result.xlsx`, xls, 'binary');
};
