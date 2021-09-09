import React, { Fragment, useState, useEffect } from 'react';
import { withRouter } from 'react-router-dom';
import {
  Grid,
  Button,
  makeStyles,
  Theme,
  createStyles,
  TextField,
  InputAdornment,
  Input,
  Chip,
  Snackbar,
  SnackbarContent,
  Container,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  ExpansionPanel,
  ExpansionPanelSummary,
  Typography,
  ExpansionPanelDetails,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Collapse,
  Popper,
  Grow,
  ButtonGroup,
  Paper,
} from '@material-ui/core';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import ArrowDropUpIcon from '@material-ui/icons/ArrowDropUp';
import Visibility from '@material-ui/icons/Visibility';
import VisibilityOff from '@material-ui/icons/VisibilityOff';
import { buttonStyle } from '../../../common/common';
import { Http } from '../../../utils';
import { useSelector } from 'react-redux';
import { IRootState } from '../../../reducers';
import { Loader } from '../..';
import {
  ITeamMetricsDetails,
  IMetricsTool,
  ICollectorConfigDetails,
  ICollectorConfig,
  IObjectConfigDetails,
} from '../../../model';
import { MANAGE_TEAMS } from '../../../pages/admin';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import Success from '../../success-page';
import ClearIcon from '@material-ui/icons/Clear';
import { LightTooltip } from '../../common/tooltip';
import { ModalComponent } from '../../modal';
import { Text } from '../../../common/Language';
import './style.css';

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

const HEADER_TEXT_MARGIN_TOP = '17px';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      margin: 'auto',
      width: '100%',
    },
    submitButton: {
      marginTop: '28px',
      position: 'relative',
      minWidth: '10%',
      ...buttonStyle,
    },
    backButton: {
      marginTop: '28px',
      position: 'relative',
      minWidth: '10%',
      marginRight: '20px',
      ...buttonStyle,
    },
    connectButton: {
      minWidth: '10%',
      float: 'right',
      marginBottom: '10px',
      ...buttonStyle,
    },
    bottomButtonsContainer: {
      minWidth: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    loader: {
      marginTop: '50px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      width: '100%',
    },
    formControl: {
      minWidth: '100%',
    },
    rootp: {
      width: '100%',
      marginTop: '4px',
    },
    extraBigColumn: {
      flexBasis: '87.5%',
    },
    smallColumn: {
      flexBasis: '12.5%',
    },
    heading: {
      fontSize: theme.typography.pxToRem(20),
    },
    detailsNonHighlighted: {
      alignItems: 'center',
    },
    nonHighlighted: {
      color: 'inherit',
      backgroundColor: 'inherit',
    },
    noResultsContainer: {
      width: '100%',
      height: '5%',
      display: 'flex',
      justifyContent: 'center',
      alignContent: 'center',
    },
    searchContainer: {
      marginTop: '10px',
    },
    title: {
      marginTop: HEADER_TEXT_MARGIN_TOP,
    },
    chips: {
      display: 'flex',
      flexWrap: 'wrap',
    },
    chip: {
      margin: 2,
    },
    textField: {
      borderBottom: 'none!important',
      boxShadow: 'none!important',
    },
    helpText: { fontSize: '12px', color: '#808080' },
    numberInput: { marginTop: '-14px' },
  })
);

