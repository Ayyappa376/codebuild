import React, { useEffect, useState, Fragment } from 'react';
import {
  Typography,
  makeStyles,
  Container,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Button,
  CircularProgress,
  Backdrop,
  Grid,
  TableSortLabel,
} from '@material-ui/core';
import { useSelector } from 'react-redux';
import { IRootState } from '../../../reducers';
import Loader from '../../loader';
import { Http } from '../../../utils';
import { default as MaterialLink } from '@material-ui/core/Link';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import CancelIcon from '@material-ui/icons/Cancel';
import { withRouter } from 'react-router-dom';
import { ModalComponent } from '../../modal';
import { buttonStyle } from '../../../common/common';
import SearchControl from '../../common/searchControl';
import PageSizeDropDown from '../../common/page-size-dropdown';
import RenderPagination from '../../common/pagination';
import { Text } from '../../../common/Language';
import '../../../css/assessments/style.css';

const useStyles = makeStyles((theme) => ({
  actionsBlock: {
    display: 'flex',
    flexWrap: 'wrap',
    marginLeft: '20%',
  },
  backButton: {
    marginTop: '36px',
    position: 'relative',
    minWidth: '10%',
    marginRight: '20px',
    ...buttonStyle,
  },
  backdrop: {
    zIndex: theme.zIndex.drawer + 1,
    color: '#fff',
  },
}));

