import { Card, Grid, Button, ButtonGroup, Box, ThemeProvider, TextField, FormControl, InputLabel, Tooltip } from '@mui/material'
import React, { useEffect, useRef, useState } from 'react'
import { theme } from '../..'
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import DeckGL from "@deck.gl/react";
import { Map } from "react-map-gl";
import { GeoJsonLayer } from "@deck.gl/layers";
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
const CercoDigital = ({ cars }) => {

  const [hoverInfo, setHoverInfo] = useState(null);

  const mapRef = useRef();

  const [viewport, setViewport] = useState({
    longitude: -43.50398,
    latitude: -22.92957,
    zoom: 10.3,
  });

  const getLineLayerData = () => {
    if (selectedTrip !== null) {

      return {
        type: "FeatureCollection",
        features: cars.polylineChunksGeojson[selectedTrip],
      };

    } else {
      return {
        type: "FeatureCollection",
        features: cars.polylineChunksGeojson.flat(),
      };
    }
  };

  const getPointLayerData = () => {
    if (selectedTrip !== null) {
      return {
        type: "FeatureCollection",
        features: cars.locationsChunksGeojson[selectedTrip]
          .flat()
          .map((chunk) => chunk.features)
          .flat(),
      }
    } else {
      return {
        type: "FeatureCollection",
        features: cars.locationsChunksGeojson
          .flat()
          .map((chunk) => chunk.features)
          .flat(),
      };
    }
  };

  const layers = [];

  const dispatch = useDispatch();

  const [placa, setPlaca] = useState("");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [selectedTrip, setSelectedTrip] = useState(null);

  useEffect(() => {
    // Set initial values
    const now = new Date();

    const nowBr = new Date(now.getTime() - 3 * 60 * 60 * 1000);

    const fiveDaysAgo = new Date(nowBr.getTime() - 5 * 24 * 60 * 60 * 1000);

    setPlaca("SQZ8B08");
    setStartDate(formatDateTime(fiveDaysAgo));
    setEndDate(formatDateTime(nowBr));
  }, []);

  const formatDateTime = (date) => {
    return date.toISOString().slice(0, 16); // Format as YYYY-MM-DDTHH:mm
  };

  if (cars?.polylineChunksGeojson) {
    layers.push(
      new GeoJsonLayer({
        id: "geojson-line-layer",
        data: getLineLayerData(),
        pickable: true,
        stroked: true,
        filled: true,
        lineWidthScale: 2,
        lineWidthMinPixels: 2,
        getLineColor: [255, 255, 255, 255],
        getRadius: 100,
        getLineWidth: 5,
        getElevation: 30,
        onHover: setHoverInfo,
      })
    );
  }

  if (cars?.locationsChunksGeojson) {
    layers.push(
      new GeoJsonLayer({
        id: "geojson-point-layer",
        data: getPointLayerData(),
        pickable: true,
        stroked: false,
        filled: true,
        getFillColor: (d, { index }) => {
          const features = getPointLayerData().features;
          if (index === 0) {
            return [0, 255, 0, 200]; // Verde para o primeiro ponto
          } else if (index === features.length - 1) {
            return [255, 0, 0, 200]; // Vermelho para o último ponto
          } else {
            return [255, 165, 0, 200]; // Laranja para os demais pontos
          }
        },
        getRadius: (d, { index }) => {
          const features = getPointLayerData().features;
          if (index === 0 || index === features.length - 1) {
            return 6; // 2x o tamanho dos demais pontos
          } else {
            return 2; // Tamanho normal para os demais pontos
          }
        },
        pointRadiusMinPixels: 2,
        pointRadiusScale: 40,
        onHover: setHoverInfo,
      })
    );
  }

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
              {/* <DatePicker
                value={startDate}
                onChange={(newValue) => setStartDate(newValue)}
                renderInput={(params) => <TextField {...params} size="small" />}
                sx={{ '& .MuiInputBase-root': { height: '40px' } }}
              /> */}
              {/* <DatePicker
                value={endDate}
                onChange={(newValue) => setEndDate(newValue)}
                renderInput={(params) => <TextField {...params} size="small" />}
                sx={{ '& .MuiInputBase-root': { height: '40px' } }}
              /> */}
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
  value={selectedTrip}
  onChange={(event) => setSelectedTrip(event.target.value)}
  MenuProps={{ style: { marginTop: '10px' } }}
>
  {cars.polylineChunksGeojson &&
    cars.polylineChunksGeojson.map((_, index) => (
      <MenuItem key={index} value={index}>
        <Tooltip title={`Bairro Inicial: ${cars.locationsChunksGeojson[index][0].features[0].properties.bairro_inicial} - Bairro Final: ${cars.locationsChunksGeojson[index][0].features[0].properties.bairro_final}`}>
          {index}° viagem
        </Tooltip>
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
      <Grid item xs={12}>
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
              mapStyle="mapbox://styles/escritoriodedados/clgfevcvc009101p9ax017bah"
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
                  {Object.keys(hoverInfo.object.properties).map((key) => (
                    <div key={key}>
                      <strong>{key}: </strong>
                      {hoverInfo.object.properties[key]}
                    </div>
                  ))}
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
    </Grid>
  )
}

export default CercoDigital