const MapMetricsTools = (props: any) => {
  const classes = useStyles();
  const stateVariable = useSelector((state: IRootState) => {
    return state;
  });
  const [teamMetricsTools, setTeamMetricsTools] = useState<ITeamMetricsDetails>(
    { config: {}, orgId: '', metrics: [], teamId: '', teamName: '' }
  );
  const [listSettings, setListSettings] = useState<{ [i: string]: boolean }>(
    {}
  );
  const [fetchedData, setFetchedData] = useState(false);
  const [failure, setFailure] = useState(false);
  const [failureMessage, setFailureMessage] = useState(
    <Text tid='somethingWentWrong' />
  );
  const [dataPosted, setDataPosted] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [deleteToolIndex, setDeleteToolIndex] = useState(-1);
  const [openToggle, setOpenToggle] = useState(false);
  const anchorRef = React.useRef<HTMLDivElement>(null);
  const [values, setValues] = React.useState({
    password: '',
    showPassword: false,
  });
  const [isConnecting, setIsConnecting] = useState(false);
  const [validConnection, setValidConnection] = useState('');
  let msgFailure = failureMessage;
  let msgSuccess = <Text tid='teamDetailsUpdatedSuccessfully' />;

  useEffect(() => {
    fetchTeamMetricsDetails();
  }, []);

  const fetchTeamMetricsDetails = () => {
    Http.get({
      url: `/api/metrics/team/${props.teamId} `,
      state: stateVariable,
    })
      .then((response: any) => {
        let responseSorted: ITeamMetricsDetails = response;
        responseSorted.config = sortAllConfigAttributes(responseSorted);
        responseSorted.metrics.forEach(
          (tool: IMetricsTool, toolIndex: number) => {
            responseSorted.metrics[toolIndex] = sortToolsAttributes(
              tool,
              responseSorted.config
            );
          }
        );
        setTeamMetricsTools(responseSorted);
        initializeListSettings(responseSorted.config);
        setFetchedData(true);
      })
      .catch((error: any) => {
        const perror = JSON.stringify(error);
        const object = JSON.parse(perror);
        if (object.code === 400) {
          setFailureMessage(object.apiError.msg);
          setFailure(true);
        } else if (object.code === 401) {
          props.history.push('/relogin');
        } else {
          props.history.push('/error');
        }
      });
  };

  function sortAllConfigAttributes(
    metricsDetails: ITeamMetricsDetails
  ): ICollectorConfigDetails {
    Object.keys(metricsDetails.config).forEach((key: string) => {
      metricsDetails.config[key].forEach(
        (toolConfig: ICollectorConfig, index: number) => {
          const toolConfigAttrSorted: any = {};
          const toolConfigAttrKeysSorted = Object.keys(
            toolConfig.attributes
          ).sort((a: any, b: any) => {
            if (
              toolConfig.attributes[a].position &&
              toolConfig.attributes[b].position &&
              toolConfig.attributes[a].position! >
                toolConfig.attributes[b].position!
            ) {
              return 1;
            } else if (
              toolConfig.attributes[a].position &&
              toolConfig.attributes[b].position &&
              toolConfig.attributes[a].position! <
                toolConfig.attributes[b].position!
            ) {
              return -1;
            } else {
              return toolConfig.attributes[a].displayName.toLowerCase() >
                toolConfig.attributes[a].displayName.toLowerCase()
                ? 1
                : -1;
            }
          });
          toolConfigAttrKeysSorted.forEach((el: string) => {
            toolConfigAttrSorted[el] = toolConfig.attributes[el];
          });
          metricsDetails.config[key][index].attributes = toolConfigAttrSorted;
        }
      );
    });
    return metricsDetails.config;
  }

  function sortToolsAttributes(
    tool: IMetricsTool,
    config: ICollectorConfigDetails
  ): IMetricsTool {
    let collector: any = {};
    for (let i = 0; i < config[tool.toolType].length; i++) {
      if (config[tool.toolType][i].name === tool.toolName) {
        collector = config[tool.toolType][i];
      }
    }
    const toolAttrSorted: IMetricsTool = {
      toolName: tool.toolName,
      toolType: tool.toolType,
    };
    Object.keys(collector.attributes).forEach((key: string) => {
      toolAttrSorted[key] = tool[key];
    });
    return toolAttrSorted;
  }

  const initializeListSettings = (colConfig: ICollectorConfigDetails) => {
    const tempSettings: { [i: string]: boolean } = {};
    Object.keys(colConfig).forEach(
      (key: string) => (tempSettings[key] = false)
    );
    setListSettings(tempSettings);
  };

  const handleSubmit = () => {
    if (validateDataBeforeSave()) {
      Http.post({
        url: `/api/metrics/team`,
        body: {
          orgId: teamMetricsTools.orgId,
          teamId: teamMetricsTools.teamId,
          metrics: teamMetricsTools.metrics,
        },
        state: stateVariable,
      })
        .then((response: any) => {
          setDataPosted(true);
        })
        .catch((error) => {
          const perror = JSON.stringify(error);
          const object = JSON.parse(perror);
          if (object.code === 400) {
            setFailureMessage(object.apiError.msg);
            setFailure(true);
          } else if (object.code === 401) {
            props.history.push('/relogin');
          } else {
            setFailureMessage(<Text tid='somethingWentWrong' />);
            setFailure(true);
          }
        });
    }
  };

  function validateDataBeforeSave(): boolean {
    //Check for all the mandatory fields for all tools are being set.
    let errorCount = 0;

    teamMetricsTools.metrics.forEach((tool: IMetricsTool) => {
      let collector: any = {};
      for (let i = 0; i < teamMetricsTools.config[tool.toolType].length; i++) {
        if (teamMetricsTools.config[tool.toolType][i].name === tool.toolName) {
          collector = teamMetricsTools.config[tool.toolType][i];
        }
      }
      Object.keys(tool).forEach((key: string) => {
        if (key !== 'toolName' && key !== 'toolType') {
          if (
            collector.attributes[key].mandatory &&
            (!tool[key].value ||
              (collector.attributes[key].type === 'multi-list' &&
                tool[key].value.length === 0) ||
              (collector.attributes[key].type !== 'multi-list' &&
                tool[key].value === ''))
          ) {
            setFailureMessage(
              <Text tid='mandatory.field.of.some.collector.tool.added.do.not.have.value.ensure.that.all.mandatory.fields.are.filled' />
            );
            setFailure(true);
            errorCount += 1;
          }
        }
      });
    });

    if (errorCount === 0) {
      return true;
    } else {
      return false;
    }
  }

  function validateDataBeforeConnect(tool: IMetricsTool): boolean {
    let errorCount = 0;

    let collector: any = {};
    for (let i = 0; i < teamMetricsTools.config[tool.toolType].length; i++) {
      if (teamMetricsTools.config[tool.toolType][i].name === tool.toolName) {
        collector = teamMetricsTools.config[tool.toolType][i];
      }
    }
    Object.keys(tool).forEach((key: string) => {
      if (key !== 'toolName' && key !== 'toolType') {
        if (
          (collector.attributes[key].type === 'string' ||
            collector.attributes[key].type === 'password') &&
          (!tool[key].value || tool[key].value === '')
        ) {
          setFailureMessage(
            <Text tid='fill.the.server.project.url.and.authentication.details.before.connecting' />
          );
          setFailure(true);
          errorCount += 1;
        }
      }
    });

    if (errorCount === 0) {
      return true;
    } else {
      return false;
    }
  }

  const handleConnect = (tool: IMetricsTool, toolIndex: number) => {
    if (validateDataBeforeConnect(tool)) {
      setIsConnecting(true);
      Http.post({
        url: `/api/metrics/connect`,
        body: {
          tool: tool,
        },
        state: stateVariable,
      })
        .then((response: any) => {
          setIsConnecting(false);
          if (response.connect) {
            setValidConnection('success');

            let temp: ITeamMetricsDetails = { ...teamMetricsTools };
            temp.metrics[toolIndex] = response.tool;
            temp.metrics[toolIndex].attributes = sortToolsAttributes(
              tool,
              teamMetricsTools.config
            );
            setTeamMetricsTools(temp);
          } else {
            setValidConnection('failed');
            setFailureMessage(
              <Text tid='connection.failed.check.the.server.project.url' />
            );
            setFailure(true);
          }
        })
        .catch((error) => {
          setIsConnecting(false);
          setValidConnection('failed');
          const perror = JSON.stringify(error);
          const object = JSON.parse(perror);
          if (object.code === 400) {
            setFailureMessage(object.apiError.msg);
            setFailure(true);
          } else if (object.code === 401) {
            props.history.push('/relogin');
          } else {
            setFailureMessage(<Text tid='somethingWentWrong' />);
            setFailure(true);
          }
        });
    }
  };

  const handleClose = () => {
    setFailure(false);
  };

  const handleBackButton = () => {
    props.goBack(MANAGE_TEAMS);
  };

  const modalNoClicked = () => {
    setDeleteToolIndex(-1);
    setOpenModal(false);
  };

  const modalYesClicked = () => {
    setOpenModal(false);
    deleteMetricsTool();
  };

  const handleAddButtonClick = () => {
    initializeListSettings(teamMetricsTools.config);
    setOpenToggle((prevOpen) => !prevOpen);
  };

  const handleClickShowPassword = () => {
    setValues({ ...values, showPassword: !values.showPassword });
  };

  const handleMouseDownPassword = (event: any) => {
    event.preventDefault();
  };

  const prevOpen = React.useRef(openToggle);
  React.useEffect(() => {
    if (prevOpen.current === true && openToggle === false) {
      anchorRef.current!.focus();
    }

    prevOpen.current = openToggle;
  }, [openToggle]);

  const handleChangeValue = (
    event: any,
    toolIndex: number,
    attrKey: string
  ) => {
    let temp: ITeamMetricsDetails = { ...teamMetricsTools };
    temp.metrics[toolIndex][attrKey].value = event.target.value;
    setTeamMetricsTools(temp);
  };

  const handleChangeMultiValue = (
    event: any,
    toolIndex: number,
    attrKey: string
  ) => {
    let temp: ITeamMetricsDetails = { ...teamMetricsTools };
    let valueArray = temp.metrics[toolIndex][attrKey].value || [];
    valueArray = [...event.target.value];
    temp.metrics[toolIndex][attrKey].value = valueArray;
    setTeamMetricsTools(temp);
  };

  const renderChips = (selected: any) => {
    return (
      <div className={classes.chips}>
        {(selected as string[]).map((value) => {
          const val = value.includes('Other:') ? 'Other' : value;
          return <Chip key={val} label={val} className={classes.chip} />;
        })}
      </div>
    );
  };

  const confirmAndDeleteTool = (event: any, toolIndex: number) => {
    event.stopPropagation();
    setDeleteToolIndex(toolIndex);
    setOpenModal(true);
  };

  const deleteMetricsTool = () => {
    if (deleteToolIndex >= 0) {
      let temp: ITeamMetricsDetails = { ...teamMetricsTools };
      temp.metrics.splice(deleteToolIndex, 1);
      setTeamMetricsTools(temp);
    }
  };

  const changeListSettings = (id: string) => {
    const tempSettings: { [i: string]: boolean } = { ...listSettings };
    tempSettings[id] = !tempSettings[id];
    setListSettings(tempSettings);
  };

  const handleAddMetricsSelect = (colType: string, colName: string) => {
    let collectorAttrs: IObjectConfigDetails = {};
    for (let i = 0; i < teamMetricsTools.config[colType].length; i++) {
      if (teamMetricsTools.config[colType][i].name === colName) {
        collectorAttrs = teamMetricsTools.config[colType][i].attributes;
      }
    }

    const newTool: IMetricsTool = { toolName: colName, toolType: colType };
    const attrKeys = Object.keys(collectorAttrs);
    for (let i = 0; i < attrKeys.length; i++) {
      newTool[attrKeys[i]] = {};
      newTool[attrKeys[i]].value =
        collectorAttrs[attrKeys[i]].type === 'multi-list' ? [] : '';
      if (
        collectorAttrs[attrKeys[i]].type === 'list' ||
        collectorAttrs[attrKeys[i]].type === 'list-no-others' ||
        collectorAttrs[attrKeys[i]].type === 'multi-list'
      ) {
        newTool[attrKeys[i]].options = [];
      }
    }

    let temp: ITeamMetricsDetails = { ...teamMetricsTools };
    temp.metrics.push(newTool);
    setTeamMetricsTools(temp);

    setOpenToggle(false);
  };

  const renderNoResultsFound = () => {
    return (
      <div className={classes.searchContainer}>
        <div className={classes.noResultsContainer}>No Tools are mapped.</div>
      </div>
    );
  };

  const renderAttribute = (
    tool: IMetricsTool,
    attrKey: string,
    toolIndex: number
  ) => {
    let collectorAttr: any = {};
    for (let i = 0; i < teamMetricsTools.config[tool.toolType].length; i++) {
      if (teamMetricsTools.config[tool.toolType][i].name === tool.toolName) {
        collectorAttr =
          teamMetricsTools.config[tool.toolType][i].attributes[attrKey];
      }
    }
    switch (collectorAttr.type) {
      case 'string':
        return (
          <TextField
            required={collectorAttr.mandatory}
            type='string'
            id={`${toolIndex}_${attrKey}`}
            name={`${toolIndex}_${attrKey}`}
            value={tool[attrKey].value}
            label={collectorAttr.displayName}
            onChange={(event: any) =>
              handleChangeValue(event, toolIndex, attrKey)
            }
            fullWidth
            autoComplete='off'
            className={classes.textField}
          />
        );
      case 'number':
        return (
          <div className={classes.numberInput}>
            <TextField
              required={collectorAttr.mandatory}
              type='number'
              id={`${toolIndex}_${attrKey}`}
              name={`${toolIndex}_${attrKey}`}
              value={tool[attrKey].value}
              label={collectorAttr.displayName}
              onChange={(event: any) =>
                handleChangeValue(event, toolIndex, attrKey)
              }
              fullWidth
              autoComplete='off'
              InputProps={{ disableUnderline: true }}
              className={classes.textField}
            />
          </div>
        );
      case 'password':
        return (
          <TextField
            required={collectorAttr.mandatory}
            type={values.showPassword ? 'text' : 'password'}
            id={`${toolIndex}_${attrKey}`}
            name={`${toolIndex}_${attrKey}`}
            value={tool[attrKey].value}
            label={collectorAttr.displayName}
            onChange={(event: any) =>
              handleChangeValue(event, toolIndex, attrKey)
            }
            fullWidth
            autoComplete='off'
            InputProps={{
              endAdornment: (
                <InputAdornment position='end'>
                  <IconButton
                    aria-label='toggle password visibility'
                    onClick={handleClickShowPassword}
                    onMouseDown={handleMouseDownPassword}
                  >
                    {values.showPassword ? <Visibility /> : <VisibilityOff />}
                  </IconButton>
                </InputAdornment>
              ),
              disableUnderline: true,
            }}
            className={classes.textField}
          />
        );
      case 'list':
      case 'list-no-others':
        return (
          <Fragment>
            <FormControl className={classes.formControl}>
              <InputLabel
                id='demo-simple-select-label'
                required={collectorAttr.mandatory}
              >
                {collectorAttr.displayName}
              </InputLabel>
              <Select
                id={`${toolIndex}_${attrKey}`}
                name={`${toolIndex}_${attrKey}`}
                value={tool[attrKey].value}
                onChange={(event: any) =>
                  handleChangeValue(event, toolIndex, attrKey)
                }
              >
                {tool[attrKey].options &&
                  tool[attrKey].options.map((opt: string) => {
                    return (
                      <MenuItem key={opt} value={opt}>
                        {opt}
                      </MenuItem>
                    );
                  })}
              </Select>
            </FormControl>
          </Fragment>
        );
      case 'multi-list':
        return (
          <Fragment>
            <FormControl className={classes.formControl}>
              <InputLabel
                id='demo-mutiple-chip-label'
                required={collectorAttr.mandatory}
              >
                {collectorAttr.displayName}
              </InputLabel>
              <Select
                id={`${toolIndex}_${attrKey}`}
                name={`${toolIndex}_${attrKey}`}
                multiple
                value={tool[attrKey].value}
                onChange={(event: any) =>
                  handleChangeMultiValue(event, toolIndex, attrKey)
                }
                input={<Input id='select-multiple-chip' />}
                renderValue={renderChips}
                MenuProps={MenuProps}
              >
                {tool[attrKey].options &&
                  tool[attrKey].options.map((opt: string) => (
                    <MenuItem key={opt} value={opt}>
                      {opt}
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>
          </Fragment>
        );
    }
  };

  const renderMetricsToolDetails = (tool: IMetricsTool, toolIndex: number) => {
    return (
      <ExpansionPanel defaultExpanded>
        <ExpansionPanelSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls='panel1c-content'
          id='panel1c-header'
          className={classes.nonHighlighted}
        >
          <div
            className={classes.smallColumn}
            style={{
              marginTop: '10px',
              cursor: 'pointer',
              textAlign: 'center',
            }}
          >
            <LightTooltip
              title='Delete this Metrics Tool'
              aria-label='delete this metrics tool'
            >
              <IconButton
                size='small'
                onClick={(event: any) => confirmAndDeleteTool(event, toolIndex)}
              >
                <ClearIcon />
              </IconButton>
            </LightTooltip>
          </div>
          <div className={classes.extraBigColumn} style={{ marginTop: '10px' }}>
            <Typography className={classes.heading}>{tool.toolName}</Typography>
          </div>
        </ExpansionPanelSummary>
        <ExpansionPanelDetails className={classes.detailsNonHighlighted}>
          <div style={{ display: 'block', width: '90%', marginLeft: '5%' }}>
            <Button
              className={classes.connectButton}
              variant='outlined'
              onClick={(event: any) => handleConnect(tool, toolIndex)}
            >
              <Text tid='connectServer' />
            </Button>
            {isConnecting && <Loader label='Connecting...' />}
            {validConnection === 'success' && (
              <Typography variant='h5' color='primary'>
                <Text tid='connectedSuccessfully' />
              </Typography>
            )}
            {validConnection === 'failed' && (
              <Typography variant='h5' color='secondary'>
                <Text tid='connectionFailed' />
              </Typography>
            )}
            {Object.keys(tool).map((attrKey: string, i: number) =>
              attrKey !== 'toolName' && attrKey !== 'toolType' ? (
                <div style={{ padding: '10px' }} key={i}>
                  {renderAttribute(tool, attrKey, toolIndex)}
                  <Typography
                    key={`${toolIndex}_${attrKey}`}
                    className={classes.helpText}
                  >
                    {teamMetricsTools.config[tool.toolType][toolIndex]
                      .attributes[attrKey].helpText
                      ? teamMetricsTools.config[tool.toolType][toolIndex]
                          .attributes[attrKey].helpText
                      : ''}
                  </Typography>
                </div>
              ) : (
                ''
              )
            )}
          </div>
        </ExpansionPanelDetails>
      </ExpansionPanel>
    );
  };

  const renderMetricsTools = () => {
    if (dataPosted) {
      return (
        <Fragment>
          <Success message={msgSuccess} />
          <div className={classes.bottomButtonsContainer}>
            <Button
              className={classes.backButton}
              variant='outlined'
              onClick={() => {
                props.goBack(MANAGE_TEAMS);
              }}
            >
              <Text tid='goBack' />
            </Button>
          </div>
        </Fragment>
      );
    }

    return (
      <Fragment>
        <div style={{ width: '100%', marginBottom: '20px' }}>
          <Grid container spacing={3}>
            <Grid item sm={4}>
              <Typography variant='h6' gutterBottom className={classes.title}>
                <Text tid='metricsToolsForTeam' /> {teamMetricsTools.teamName}
              </Typography>
            </Grid>
            <Grid item sm={4}></Grid>
            <Grid item sm={4} style={{ textAlign: 'center' }}>
              <ButtonGroup
                variant='contained'
                color='primary'
                ref={anchorRef}
                aria-label='split button'
                className={classes.title}
              >
                <Button
                  color='primary'
                  aria-controls={openToggle ? 'split-button-menu' : undefined}
                  aria-expanded={openToggle ? 'true' : undefined}
                  aria-label='select merge strategy'
                  aria-haspopup='menu'
                  onClick={handleAddButtonClick}
                  endIcon={
                    openToggle ? <ArrowDropUpIcon /> : <ArrowDropDownIcon />
                  }
                >
                  <Text tid='addMetricsTools' />
                </Button>
              </ButtonGroup>
              <Popper
                open={openToggle}
                anchorEl={anchorRef.current}
                role={undefined}
                placement={'bottom-start'}
                transition
              >
                {({ TransitionProps }) => (
                  <Grow {...TransitionProps}>
                    <Paper style={{ width: '133%' }}>
                      <List style={{ color: '#000' }}>
                        {Object.keys(teamMetricsTools.config).map(
                          (colKey: string) => (
                            <Fragment key={colKey}>
                              <ListItem
                                button
                                onClick={() => changeListSettings(colKey)}
                                style={{ textAlign: 'left' }}
                              >
                                <ListItemText inset primary={colKey} />
                                {listSettings[colKey] ? (
                                  <ArrowDropUpIcon />
                                ) : (
                                  <ArrowDropDownIcon />
                                )}
                              </ListItem>
                              <Collapse
                                in={listSettings[colKey]}
                                timeout='auto'
                                unmountOnExit
                              >
                                <List
                                  disablePadding
                                  style={{ fontSize: '8px' }}
                                >
                                  {teamMetricsTools.config[colKey].map(
                                    (
                                      collector: ICollectorConfig,
                                      colIndex: number
                                    ) => (
                                      <ListItem
                                        key={colIndex}
                                        button
                                        onClick={() =>
                                          handleAddMetricsSelect(
                                            colKey,
                                            collector.name
                                          )
                                        }
                                        style={{ fontSize: '8px' }}
                                      >
                                        <ListItemText
                                          inset
                                          primary={collector.name}
                                          style={{
                                            fontSize: '8px',
                                            marginLeft: '8px',
                                          }}
                                        />
                                      </ListItem>
                                    )
                                  )}
                                </List>
                              </Collapse>
                              <Divider />
                            </Fragment>
                          )
                        )}
                      </List>
                    </Paper>
                  </Grow>
                )}
              </Popper>
            </Grid>
          </Grid>
        </div>
        {teamMetricsTools.metrics.length === 0 ? (
          <Fragment>{renderNoResultsFound()}</Fragment>
        ) : (
          <Fragment>
            {teamMetricsTools.metrics.map((tool: IMetricsTool, i: number) => {
              return (
                <div key={i} className={classes.rootp}>
                  {renderMetricsToolDetails(tool, i)}
                </div>
              );
            })}
          </Fragment>
        )}
        <div className={classes.bottomButtonsContainer}>
          <Button
            className={classes.backButton}
            variant='outlined'
            onClick={handleBackButton}
          >
            <Text tid='goBack' />
          </Button>
          <Button
            className={classes.submitButton}
            onClick={handleSubmit}
            variant='outlined'
          >
            <Text tid='save' />
          </Button>
        </div>
        <Snackbar
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
          open={failure}
          onClose={handleClose}
          autoHideDuration={9000}
        >
          <SnackbarContent
            style={{ backgroundColor: '#dd0000' }}
            message={msgFailure}
          />
        </Snackbar>
        <ModalComponent
          message={'collectorAttributePermanentDeletionWarning'}
          openModal={openModal}
          handleModalYesClicked={modalYesClicked}
          handleModalNoClicked={modalNoClicked}
        />
      </Fragment>
    );
  };

  return (
    <Fragment>
      <div className={classes.root}>
        {fetchedData ? (
          <Fragment>{renderMetricsTools()}</Fragment>
        ) : (
          <Container className={classes.loader}>
            <Loader />
          </Container>
        )}
      </div>
    </Fragment>
  );
};

export default withRouter(MapMetricsTools);