const ManageCampaigns = (props: any) => {
  const classes = useStyles();
  const stateVariable = useSelector((state: IRootState) => {
    return state;
  });
  const [fetchCampaigns, setFetchCampaigns] = React.useState(false);
  const [allCampaigns, setAllCampaigns] = React.useState<Object[]>([]);
  const [backdropOpen, setBackdropOpen] = React.useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [deleteCampaignId, setDeleteCampaignId] = useState('');
  const [searchString, setSearchString] = useState('');
  const [campaigns, setCampaigns] = useState<Object[]>([]);
  const [searchButtonPressed, setSearchButtonPressed] = useState(false);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [numberOfCampaigns, setNumberOfCampaigns] = useState(0);
  const [itemLimit, setItemLimit] = useState({
    lowerLimit: 0,
    upperLimit: 9,
  });
  /* Order related changes */
  const [order, setOrder] = useState<'asc' | 'desc'>('desc');
  const [orderBy, setOrderBy] = useState('name');
  /* Initialization Order related variables ends here */

  const fetchCampaignList = () => {
    setBackdropOpen(true);
    Http.get({
      url: `/api/v2/campaigns`,
      state: stateVariable,
    })
    .then((response: any) => {
      response.campaigns.sort((a: any, b: any) => {
        if (a.active === b.active) {
          return a.name.toLowerCase() <= b.name.toLowerCase()
            ? -1
            : 1;
        }
        return a.active === 'true' ? -1 : 1;
      });
      setFetchCampaigns(true);
      setAllCampaigns(response.campaigns);
      setCampaigns(response.campaigns);
      setBackdropOpen(false);
    })
    .catch((error: any) => {
      setFetchCampaigns(true);
      setBackdropOpen(false);
      const perror = JSON.stringify(error);
      const object = JSON.parse(perror);
      if (object.code === 401) {
        props.history.push('/relogin');
      } else {
        props.history.push('/error');
      }
    })
  };

  useEffect(() => {
    setNumberOfCampaigns(campaigns.length);
  }, [campaigns]);

  useEffect(() => {
    fetchCampaignList();
    setSearchString('');
    setCurrentPage(1);
  }, []);

  useEffect(() => {
    if (searchButtonPressed) {
      setSearchButtonPressed(false);
      const searchedItems: any = [];
      if (searchString === '') {
        setCampaigns([]);
      }
      allCampaigns.forEach((el: any) => {
        if (el.name.toLowerCase().includes(searchString.toLowerCase())) {
          searchedItems.push(el);
        }
      });
      setCampaigns(searchedItems);
      setCurrentPage(1);
    }
  }, [searchButtonPressed]);

  useEffect(() => {
    calculateLimits();
  }, [currentPage]);

  useEffect(() => {
    setCurrentPage(1);
    calculateLimits();
  }, [itemsPerPage]);

  useEffect(() => {
    if (campaigns !== []) {
      const tempSortedCampaigns = [...campaigns];
      if (order === 'asc') {
        if (orderBy === 'status') {
          setCampaigns(tempSortedCampaigns.sort(compareStatus));
        }
        if (orderBy === 'campaign') {
          setCampaigns(tempSortedCampaigns.sort(compareCampaign));
        }
      }
      if (order === 'desc') {
        if (orderBy === 'status') {
          setCampaigns(tempSortedCampaigns.sort(compareStatusD));
        }
        if (orderBy === 'campaign') {
          setCampaigns(tempSortedCampaigns.sort(compareCampaignD));
        }
      }
    }
  }, [order, orderBy]);

  function compareStatus(a: any, b: any) {
    if (a.active === 'true' && b.active === 'false') {
      return -1;
    }
    if (a.active === 'false' && b.active === 'true') {
      return 1;
    }
    return 0;
  }

  function compareCampaign(a: any, b: any) {
    if (a.name.toLowerCase() < b.name.toLowerCase()) {
      return -1;
    }
    if (a.name.toLowerCase() > b.name.toLowerCase()) {
      return 1;
    }
    return 0;
  }

  function compareStatusD(a: any, b: any) {
    if (a.active === 'true' && b.active === 'false') {
      return 1;
    }
    if (a.active === 'false' && b.active === 'true') {
      return -1;
    }
    return 0;
  }

  function compareCampaignD(a: any, b: any) {
    if (a.name.toLowerCase() < b.name.toLowerCase()) {
      return 1;
    }
    if (a.name.toLowerCase() > b.name.toLowerCase()) {
      return -1;
    }
    return 0;
  }

  const handleRequestSort = (property: string) => {
    if (orderBy === property) {
      setOrder(order === 'asc' ? 'desc' : 'asc');
    } else {
      setOrder('asc');
      setOrderBy(property);
    }
  };

  const calculateLimits = () => {
    const lowerLimit = (currentPage - 1) * itemsPerPage;
    const upperLimit = lowerLimit + itemsPerPage - 1;
    setItemLimit({ lowerLimit, upperLimit });
  };

  const handleSearch = (str?: string) => {
    if (typeof str !== 'undefined') {
      setSearchString(str);
    }
    setSearchButtonPressed(true);
  };

  const handleChangeItemsPerPage = (event: any) => {
    const value = parseInt(event.target.value, 10);
    setItemsPerPage(value);
  };

  const handlePaginationClick = (event: number) => {
    setCurrentPage(event);
  };

  const disableClicked = (campaignId: string) => {
    setDeleteCampaignId(campaignId);
    setOpenModal(true);
  };

  const modalNoClicked = () => {
    setOpenModal(false);
  };

  const modalYesClicked = () => {
    if (deleteCampaignId !== '') {
      disableCampaign(deleteCampaignId);
      setOpenModal(false);
    }
  };

  const disableCampaign = (campaignId: string) => {
    setBackdropOpen(true);
    Http.deleteReq({
      url: `/api/v2/campaigns/${campaignId}`,
      state: stateVariable,
    })
      .then((response: any) => {
        setBackdropOpen(false);
        setDeleteCampaignId('');
      })
      .catch((error) => {
        const perror = JSON.stringify(error);
        const object = JSON.parse(perror);
        if (object.code === 401) {
          props.history.push('/relogin');
        }
        setBackdropOpen(false);
        fetchCampaignList();
      });
  };

  const enableClicked = (row: any) => {
    setBackdropOpen(true);
    const postData = { ...row, active: 'true' };
    Http.put({
      url: `/api/v2/campaigns`,
      body: {
        orgId: postData.orgId,
        values: postData,
      },
      state: stateVariable,
    })
      .then((response: any) => {
        setBackdropOpen(false);
        fetchCampaignList();
      })
      .catch((error) => {
        const perror = JSON.stringify(error);
        const object = JSON.parse(perror);
        if (object.code === 401) {
          props.history.push('/relogin');
        }
        setBackdropOpen(false);
        fetchCampaignList();
      });
  };

  const renderEmptyCampaignMessage = () => {
    return (
      <Typography variant='h5'>
        <Text tid='notManagingAnyPlatform' />
      </Typography>
    );
  };

  const renderCampaignsTable = () => {
    return (
      <Fragment>
        <Container maxWidth='md' component='div' className='containerRoot'>
          <Backdrop className={classes.backdrop} open={backdropOpen}>
            <CircularProgress color='inherit' />
          </Backdrop>
          <div style={{ width: '100%' }}>
            <Grid container spacing={3}>
              <Grid item sm={5} />
              <Grid item sm={5}>
                <SearchControl
                  searchString={searchString}
                  handleSearch={handleSearch}
                />
              </Grid>
              <Grid item sm={2}>
                <PageSizeDropDown
                  handleChange={handleChangeItemsPerPage}
                  itemCount={itemsPerPage}
                />
              </Grid>
            </Grid>
          </div>
          <Paper className='tableArea'>
            <Table className='table'>
              <TableHead className='tableHead'>
                <TableRow>
                  <TableCell className='tableHeadCell'>
                    <TableSortLabel
                      active={orderBy === 'campaign'}
                      direction={orderBy === 'campaign' ? order : 'asc'}
                      onClick={() => {
                        handleRequestSort('campaign');
                      }}
                    >
                      <Typography className='tableHeadText'>
                        <Text tid='platform' />
                      </Typography>
                    </TableSortLabel>
                  </TableCell>
                  <TableCell align='center' className='tableHeadCell'>
                    <Typography className='tableHeadText'>
                      <Text tid='actions' />
                    </Typography>
                  </TableCell>
                  <TableCell align='center' className='tableHeadCell'>
                    <TableSortLabel
                      active={orderBy === 'status'}
                      direction={orderBy === 'status' ? order : 'asc'}
                      onClick={() => {
                        handleRequestSort('status');
                      }}
                    >
                      <Typography className='tableHeadText'>
                        <Text tid='status' />
                      </Typography>
                    </TableSortLabel>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {campaigns.map((row: any, index: number) => {
                  if (index < itemLimit.lowerLimit) {
                    return;
                  }
                  if (index > itemLimit.upperLimit) {
                    return;
                  }
                  return (
                    <TableRow
                      key={index}
                      style={
                        index % 2
                          ? { background: '#EFEFEF' }
                          : { background: 'white' }
                      }
                    >
                      <TableCell
                        component='th'
                        scope='row'
                        className='tableCell'
                      >
                        <Typography className='tableBodyText'>
                          {row.name}
                        </Typography>
                      </TableCell>
                      <TableCell align='center' className='tableCell'>
                        <div className={classes.actionsBlock}>
                          {row.active === 'true' ? (
                            <Fragment>
                              <MaterialLink
                                href='#'
                                onClick={() => {
                                  props.editClicked(row.id);
                                }}
                              >
                                <Typography>
                                  <Text tid='editProfile' />
                                </Typography>
                              </MaterialLink>
                              <Typography>&nbsp;|&nbsp;</Typography>
                              <MaterialLink
                                href='#'
                                onClick={() => {
                                  disableClicked(row.id);
                                }}
                              >
                                <Typography>
                                  <Text tid='disable' />
                                </Typography>
                              </MaterialLink>
                              {/*<Typography>&nbsp;|&nbsp;</Typography>
                              <MaterialLink
                                href='#'
                                onClick={() => {
                                  props.assignClicked(row.id);
                                }}
                              >
                                <Typography>
                                  <Text tid='assign' />
                                </Typography>
                              </MaterialLink>*/}
                            </Fragment>
                          ) : (
                            <MaterialLink
                              align='center'
                              href='#'
                              onClick={() => {
                                enableClicked(row);
                              }}
                            >
                              <Typography align='center'>
                                <Text tid='enable' />
                              </Typography>
                            </MaterialLink>
                          )}
                        </div>
                      </TableCell>
                      <TableCell
                        component='th'
                        scope='row'
                        align='center'
                        className='tableCell'
                      >
                        {row.active === 'true' ? (
                          <CheckCircleIcon
                            fontSize='large'
                            htmlColor='#66bb6a'
                          />
                        ) : (
                          <CancelIcon fontSize='large' htmlColor='#dd0000' />
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </Paper>
          <Fragment>
            <RenderPagination
              pageRangeDisplayed={10}
              activePage={currentPage}
              itemsCountPerPage={itemsPerPage}
              totalItemsCount={numberOfCampaigns}
              handleChange={handlePaginationClick}
            />
          </Fragment>
          <div className='bottomButtonsContainer'>
            <Button
              className={classes.backButton}
              variant='outlined'
              onClick={props.goBack}
            >
              <Text tid='goBack' />
            </Button>
          </div>
          <ModalComponent
            message={'disableThePlatformAndTheRelatedTestData'}
            openModal={openModal}
            handleModalYesClicked={modalYesClicked}
            handleModalNoClicked={modalNoClicked}
          />
        </Container>
      </Fragment>
    );
  };

  return (
    <Fragment>
      {fetchCampaigns ? (
        allCampaigns.length === 0 ? (
          renderEmptyCampaignMessage()
        ) : (
          renderCampaignsTable()
        )
      ) : (
        <Container className='loaderStyle'>
          <Loader />
        </Container>
      )}
    </Fragment>
  );
};

export default withRouter(ManageCampaigns);
