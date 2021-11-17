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
  MuiThemeProvider,
  Tooltip
} from '@material-ui/core';
import ClearIcon from '@material-ui/icons/Clear';
import AddIcon from '@material-ui/icons/Add';
import { useSelector } from 'react-redux';
import { IRootState } from '../../../reducers';
import Loader from '../../loader';
import { Http } from '../../../utils';
import { default as MaterialLink } from '@material-ui/core/Link';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import CancelIcon from '@material-ui/icons/Cancel';
import { withRouter } from 'react-router-dom';
import { ModalComponent } from '../../modal';
import { buttonStyle, tooltipTheme } from '../../../common/common';
import SearchControl from '../../common/searchControl';
import PageSizeDropDown from '../../common/page-size-dropdown';
import RenderPagination from '../../common/pagination';
import { Text } from '../../../common/Language';
import '../../../css/assessments/style.css';
import { IDeviceInfo } from '../../../model';

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

const ManageDevices = (props: any) => {
  const classes = useStyles();
  const stateVariable = useSelector((state: IRootState) => {
    return state;
  });
  const [fetchDevices, setFetchDevices] = React.useState(false);
  const [allDevices, setAllDevices] = React.useState<IDeviceInfo[]>([]);
  const [backdropOpen, setBackdropOpen] = React.useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [deleteDeviceId, setDeleteDeviceId] = useState('');
  const [searchString, setSearchString] = useState('');
  const [devices, setDevices] = useState<IDeviceInfo[]>([]);
  const [searchButtonPressed, setSearchButtonPressed] = useState(false);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [numberOfDevices, setNumberOfDevices] = useState(0);
  const [itemLimit, setItemLimit] = useState({
    lowerLimit: 0,
    upperLimit: 9,
  });
  /* Order related changes */
  const [order, setOrder] = useState<'asc' | 'desc'>('desc');
  const [orderBy, setOrderBy] = useState('name');
  /* Initialization Order related variables ends here */

  const fetchDeviceList = () => {
    setBackdropOpen(true);
    Http.get({
      url: `/api/v2/devices`,
      state: stateVariable,
    })
    .then((response: any) => {
      response.devices.sort((a: IDeviceInfo, b: IDeviceInfo) => {
          return a.name.localeCompare(b.name);
      });
      setFetchDevices(true);
      setAllDevices(response.devices);
      setDevices(response.devices);
      setBackdropOpen(false);
    })
    .catch((error: any) => {
      setFetchDevices(true);
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
    setNumberOfDevices(devices.length);
  }, [devices]);

  useEffect(() => {
    fetchDeviceList();
    setSearchString('');
    setCurrentPage(1);
  }, []);

  useEffect(() => {
    if (searchButtonPressed) {
      setSearchButtonPressed(false);
      const searchedItems: any = [];
      if (searchString === '') {
        setDevices([]);
      }
      allDevices.forEach((el: any) => {
        if (el.name.toLowerCase().includes(searchString.toLowerCase())) {
          searchedItems.push(el);
        }
      });
      setDevices(searchedItems);
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
    if (devices !== []) {
      const tempSortedDevices = [...devices];
      if (order === 'asc') {
        if (orderBy === 'device') {
          setDevices(tempSortedDevices.sort(compareDevice));
        }
      }
      if (order === 'desc') {
        if (orderBy === 'device') {
          setDevices(tempSortedDevices.sort(compareDeviceD));
        }
      }
    }
  }, [order, orderBy]);

  function compareDevice(a: IDeviceInfo, b: IDeviceInfo) {
    if (a.name.toLowerCase() < b.name.toLowerCase()) {
      return -1;
    }
    if (a.name.toLowerCase() > b.name.toLowerCase()) {
      return 1;
    }
    return 0;
  }

  function compareDeviceD(a: IDeviceInfo, b: IDeviceInfo) {
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

  const deleteClicked = (deviceId: string) => {
    setDeleteDeviceId(deviceId);
    setOpenModal(true);
  };

  const modalNoClicked = () => {
    setOpenModal(false);
  };

  const modalYesClicked = () => {
    if (deleteDeviceId !== '') {
      deleteDevice(deleteDeviceId);
      setOpenModal(false);
    }
  };

  const deleteDevice = (deviceId: string) => {
    setBackdropOpen(true);
    Http.deleteReq({
      url: `/api/v2/devices/${deviceId}`,
      state: stateVariable,
    })
    .then((response: any) => {
      setBackdropOpen(false);
      setDeleteDeviceId('');
      fetchDeviceList();
    })
    .catch((error) => {
      const perror = JSON.stringify(error);
      const object = JSON.parse(perror);
      if (object.code === 401) {
        props.history.push('/relogin');
      }
      setBackdropOpen(false);
      fetchDeviceList();
    });
  };

  const renderDevicesTable = () => {
    return (
      <Fragment>
        <Container maxWidth='md' component='div' className='containerRoot'>
          <Backdrop className={classes.backdrop} open={backdropOpen}>
            <CircularProgress color='inherit' />
          </Backdrop>
          <div style={{ width: '100%' }}>
            <Grid container spacing={3}>
              <Grid item sm={5}>
                <Button
                  className={classes.backButton}
                  variant='outlined'
                  onClick={() => { props.editClicked(0); }}
                >
                  <AddIcon
                    fontSize='large'
                  />{' '}
                  <Text tid='addDevice' />
                </Button>
              </Grid>
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
                      active={orderBy === 'device'}
                      direction={orderBy === 'device' ? order : 'asc'}
                      onClick={() => {
                        handleRequestSort('device');
                      }}
                    >
                      <Typography className='tableHeadText'>
                        <Text tid='device' />
                      </Typography>
                    </TableSortLabel>
                  </TableCell>
                  <TableCell align='center' className='tableHeadCell'>
                    <Typography className='tableHeadText'>
                      <Text tid='actions' />
                    </Typography>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {devices.map((row: any, index: number) => {
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
                        <MaterialLink
                          href='#'
                          onClick={() => { props.editClicked(row.id); }}
                        >
                          <Typography className='tableBodyText'>
                            {row.name}
                          </Typography>
                        </MaterialLink>
                      </TableCell>
                      <TableCell align='center' className='tableCell'>
                        <div className={classes.actionsBlock} style={{ cursor: 'pointer' }}>
                          <MuiThemeProvider theme={tooltipTheme}>
                            <Tooltip
                              title={
                                <Typography style={{ fontSize: '12px', textAlign: 'center' }}>
                                  <Text tid='delete' />
                                </Typography>
                              }
                            >
                              <Typography>
                                <ClearIcon onClick={() => { deleteClicked(row.id); }}/>
                              </Typography>
                            </Tooltip>
                          </MuiThemeProvider>
                        </div>
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
              totalItemsCount={numberOfDevices}
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
            message={'deleteDeviceConfirmMessage'}
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
      {fetchDevices ? (
        renderDevicesTable()
      ) : (
        <Container className='loaderStyle'>
          <Loader />
        </Container>
      )}
    </Fragment>
  );
};

export default withRouter(ManageDevices);
