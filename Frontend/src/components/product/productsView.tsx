import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { IRootState } from '../../reducers';
import { Http } from '../../utils';
import { useHistory } from 'react-router-dom';
import { makeStyles } from '@material-ui/core/styles';
import InfoIcon from '@material-ui/icons/Info';
import {
  Button,
  Container,
  FormControl,
  Grid,
  InputLabel,
  Paper,
  Select,
  Typography,
} from '@material-ui/core';
import {
  IPlatformInfo,
  IProductInfo,
  IUserParams,
  IDeviceInfo,
  STATUS_CAMPAIGN_ACTIVE,
} from '../../model';
import Loader from '../loader';
import SearchControl from '../common/searchControl';

const useStyles = makeStyles((theme) => ({
  img: {
    height: 40,
    width: 40,
    borderRadius: '20%',
  },
  block: {
    padding: '10px 20px',
    marginTop: '10px',
    borderLeft: '2px solid #000000',
  },
  subTitle: {
    fontSize: '12px',
    paddingTop: '2px',
  },
  formControl: {
    margin: theme.spacing(1),
    minWidth: 120,
  },
}));

const ProductsView = (props: any) => {
  const classes = useStyles();
  const stateVariable = useSelector((state: IRootState) => {
    return state;
  });
  const [searchString, setSearchString] = useState('');
  const [allProducts, setAllProducts] = useState<IProductInfo[]>([]);
  const [listedProducts, setListedProducts] = useState<IProductInfo[]>([]);
  const [allPlatforms, setAllPlatforms] = useState<IPlatformInfo[]>([]);
  const [allDevices, setAllDevices] = useState<IDeviceInfo[]>([]);
  const [userState, setUserState] = useState<IUserParams | undefined>();
  const [selectedDevice, setSelectedDevice] = useState<any>('');
  const [selectedPlatform, setSelectedPlatform] = useState<any>('');
  const [productsFetched, setProductsFetched] = useState<boolean>(false);
  const [filteredByPlatforms, setFilteredByPlatforms] = useState<any[]>([]);
  // const [filteredByDevices, setFilteredByDevices] = useState<any[]>([]);
  const history = useHistory();

  useEffect(() => {
    fetchAllPlatforms();
    fetchAllDevices();
    fetchCampaignDetails();
    fetchUserDetails();
    fetchAllfeedback();
  }, []);

  const fetchUserDetails = () => {
    Http.get({
      url: `/api/v2/admin/users/getusers?email=${stateVariable.user.userDetails.email}`,
      state: stateVariable,
    })
      .then((response: any) => {
        setUserState(response);
      })
      .catch((error) => {
        console.log(error);
        props.history.push('/relogin');
      });
  };

  const fetchAllfeedback = () => {
    Http.post({
      url: `/api/v2/productApiKey`,
      state: stateVariable,
      body: {
        productApikey: 'none',
      },
    })
    .then((response: any) => {
      console.log('app feedback', response);
    })
    .catch((error) => {
      console.log(error);
      props.history.push('/relogin');
    });
  };

  useEffect(() => {
    let filteredProductList: any[] = [];
    // setSelectedDevice('')
    allProducts.length && selectedPlatform
      ? allProducts.forEach((item: any) => {
          item.platforms.forEach(
            (id: string) =>
              id === selectedPlatform && filteredProductList.push(item)
          );
          setListedProducts(filteredProductList);
          setFilteredByPlatforms(filteredProductList);
        })
      : setListedProducts(allProducts);
    !selectedPlatform && setSelectedDevice('');
  }, [selectedPlatform]);

  useEffect(() => {
    let filteredProductList: any[] = [];
    // setSelectedPlatform('')
    filteredByPlatforms.length || (selectedPlatform && selectedDevice)
      ? filteredByPlatforms.forEach((item: any) => {
          item.devices.forEach(
            (id: string) =>
              id === selectedDevice && filteredProductList.push(item)
          );
          setListedProducts(filteredProductList);
          // setFilteredByDevices(filteredProductList)
        })
      : selectedDevice &&
        allProducts.forEach((item: any) => {
          item.devices.forEach(
            (id: string) =>
              id === selectedDevice && filteredProductList.push(item)
          );
          setListedProducts(filteredProductList);
          // setFilteredByDevices(filteredProductList)
        });
    !selectedDevice && setSelectedPlatform('');
    !selectedPlatform &&
      !selectedDevice &&
      !filteredByPlatforms.length &&
      setListedProducts(allProducts);
  }, [selectedDevice]);

  useEffect(() => {
    let filteredProductList: any[] = [];
    setSelectedDevice('');
    setSelectedPlatform('');
    allProducts.length && searchString
      ? allProducts.forEach((item: any) => {
          item.name.toLowerCase().includes(searchString.toLowerCase()) &&
            filteredProductList.push(item);
          setListedProducts(filteredProductList);
        })
      : setListedProducts(allProducts);
  }, [searchString]);

  const fetchAllPlatforms = () => {
    Http.get({
      url: `/api/v2/platforms`,
      state: stateVariable,
    })
      .then((response: any) => {
        response.platforms.sort((a: IPlatformInfo, b: IPlatformInfo) => {
          return a.name.localeCompare(b.name);
        });
        setAllPlatforms(response.platforms);
      })
      .catch((error: any) => {
        const perror = JSON.stringify(error);
        const object = JSON.parse(perror);
        if (object.code === 401) {
          history.push('/relogin');
        } else {
          history.push('/error');
        }
      });
  };

  const fetchAllDevices = () => {
    Http.get({
      url: `/api/v2/devices`,
      state: stateVariable,
    })
      .then((response: any) => {
        response.devices.sort((a: IDeviceInfo, b: IDeviceInfo) => {
          return a.name.localeCompare(b.name);
        });
        setAllDevices(response.devices);
      })
      .catch((error: any) => {
        const perror = JSON.stringify(error);
        const object = JSON.parse(perror);
        if (object.code === 401) {
          history.push('/relogin');
        } else {
          history.push('/error');
        }
      });
  };

  const fetchCampaignDetails = () => {
    let products: any[] = [];
    Http.get({
      url: `/api/v2/campaigns?status=${STATUS_CAMPAIGN_ACTIVE}`,
      state: stateVariable,
    })
      .then((response: any) => {
        // response.campaigns.forEach((item: any, index: number) => {
        //   item.products.forEach((item: any, index: number) => {
        //     Http.get({
        //       url: `/api/v2/products/${item}/0`,
        //       state: stateVariable,
        //     });
        //     products.push(item);
        //   });
        // });
        // setAllProducts(products);
        // setListedProducts(products);
        setProductsFetched(true);
      })
      .catch((error: any) => {
        setProductsFetched(true);
        const perror = JSON.stringify(error);
        const object = JSON.parse(perror);
        if (object.code === 401) {
          history.push('/relogin');
        } else {
          history.push('/error');
        }
        // setFailure(true);
      });
  };

  const handleSearch = (str: string) => {
    if (typeof str !== 'undefined') {
      setSearchString(str);
    }
  };

  const requestInterest = () => {
    console.log('requestInterest');
  };

  return (
    <div data-testid='product'>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={3}>
          <FormControl className={classes.formControl}>
            <InputLabel htmlFor='platform-native-simple'>
              By Platform
            </InputLabel>
            <Select
              native
              value={selectedPlatform}
              inputProps={{
                name: 'platform',
                id: 'platform-native-simple',
              }}
              onChange={(e) => setSelectedPlatform(e.target.value)}
            >
              <option aria-label='None' value=''></option>
              {allPlatforms.length &&
                allPlatforms.map((item, index) => {
                  return (
                    <option value={item.id} key={index}>
                      {item.name}
                    </option>
                  );
                })}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={3}>
          <FormControl className={classes.formControl}>
            <InputLabel htmlFor='device-native-simple'>By Device</InputLabel>
            <Select
              native
              value={selectedDevice}
              inputProps={{
                name: 'device',
                id: 'device-native-simple',
              }}
              onChange={(e) => setSelectedDevice(e.target.value)}
            >
              <option aria-label='None' value=''></option>
              {allDevices.length &&
                allDevices.map((item, index) => {
                  return (
                    <option value={item.id} key={index}>
                      {item.name}
                    </option>
                  );
                })}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6} style={{ marginTop: '8px' }}>
          <SearchControl
            searchString={searchString}
            handleSearch={handleSearch}
          />
        </Grid>
      </Grid>
      {productsFetched ? (
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Typography data-testid='header'>
              Showing {listedProducts.length} products
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}></Grid>
          <Grid item xs={12} sm={12}>
            <InfoIcon fontSize='small' style={{ marginBottom: '-4px' }} />{' '}
            <InputLabel style={{ fontSize: '13px', display: 'inline-block' }}>
              User can request to test only products that match the platforms
              and devices selected on the profile page.
            </InputLabel>
          </Grid>
          {listedProducts.length ? (
            listedProducts.map((item: any, index: number) => {
              let platforms = allPlatforms.filter((p1) =>
                item && item.platforms && item.platforms.includes(p1.id)
                //item.platforms.some((p2: any) => p1.id === p2)
              );
              let devices = allDevices.filter((d1) =>
                item && item.devices && item.devices.includes(d1.id)
                //item.devices.some((d2: any) => d1.id === d2)
              );

              let usersPlatforms = userState && userState.values.platform;
              let usersDevices = userState && userState.values.devices;

              let enableRequestTestbyPlatforms =
                usersPlatforms && usersPlatforms.length && platforms
                  ? platforms.some((o1) => usersPlatforms.includes(o1.id))
                  : false;
              let enableRequestTestbyDevices =
                usersDevices && usersDevices.length && devices
                  ? devices.some((o1) => usersDevices.includes(o1.id))
                  : false;

              return (
                <Grid item xs={12} sm={6} key={index}>
                  <Paper
                    className={classes.block}
                    data-testid={`platform-${item.id}`}
                  >
                    <Grid container spacing={2}>
                      <Grid item xs={3} sm={3} md={3}>
                        <img
                          className={classes.img}
                          src={
                            'https://images.unsplash.com/photo-1537944434965-cf4679d1a598?auto=format&fit=crop&w=400&h=250&q=60'
                          }
                          alt={item.label}
                        />
                      </Grid>
                      <Grid item xs={9} sm={9} md={9}>
                        <Typography>{item.name}</Typography>
                        <InputLabel className={classes.subTitle}>
                          {item.name}
                        </InputLabel>
                      </Grid>
                      <Grid item xs={12} sm={12} md={12}>
                        <Typography
                          variant='subtitle2'
                          style={{ color: '#D35400' }}
                        >
                          {' '}
                          PLATFORM{' '}
                        </Typography>
                        {platforms.length && platforms.map((item) => item.name)}
                      </Grid>
                      <Grid item xs={12} sm={12} md={12}>
                        <Typography
                          variant='subtitle2'
                          style={{ color: '#D35400' }}
                        >
                          {' '}
                          DEVICES{' '}
                        </Typography>
                        {devices.length && devices.map((item) => item.name)}
                      </Grid>
                      <Grid
                        item
                        xs={12}
                        sm={12}
                        md={12}
                        style={{ textAlign: 'center', margin: '5px 0px' }}
                      >
                        <Button
                          variant='outlined'
                          color='primary'
                          size='small'
                          className='button'
                          data-testid='showInterest'
                          disabled={
                            props.userProfileStatusProgress < 100 ||
                            !enableRequestTestbyPlatforms ||
                            !enableRequestTestbyDevices
                          }
                          onClick={requestInterest}
                        >
                          Request to Test
                        </Button>
                      </Grid>
                    </Grid>
                  </Paper>
                </Grid>
              );
            })
          ) : (
            <Paper
              className={classes.block}
              style={{ width: '100%', textAlign: 'center' }}
            >
              There is no products found
            </Paper>
          )}
        </Grid>
      ) : (
        <Container className='loaderStyle'>
          <Loader />
        </Container>
      )}
    </div>
  );
};

export default ProductsView;
