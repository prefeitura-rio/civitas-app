import { Card, Grid, Button, ButtonGroup, Box, ThemeProvider, TextField, FormControl, InputLabel, Grow, Slide } from '@mui/material'
import React, { useEffect, useRef, useState } from 'react'
import { theme } from '../..'
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import DeckGL from "@deck.gl/react";
import { Map, } from "react-map-gl";
import { GeoJsonLayer, TextLayer, IconLayer } from "@deck.gl/layers";
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { useDispatch } from 'react-redux';
import { loadCarsPath } from '../../redux/cars/actions';
import Fab from '@mui/material/Fab';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import { Warning as WarningIcon } from '@mui/icons-material';
import { Typography, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import { parseISO, format } from 'date-fns';
import icon_atlas from '../../assets/icon-atlas.png';
// import pin from '../../assets/pin.svg';
const CercoDigital = ({ cars }) => {

  const mapRef = useRef();

  const [viewport, setViewport] = useState({
    longitude: -43.50398,
    latitude: -22.92957,
    zoom: 10.3,
  });

  const layers = [];

  const dispatch = useDispatch();

  const [data, setData] = useState({
    locationsChunks: [],
    polylineChunks: [],
  });

  const [hoverInfo, setHoverInfo] = useState(null);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [placa, setPlaca] = useState("SQZ8B08");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  useEffect(() => {
    // Set initial values
    const now = new Date();

    const nowBr = new Date(now.getTime() - 3 * 60 * 60 * 1000);

    const fiveDaysAgo = new Date(nowBr.getTime() - 5 * 24 * 60 * 60 * 1000);

    setStartDate(formatDateTime(fiveDaysAgo));
    setEndDate(formatDateTime(nowBr));
  }, []);

  const formatDateTime = (date) => {
    return date.toISOString().slice(0, 16); // Format as YYYY-MM-DDTHH:mm
  };

  const formatDateTimeInfo = (dateTime) => {
    const date = parseISO(dateTime);
    return {
      date: format(date, 'dd/MM/yy'),
      time: format(date, 'HH:mm'),
    };
  }

  const handleTripSelect = (event) => {
    const selectedTripIndex = event.target.value;
    setSelectedTrip(cars[selectedTripIndex]);
  };

  useEffect(() => {
    if (selectedTrip) {
      // Update data and layers based on the selected trip
      const locations = selectedTrip.locations;
      const polyline = selectedTrip.polyline;

      setData({
        locationsChunks: locations,
        polylineChunks: polyline,
      });
    }
  }, [selectedTrip]);

  const getPointLayerData = () => {
    return {
      type: "FeatureCollection",
      features: data.locationsChunks.flat().map((location) => ({
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [location.longitude, location.latitude],
        },
        properties: {
          datahora: location.datahora,
          camera_numero: location.camera_numero,
          bairro: location.bairro,
          localidade: location.localidade,
          index: location.index
        },
      })),
    };
  };


  const RightSideComponent = () => {
    return (
      <Card sx={{
        mt: -1,
        backgroundColor: "black",
        height: "70vh",
        position: "relative",
        overflowY: "auto",
        '&::-webkit-scrollbar': {
          display: 'none'
        }
      }}>

        <List>
          {data.locationsChunks.flat().map((item, index) => (
            <ListItem key={index} sx={{ mb: 2, backgroundColor: '#1F1F1F', borderRadius: '20px', padding: 2 }}>
              <ListItemIcon sx={{ display: 'flex', justifyContent: 'flex-start' }}>
                <Box sx={{
                  width: 32, height: 32, backgroundColor: '#23C1F1', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <Typography sx={{ color: 'white', fontSize: 16, fontWeight: 'bold' }}>{index + 1}</Typography>
                </Box>
              </ListItemIcon>
              <ListItemText
                primary={
                  <Box sx={{ maxWidth: "150px", display: 'flex', flexDirection: 'column', ml: 0 }}>
                    <Typography sx={{ color: '#707070', pb: 0.5, fontSize: "15px" }}>Localização</Typography>
                    <Typography sx={{ pb: 0.5, lineHeight: "13px", fontWeight: "bold", fontSize: "12px", color: 'white' }}>
                      {item.localidade}
                    </Typography>
                    <Typography sx={{ fontSize: "11px", color: 'white' }}>
                      {/* Sentido: {item.direction} */}
                      Sentido: {item.sentido}
                    </Typography>
                  </Box>
                }
              />
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', ml: 1 }}>
                    <Typography sx={{ color: '#707070', fontSize: "15px" }}>Data</Typography>
                    <Typography variant="body2" sx={{ color: 'white' }}>
                      {formatDateTimeInfo(item.datahora).date}
                    </Typography>
                  </Box>
                }
              />
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', flexDirection: 'column', ml: 1 }}>
                    <Typography sx={{ color: '#707070', fontSize: "15px" }}>Hora</Typography>
                    <Typography variant="body2" sx={{ color: 'white' }}>
                      {formatDateTimeInfo(item.datahora).time}

                    </Typography>
                  </Box>
                }
              />
            </ListItem>
          ))}
        </List>

      </Card>
    );
  };


  const ICON_MAPPING = {
    marker: { x: 0, y: 0, width: 128, height: 128, mask: true }
  };

  let pointLayerData = getPointLayerData();
  // TODO: Validar isso
  // filtra pontos com mesma coordenada
  // impede overlap de pontos no mapa
  const uniquePoints = {};
  pointLayerData.features = pointLayerData.features.filter((feature) => {
    const key = feature.geometry.coordinates.join(',');
    if (!uniquePoints[key]) {
      uniquePoints[key] = true;
      return true;
    }
    return false;
  });

  console.log({pointLayerData})

  layers.push(
    new IconLayer({
      id: 'icon-layer',
      data: pointLayerData.features,
      pickable: true,
      iconAtlas: icon_atlas,
      iconMapping: ICON_MAPPING,
      getIcon: d => 'marker',
      getSize: d => 50,
      // getColor: d => [35, 193, 241, 255],
      getPosition: d => d.geometry.coordinates,
      onHover: (info) => setHoverInfo(info),
    }),
    new TextLayer({
      id: 'text-layer',
      data: pointLayerData.features,
      pickable: true,
      getPosition: d => d.geometry.coordinates,
      getText: d => String(d.properties.index + 1),
      getSize: 25,
      getColor: [255, 255, 255, 255],
      onHover: (info) => setHoverInfo(info),
    })
  );


  return (
    <Grid container spacing={2} style={{ marginTop: 50 }}>
      <Grid item xs={12}>
        <Card elevation={0} sx={{ backgroundColor: "transparent", height: "50px", display: 'flex', alignItems: "center" }}>
          <Box display="flex" gap={1} justifyContent="flex-start">
            <TextField sx={{
              "& fieldset": { border: 'none' },
              backgroundColor: 'white',
              borderRadius: '20px',

            }} placeholder="Placa" size="small" value={placa} onChange={(e) => setPlaca(e.target.value)} />
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <input
                type="datetime-local"
                value={startDate}
                onChange={(event) => setStartDate(event.target.value)}
                style={{ fontSize: "15px", border: 'none', padding: '10px', borderRadius: '20px' }}
              />
              <input
                type="datetime-local"
                value={endDate}
                onChange={(event) => setEndDate(event.target.value)}
                style={{ fontSize: "15px", border: 'none', padding: '10px', borderRadius: '20px' }}
              />
            </LocalizationProvider>
            {cars &&
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <Select
                  sx={{
                    "& fieldset": { border: 'none' },
                    backgroundColor: 'white',
                    borderRadius: '20px',
                  }}
                  displayEmpty
                  onChange={handleTripSelect}
                  MenuProps={{ style: { marginTop: '10px' } }}
                >
                  {cars &&
                    cars.map((_, index) => (
                      <MenuItem key={index} value={index}>
                        {`Trip ${index + 1}`}
                      </MenuItem>
                    ))}
                </Select>
              </FormControl>
            }
          </Box>
          <Box display="flex" gap={1} justifyContent="flex-end" flexGrow={1}>
            <Button variant="contained" sx={{
              backgroundColor: "grey", borderRadius: "20px", '&:hover': {
                backgroundColor: '#23C1F1',
              }
            }} onClick={() => dispatch(loadCarsPath({ placa, startDate, endDate }))} >Fazer Pesquisa</Button>
          </Box>
        </Card>
      </Grid>
      <Grid item xs={selectedTrip?9:12}>
        <Card sx={{ borderRadius: "20px", height: "70vh", position: "relative" }}>
          <DeckGL
            ref={mapRef}
            initialViewState={viewport}
            controller={true}
            onViewStateChange={({ viewState }) => {
              setViewport(viewState);
            }}
            layers={layers}
            style={{ position: "relative", height: "calc(100vh - 100px)" }} // Adjust map height
          >
            <Map
              style={{ width: "100%", height: "100%" }}
              mapStyle="mapbox://styles/escritoriodedados/clvzlhsfw07gp01peebd0dufr"
              mapboxAccessToken="pk.eyJ1IjoiZXNjcml0b3Jpb2RlZGFkb3MiLCJhIjoiY2t3bWdmcHpjMmJ2cTJucWJ4MGQ1Mm1kbiJ9.4hHJX-1pSevYoBbja7Pq4w"
            />
            {hoverInfo && hoverInfo.object && (
              <div
                style={{
                  position: "absolute",
                  zIndex: 1,
                  pointerEvents: "none",
                  left: hoverInfo.x,
                  top: hoverInfo.y,
                  backgroundColor: "white",
                  padding: "5px",
                  borderRadius: "3px",
                  boxShadow: "0 2px 5px rgba(0, 0, 0, 0.3)",
                }}
              >
                <div>
                  {Object.keys(hoverInfo.object.properties)
                    // .filter(key => key !== 'index')
                    .map((key) => (
                      <div key={key}>
                        <strong>{key === 'index' ? 'índice' : key}: </strong>
                        {key === 'index' ? Number(hoverInfo.object.properties[key]) + 1 : hoverInfo.object.properties[key]}
                      </div>
                    ))
                  }
                </div>
              </div>
            )}
          </DeckGL>
          <Fab size="medium" aria-label="zoom in" sx={{ color: "white", position: 'absolute', bottom: 77, right: 16 }} style={{ backgroundColor: 'rgba(0, 0, 0, 0.9)' }} onClick={() => setViewport(prevState => ({ ...prevState, zoom: prevState.zoom + 1 }))}>
            <AddIcon />
          </Fab>
          <Fab size="medium" aria-label="zoom out" sx={{ color: "white", position: 'absolute', bottom: 16, right: 16 }} style={{ backgroundColor: 'rgba(0, 0, 0, 0.9)' }} onClick={() => setViewport(prevState => ({ ...prevState, zoom: prevState.zoom - 1 }))}>
            <RemoveIcon />
          </Fab>
        </Card>
      </Grid>
      <Slide direction="up" in={selectedTrip} mountOnEnter unmountOnExit timeout={1000}>
      <Grid item xs={3}>
        <Card sx={{ backgroundColor: "black", height: "70vh", position: "relative" }}>
          <RightSideComponent />
        </Card>
      </Grid>
      </Slide>
    </Grid>
  )
}

export default CercoDigital