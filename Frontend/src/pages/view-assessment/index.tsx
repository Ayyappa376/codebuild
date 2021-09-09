// tslint:disable: all

import React, { useEffect, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import { Redirect } from 'react-router-dom';
import {
  useActions,
  setSelectedAssessmentType,
  setAppBarLeftText,
  setAppBarCenterText,
  saveUserTeam,
} from '../../actions';
import { useSelector } from 'react-redux';
import { IRootState } from '../../reducers';
import { Typography, Tooltip, TableSortLabel } from '@material-ui/core';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import { fetchAssessmentHistory } from '../../actions';
import 'react-circular-progressbar/dist/styles.css';
import { Loader } from '../../components';
import { IAssessmentListItem } from '../../model';
import { default as MaterialLink } from '@material-ui/core/Link';
// import { orderBy } from 'lodash';
import { getDateTime } from '../../utils/data';
import Title from '../../components/admin/dashboard/common/title';
import { Text } from '../../common/Language';

const useStyles = makeStyles((theme) => ({
  containerRoot: {
    display: 'flex',
    position: 'relative',
    flexDirection: 'column',
    alignItems: 'center',
    width: '100%',
    top: '120px',
    paddingBottom: theme.spacing(4),
  },
  table: {
    minWidth: 650,
    fontSize: '16px',
  },
  tableHead: {
    backgroundColor: '#3CB1DC',
  },
  tableHeadText: {
    color: '#FFFFFF',
  },
  tableHeadCell: {
    borderRadius: '0px',
  },
  tableBodyText: {
    color: '#808080',
  },
  root: {
    width: '100%',
    marginTop: theme.spacing(3),
    overflowX: 'auto',
    border: '18px',
  },
  firstColumn: {
    maxWidth: '200px',
    overflow: 'hidden',
  },
  sortLabelIcon: {
    opacity: 0.3,
    color: 'white',
  },
  title: {
    minWidth: '100%',
    fontSize: '15px',
  },
}));

function ViewAssessment(props: any) {
  const classes = useStyles();
  const fetchUserAssessmentHistory = useActions(fetchAssessmentHistory);
  const assessmentHistory = useSelector(
    (state: IRootState) => state.assesment.assessmentHistory
  );
  // const assessmentTypes = useSelector(
  //   (state: IRootState) => state.assesment.assessmentType
  // );
  const setAssessmentType = useActions(setSelectedAssessmentType);
  const setDisplayTextLeft = useActions(setAppBarLeftText);
  const setDisplayTextCenter = useActions(setAppBarCenterText);
  const [assessmentArray, setAssessmentArray] = useState<IAssessmentListItem[]>(
    []
  );
  const setUserTeam = useActions(saveUserTeam);
  /* Order related changes */
  const [order, setOrder] = useState<'asc' | 'desc'>('desc');
  const [orderBy, setOrderBy] = useState('date');
  /* Initialization Order related variables ends here */

  useEffect(() => {
    setDisplayTextCenter('');
    setDisplayTextLeft('');
    fetchUserAssessmentHistory();
  }, []);

  useEffect(() => {
    if (assessmentArray !== []) {
      let tempSortedAssessmentArray = [...assessmentArray];
      if (order === 'asc') {
        if (orderBy === 'name') {
          setAssessmentArray(tempSortedAssessmentArray.sort(compareName));
        }
        if (orderBy === 'date') {
          setAssessmentArray(tempSortedAssessmentArray.sort(compareDate));
        }
        if (orderBy === 'team') {
          setAssessmentArray(tempSortedAssessmentArray.sort(compareTeam));
        }
        if (orderBy === 'score') {
          setAssessmentArray(tempSortedAssessmentArray.sort(compareScore));
        }
      }
      if (order === 'desc') {
        if (orderBy === 'name') {
          setAssessmentArray(tempSortedAssessmentArray.sort(compareNameD));
        }
        if (orderBy === 'date') {
          setAssessmentArray(tempSortedAssessmentArray.sort(compareDateD));
        }
        if (orderBy === 'team') {
          setAssessmentArray(tempSortedAssessmentArray.sort(compareTeamD));
        }
        if (orderBy === 'score') {
          setAssessmentArray(tempSortedAssessmentArray.sort(compareScoreD));
        }
      }
    }
  }, [order, orderBy]);

  useEffect(() => {
    if (assessmentHistory.data && assessmentHistory.data.assessments) {
      const tempAssessmentsArray = assessmentHistory.data.assessments;

      const tempAssessmentArray: IAssessmentListItem[] = Object.keys(
        tempAssessmentsArray
      ).reduce((acc: IAssessmentListItem[], id) => {
        return acc.concat(tempAssessmentsArray[id]);
      }, []);

      /* Sorting the array in descending order of the date */
      setAssessmentArray(tempAssessmentArray.sort(compareDateD));
    }
  }, [assessmentHistory.data]);

  function compareName(a: any, b: any) {
    if (a.assessmentName < b.assessmentName) {
      return -1;
    }
    if (a.assessmentName > b.assessmentName) {
      return 1;
    }
    return 0;
  }

  function compareDate(a: any, b: any) {
    if (!a.dateSubmit) {
      if (!b.dateSubmit) {
        return a.date < b.date ? -1 : 1;
      } else {
        return a.date < b.dateSubmit ? -1 : 1;
      }
    }
    if (!b.dateSubmit) {
      if (!a.dateSubmit) {
        return a.date < b.date ? -1 : 1;
      } else {
        return a.dateSubmit < b.date ? -1 : 1;
      }
    }
    if (a.dateSubmit < b.dateSubmit) {
      return -1;
    }
    if (a.dateSubmit > b.dateSubmit) {
      return 1;
    }
    return 0;
  }

  function compareTeam(a: any, b: any) {
    if (a.team < b.team) {
      return -1;
    }
    if (a.team > b.team) {
      return 1;
    }
    return 0;
  }

  function compareScore(a: any, b: any) {
    if (!a.result) {
      return -1;
    }
    if (!b.result) {
      return 1;
    }
    if (a.result!.percentage < b.result!.percentage) {
      return -1;
    }
    if (a.result!.percentage > b.result!.percentage) {
      return 1;
    }
    return 0;
  }

  function compareNameD(a: any, b: any) {
    if (a.assessmentName < b.assessmentName) {
      return 1;
    }
    if (a.assessmentName > b.assessmentName) {
      return -1;
    }
    return 0;
  }

  function compareDateD(a: any, b: any) {
    if (!a.dateSubmit) {
      if (!b.dateSubmit) {
        return a.date < b.date ? 1 : -1;
      } else {
        return a.date < b.dateSubmit ? 1 : -1;
      }
    }
    if (!b.dateSubmit) {
      if (!a.dateSubmit) {
        return a.date < b.date ? 1 : -1;
      } else {
        return a.dateSubmit < b.date ? 1 : -1;
      }
    }
    if (a.dateSubmit < b.dateSubmit) {
      return 1;
    }
    if (a.dateSubmit > b.dateSubmit) {
      return -1;
    }
    return 0;
  }

  function compareTeamD(a: any, b: any) {
    if (a.team < b.team) {
      return 1;
    }
    if (a.team > b.team) {
      return -1;
    }
    return 0;
  }

  function compareScoreD(a: any, b: any) {
    if (!a.result) {
      return 1;
    }
    if (!b.result) {
      return -1;
    }
    if (a.result!.percentage < b.result!.percentage) {
      return 1;
    }
    if (a.result!.percentage > b.result!.percentage) {
      return -1;
    }
    return 0;
  }

  if (assessmentHistory.status === 'start') {
    // setAssessmentHistory(true)
    return (
      <Container
        maxWidth='md'
        component='div'
        classes={{
          root: classes.containerRoot,
        }}
      >
        <Loader />
      </Container>
    );
  }

  const redirectToContinueAssessment = (
    questionnaireId: string,
    version: string
  ) => {
    setAssessmentType({ questionnaireId, version });
    props.history.push(`/assessment`);
  };

  const getLink = (row: any) => {
    return row.result ? (
      <MaterialLink
        href='#'
        onClick={() => {
          setDisplayTextLeft(row.assessmentName);
          setDisplayTextCenter(`Team: ${row.team}`);
          setUserTeam(row.team);
          props.history.push({
            pathname: `/assessment/detail/${row.assessmentId}`,
            state: { prevPath: props.location.pathname },
          });
        }}
      >
        <Typography>
          <Text tid='viewAssessment' />
        </Typography>
      </MaterialLink>
    ) : (
      <MaterialLink
        href='#'
        onClick={() => {
          setDisplayTextLeft(row.assessmentName);
          setDisplayTextCenter(`Team: ${row.team}`);
          setUserTeam(row.team);
          redirectToContinueAssessment(row.type, row.questionnaireVersion);
        }}
      >
        <Typography>
          <Text tid='continueAssessment' />
        </Typography>
      </MaterialLink>
    );
  };

  if (assessmentHistory.status === 'fail') {
    let error = JSON.stringify(assessmentHistory!.error);
    let object = JSON.parse(error);
    if (object.code) {
      if (object.code === 401) {
        return <Redirect to='/relogin' />;
      }
    }
    return <Redirect to='/error' />;
  }

  const handleRequestSort = (property: string) => {
    if (orderBy === property) {
      setOrder(order === 'asc' ? 'desc' : 'asc');
    } else {
      setOrder('asc');
      setOrderBy(property);
    }
  };

  if (
    assessmentHistory.status === 'success' &&
    assessmentHistory.data !== null
  ) {
    if (Object.keys(assessmentHistory.data.assessments).length === 0) {
      return (
        <Container
          maxWidth='md'
          component='div'
          classes={{
            root: classes.containerRoot,
          }}
        >
          <Typography component='h3'>
            <Text tid='notGivenAssessmentYet' />
          </Typography>
        </Container>
      );
    }

    return (
      <Container
        maxWidth='md'
        component='div'
        classes={{
          root: classes.containerRoot,
        }}
      >
        <div className={classes.title}>
          <Title>
            <Text tid='myAssessments' />:
          </Title>
        </div>
        <Paper className={classes.root}>
          <Table className={classes.table}>
            <TableHead className={classes.tableHead}>
              <TableRow>
                <TableCell className={classes.tableHeadCell}>
                  <TableSortLabel
                    classes={{
                      icon: classes.sortLabelIcon,
                    }}
                    active={orderBy === 'team'}
                    direction={orderBy === 'team' ? order : 'asc'}
                    onClick={() => {
                      handleRequestSort('team');
                    }}
                  >
                    <Typography className={classes.tableHeadText}>
                      <Text tid='team' />
                    </Typography>
                  </TableSortLabel>
                </TableCell>
                <TableCell align='center' className={classes.tableHeadCell}>
                  <TableSortLabel
                    classes={{
                      icon: classes.sortLabelIcon,
                    }}
                    active={orderBy === 'name'}
                    direction={orderBy === 'name' ? order : 'asc'}
                    onClick={() => {
                      handleRequestSort('name');
                    }}
                  >
                    <Typography className={classes.tableHeadText}>
                      <Text tid='assessment' />
                    </Typography>
                  </TableSortLabel>
                </TableCell>
                <TableCell align='center' className={classes.tableHeadCell}>
                  <TableSortLabel
                    classes={{
                      icon: classes.sortLabelIcon,
                    }}
                    active={orderBy === 'date'}
                    direction={orderBy === 'date' ? order : 'asc'}
                    onClick={() => {
                      handleRequestSort('date');
                    }}
                  >
                    <Typography className={classes.tableHeadText}>
                      <Text tid='dateSubmitted' />
                    </Typography>
                  </TableSortLabel>
                </TableCell>
                <TableCell align='center' className={classes.tableHeadCell}>
                  <TableSortLabel
                    classes={{
                      icon: classes.sortLabelIcon,
                    }}
                    active={orderBy === 'score'}
                    direction={orderBy === 'score' ? order : 'asc'}
                    onClick={() => {
                      handleRequestSort('score');
                    }}
                  >
                    <Typography className={classes.tableHeadText}>
                      <Text tid='score' />
                    </Typography>
                  </TableSortLabel>
                </TableCell>
                <TableCell align='center' className={classes.tableHeadCell}>
                  {/* <TableSortLabel
                                            classes = {{
                                                icon: classes.sortLabelIcon
                                            }}
                                            active={orderBy === 'level'}
                                            direction={orderBy === 'score' ? order : 'asc'}
                                            onClick={() => {handleRequestSort('level')}}
                                        > */}
                  <Typography className={classes.tableHeadText}>
                    <Text tid='level' />
                  </Typography>
                  {/* </TableSortLabel> */}
                </TableCell>
                <TableCell align='center' className={classes.tableHeadCell}>
                  <Typography className={classes.tableHeadText}>
                    <Text tid='linkToAssessment' />
                  </Typography>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {assessmentArray.map((row: any, index: number) => {
                if (!row.hideResult) {
                  return (
                    <TableRow
                      key={row.assessmentId}
                      style={
                        index % 2
                          ? { background: '#EFEFEF' }
                          : { background: 'white' }
                      }
                    >
                      <TableCell
                        component='th'
                        scope='row'
                        className={classes.firstColumn}
                      >
                        <Typography className={classes.tableBodyText}>
                          {row.team ? row.team : 'NA'}
                        </Typography>
                      </TableCell>
                      <TableCell align='center'>
                        <Tooltip
                          title={
                            <Typography>
                              {row.assessmentName ? row.assessmentName : 'NA'}
                            </Typography>
                          }
                        >
                          <Typography className={classes.tableBodyText}>
                            {row.assessmentName ? row.assessmentName : 'NA'}
                          </Typography>
                        </Tooltip>
                      </TableCell>
                      <TableCell align='center'>
                        <Typography className={classes.tableBodyText}>
                          {row.dateSubmit ? getDateTime(row.dateSubmit) : 'NA'}
                        </Typography>
                      </TableCell>
                      <TableCell align='center'>
                        <Typography className={classes.tableBodyText}>
                          {row.result ? `${row.result!.percentage}%` : 'NA'}
                        </Typography>
                      </TableCell>
                      <TableCell align='center'>
                        <Typography className={classes.tableBodyText}>
                          {row.result ? row.result!.level : 'NA'}
                        </Typography>
                      </TableCell>
                      <TableCell align='center'>{getLink(row)}</TableCell>
                    </TableRow>
                  );
                }
              })}
            </TableBody>
          </Table>
        </Paper>
      </Container>
    );
  }
  return (
    <Container
      maxWidth='md'
      component='div'
      classes={{
        root: classes.containerRoot,
      }}
    >
      <Loader />
    </Container>
  );
}

export default ViewAssessment;
