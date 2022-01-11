import React, { useEffect, useState } from 'react';
import { Container, Grid } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { useSelector } from 'react-redux';
import { useActions, setSystemDetails, setCurrentPage } from '../../actions';
import { IRootState } from '../../reducers';
import { Http } from '../../utils';
import { Auth } from 'aws-amplify';
import jwtDecode from 'jwt-decode';
import {
  PlatformsView,
  RecordsCount,
  TestersView,
  UsersFeedback,
} from '../../components/home/leftPane';
import TopPane from '../../components/home/topPane';
import { LatestNews } from '../../components/home/rightPane';
import SignupForm from '../../components/signUpForm';
import { CreateOrganization } from '../../components';

const useStyles = makeStyles({
  root: {
    marginTop: '1.2em',
    padding: 0,
    overflow: 'hidden',
  },
  marginTopTen: {
    marginTop: '10px',
  },
  marginTopTwenty: {
    marginTop: '20px',
  },
});

const usersFeedback = [
  {
    label:
      'Lorem Ipsum is simply dummy text of the printing and typesetting industry.Lorem Ipsum  been the industry standard dummy text',
    imgPath:
      'https://images.unsplash.com/photo-1537944434965-cf4679d1a598?auto=format&fit=crop&w=400&h=250&q=60',
  },
  {
    label:
      'Lorem Ipsum is simply dummy text of the printing and typesetting industry.Lorem Ipsum has the industry standard dummy text',
    imgPath:
      'https://images.unsplash.com/photo-1538032746644-0212e812a9e7?auto=format&fit=crop&w=400&h=250&q=60',
  },
  {
    label:
      'Lorem Ipsum is simply dummy text of the printing and typesetting industry.Lorem Ipsum has been  industry standard dummy text',
    imgPath:
      'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=400&h=250&q=80',
  },
  {
    label:
      'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry standard dummy text',
    imgPath:
      'https://images.unsplash.com/photo-1518732714860-b62714ce0c59?auto=format&fit=crop&w=400&h=250&q=60',
  },
  {
    label:
      'Lorem Ipsum is simply dummy text of the printing and typesetting industry.Lorem Ipsum has been the standard dummy text',
    imgPath:
      'https://images.unsplash.com/photo-1512341689857-198e7e2f3ca8?auto=format&fit=crop&w=400&h=250&q=60',
  },
];

const latestNews = [
  {
    label: 'Latest News : Live Blog about Testing',
    imgPath:
      'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1112&q=80',
  },
  {
    label: 'Latest News : Live Blog about Testing',
    imgPath:
      'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1112&q=80',
  },
  {
    label: 'Latest News : Live Blog about Testing',
    imgPath:
      'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1112&q=80',
  },
];

const Home = (props: any) => {
  const classes = useStyles();
  const setSysDetails = useActions(setSystemDetails);
  const systemDetails = useSelector((state: IRootState) => state.systemDetails);
  const stateVariable = useSelector((state: IRootState) => state);
  const setCurrentPageValue = useActions(setCurrentPage);
  const [openSignup, setOpenSignup] = useState(false);
  const [openOrgCreation, setOpenOrgSelection] = useState(false);
  const [platformList, setPlatformList] = useState([]);
  const [testerList, setTesterList] = useState([]);
  const [testerCount, setTesterCount] = useState(0);
  // const superUserStateVariable = stateVariable;
  const [superUserStateVariable, setSuperUserStateVariable] =
    useState(stateVariable);

  const records = [
    { name: 'Testers', value: testerCount },
    { name: 'Products', value: 20 },
    { name: 'Ongoing Testing', value: 35 },
  ];

  const getPlatformList = () => {
    Http.get({
      url: '/api/v2/platforms/',
      state: superUserStateVariable,
    })
      .then((response: any) => {
        // console.log(response.platforms);
        setPlatformList(response.platforms);
      })
      .catch((error: any) => {
        console.log(error);
      });
  };

  const getUserList = () => {
    Http.get({
      url: '/api/v2/users',
      state: superUserStateVariable,
    })
      .then((response: any) => {
        setTesterCount(response.userCount);
        setTesterList(response.users);
      })
      .catch((error: any) => {
        console.log(error);
      });
  };
  useEffect(() => {
    setCurrentPageValue('');
    if (
      !systemDetails ||
      systemDetails.appClientId === '' ||
      systemDetails.appClientURL === '' ||
      systemDetails.systemUser === '' ||
      systemDetails.systemPassword === ''
    ) {
      Http.get({
        url: '/api/v2/settings/cognito',
        state: { stateVariable },
        customHeaders: { noauthvalidate: 'true' },
      })
        .then((response: any) => {
          console.log(response, 'response');
          setSysDetails({ ...response });
            Auth.signIn(response.systemUser, response.systemPassword)
            .then((user: any) => {
              console.log(user, 'user');
              if (
                user &&
                user.signInUserSession.idToken &&
                user.signInUserSession.accessToken
              ) {
                const tokenInfo: any = jwtDecode(
                  user.signInUserSession.idToken.jwtToken
                );
              superUserStateVariable['user'] = {
                idToken: user.signInUserSession.idToken.jwtToken,
                accessToken: user.signInUserSession.accessToken,
                userDetails: jwtDecode(user.signInUserSession.idToken.jwtToken),
                team:
                  tokenInfo['custom:teamName'] && tokenInfo['custom:teamName'] !== ''
                    ? tokenInfo['custom:teamName']
                    : 'Others',
                teams: [],
                roles: ['Admin'],
              };
              setSuperUserStateVariable(superUserStateVariable);
            }
            getUserList();
            getPlatformList();
            //      getTestSuites();
            //      getAssignments();
          })
          .catch((error) => {
            console.log(error);
          })
        })
        .catch((error: any) => {
          props.history.push('/error');
        });
    }
  }, []);

  const getSignupDialog = (state: boolean) => {
    setOpenSignup(state);
  };

  const handleCloseSignup = (state: boolean) => {
    setOpenSignup(state);
  };

  const getOrganizationSelectionDialog = (state: boolean) => {
    setOpenOrgSelection(state);
  };

  const handleCloseOrganizationCreation = (state: boolean) => {
    setOpenOrgSelection(state);
  };

  return (
    <Container
      maxWidth='xl'
      classes={{
        root: classes.root,
      }}
    >
      <Grid container spacing={2}>
        <TopPane
          getSignupDialog={getSignupDialog}
          getOrganizationSelectionDialog={getOrganizationSelectionDialog}
        />
        <Grid item xs={12} sm={1} />
        <Grid item xs={12} sm={7}>
          <Grid item xs={12} sm={12} className={classes.marginTopTen}>
            <RecordsCount records={records} />
          </Grid>
          <Grid item xs={12} sm={12} className={classes.marginTopTwenty}>
            <UsersFeedback usersFeedback={usersFeedback} />
          </Grid>
          <Grid item xs={12} sm={12} className={classes.marginTopTwenty}>
            <TestersView testerList={testerList} />
          </Grid>
          <Grid item xs={12} sm={12} className={classes.marginTopTwenty}>
            <PlatformsView platformList={platformList} />
          </Grid>
        </Grid>
        <Grid item xs={12} sm={3} className={classes.marginTopTen}>
          <LatestNews latestNews={latestNews} />
        </Grid>
      </Grid>
      {openSignup && (
        <SignupForm
          openSignup={openSignup}
          handleCloseSignup={handleCloseSignup}
          superUserStateVariable={superUserStateVariable}
        />
      )}
      {openOrgCreation && (
        <CreateOrganization
          openOrgCreation={openOrgCreation}
          handleCloseOrganizationCreation={handleCloseOrganizationCreation}
          superUserStateVariable={superUserStateVariable}
        />
      )}
    </Container>
  );
};

export default Home;
