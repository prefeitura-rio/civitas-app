import {
  Card,
  Grid,
  Button,
  Box,
  TextField,
  FormControl,
  Slide,
} from "@mui/material";
import React, { useEffect, useRef, useState } from "react";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import DeckGL from "@deck.gl/react";
import { Map } from "react-map-gl";
import { TextLayer, IconLayer } from "@deck.gl/layers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { useDispatch } from "react-redux";
import { loadCarsPath } from "../../redux/cars/actions";
import Fab from "@mui/material/Fab";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import {
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import { parseISO, format } from "date-fns";
import icon_atlas from "../../assets/icon-atlas.png";
import { formatLocation } from "../../utils/formaatLocation";

const CercoDigital = ({ cars, loading }) => {
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
  const [placa, setPlaca] = useState(null);
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

  useEffect(() => {
    if (cars && !selectedTrip) {
      console.log('loaded first')
      setSelectedTrip(cars[0])
      
    }
    if (cars && !loading) {
      console.log("loaded new")
      // selectedTrip(cars[0])
      setData({
        locationsChunks: cars[0].locations,
        polylineChunks: cars[0].polyline,
      });
    }
  }, [cars, loading])

  const formatDateTime = (date) => {
    return date.toISOString().slice(0, 16); // Format as YYYY-MM-DDTHH:mm
  };

  const formatDateTimeInfo = (dateTime) => {
    const date = parseISO(dateTime);
    return {
      date: format(date, "dd/MM/yy"),
      time: format(date, "HH:mm"),
    };
  };

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

  const LeftSideComponent = () => {
    return (
      <Card
        sx={{
          mt: -1,
          backgroundColor: "black",
          height: "70vh",
          position: "relative",
          overflowY: "auto",
          "&::-webkit-scrollbar": {
            display: "none",
          },
          // minWidth: '400px',
        }}
      >
        <List>
          {data.locationsChunks.flat().map((item, index) => {
            const {location, direction, lane} = formatLocation(item.localidade)

            return (
              <ListItem
                key={index}
                sx={{
                  mb: 2,
                  backgroundColor: "#1F1F1F",
                  borderRadius: "20px",
                  padding: 2,
                }}
              >
                <ListItemIcon
                  sx={{ display: "flex", justifyContent: "flex-start" }}
                >
                  <Box
                    sx={{
                      width: 32,
                      height: 32,
                      backgroundColor: "#23C1F1",
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Typography
                      sx={{ color: "white", fontSize: 16, fontWeight: "bold" }}
                    >
                      {index + 1}
                    </Typography>
                  </Box>
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Box
                      sx={{
                        maxWidth: "150px",
                        display: "flex",
                        flexDirection: "column",
                        ml: 0,
                      }}
                    >
                      <Typography
                        sx={{ color: "#707070", pb: 0.5, fontSize: "15px" }}
                      >
                        Localização
                      </Typography>
                      <Typography
                        sx={{
                          pb: 0.5,
                          lineHeight: "13px",
                          fontWeight: "bold",
                          fontSize: "12px",
                          color: "white",
                        }}
                      >
                        {location}
                      </Typography>
                      <Typography sx={{ fontSize: "11px", color: "#707070" }}>
                        {/* Sentido: {item.direction} */}
                        Sentido: {direction}
                      </Typography>
                      <Typography sx={{ fontSize: "11px", color: "#707070" }}>
                        {/* Sentido: {item.direction} */}
                        Faixa: {lane}
                      </Typography>
                    </Box>
                  }
                />
                <ListItemText
                  primary={
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "flex-start",
                        ml: 1,
                      }}
                    >
                      <Typography sx={{ color: "#707070", fontSize: "15px" }}>
                        Data
                      </Typography>
                      <Typography variant="body2" sx={{ color: "white" }}>
                        {formatDateTimeInfo(item.datahora).date}
                      </Typography>
                    </Box>
                  }
                />
                <ListItemText
                  primary={
                    <Box
                      sx={{ display: "flex", flexDirection: "column", ml: 1 }}
                    >
                      <Typography sx={{ color: "#707070", fontSize: "15px" }}>
                        Hora
                      </Typography>
                      <Typography variant="body2" sx={{ color: "white" }}>
                        {formatDateTimeInfo(item.datahora).time}
                      </Typography>
                    </Box>
                  }
                />
              </ListItem>
            )
          })}
        </List>
      </Card>
    );
  };

  // Function to calculate the bearing between two points
  const calculateBearing = (start, end) => {
    const startLat = start[1] * (Math.PI / 180);
    const startLng = start[0] * (Math.PI / 180);
    const endLat = end[1] * (Math.PI / 180);
    const endLng = end[0] * (Math.PI / 180);

    const dLng = endLng - startLng;
    const x = Math.sin(dLng) * Math.cos(endLat);
    const y =
      Math.cos(startLat) * Math.sin(endLat) -
      Math.sin(startLat) * Math.cos(endLat) * Math.cos(dLng);
    const bearing = Math.atan2(x, y) * (180 / Math.PI);
    const bearingDegrees = (bearing + 360) % 360; // Normalize to 0-360 degrees

    return bearingDegrees - 180;
  };

  // Update getPointLayerData to include bearing and correct index
  const getPointLayerData = () => {
    const features = data.locationsChunks
      .flat()
      .map((location, index, array) => {
        const nextLocation = array[index + 1]
          ? [array[index + 1].longitude, array[index + 1].latitude]
          : null;
        const bearing = nextLocation
          ? calculateBearing(
              [location.longitude, location.latitude],
              nextLocation
            )
          : 0;

        return {
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
            index: index, // Set index based on position in array
            bearing: bearing,
          },
        };
      });

    return {
      type: "FeatureCollection",
      features: features,
    };
  };

  // Assuming icon_atlas has an arrow icon at the specified coordinates
  const ICON_MAPPING = {
    arrow: { x: 0, y: 0, width: 128, height: 128, mask: true },
  };

  let pointLayerData = getPointLayerData();

  // Filter unique points as before
  const uniquePoints = {};
  pointLayerData.features = pointLayerData.features.filter((feature) => {
    const key = feature.geometry.coordinates.join(",");
    if (!uniquePoints[key]) {
      uniquePoints[key] = true;
      return true;
    }
    return false;
  });

  layers.push(
    new IconLayer({
      id: "icon-layer",
      data: pointLayerData.features,
      pickable: true,
      iconAtlas: icon_atlas,
      iconMapping: ICON_MAPPING,
      getIcon: (d) => "arrow",
      getSize: (d) => 50,
      getAngle: (d) => 360 - d.properties.bearing, // Rotate icon based on bearing
      getPosition: (d) => d.geometry.coordinates,
      onHover: (info) => setHoverInfo(info),
    }),
    new TextLayer({
      id: "text-layer",
      data: pointLayerData.features,
      pickable: true,
      getPosition: (d) => d.geometry.coordinates,
      getText: (d) => String(d.properties.index + 1),
      getSize: 25,
      getColor: [255, 255, 255, 255],
      onHover: (info) => setHoverInfo(info),
    })
  );

  return (
    <Grid container spacing={2} style={{ marginTop: 50 }}>
      <Grid item xs={12}>
        <Card
          elevation={0}
          sx={{
            backgroundColor: "transparent",
            height: "50px",
            display: "flex",
            alignItems: "center",
          }}
        >
          <Box display="flex" gap={1} justifyContent="flex-start">
            <TextField
              sx={{
                "& fieldset": { border: "none" },
                backgroundColor: "white",
                borderRadius: "20px",
              }}
              placeholder="Placa"
              size="small"
              value={placa}
              onChange={(e) => setPlaca(e.target.value)}
            />
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <input
                type="datetime-local"
                value={startDate}
                onChange={(event) => setStartDate(event.target.value)}
                style={{
                  fontSize: "15px",
                  border: "none",
                  padding: "10px",
                  borderRadius: "20px",
                }}
              />
              <input
                type="datetime-local"
                value={endDate}
                onChange={(event) => setEndDate(event.target.value)}
                style={{
                  fontSize: "15px",
                  border: "none",
                  padding: "10px",
                  borderRadius: "20px",
                }}
              />
            </LocalizationProvider>
            {cars && (
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <Select
                  sx={{
                    "& fieldset": { border: "none" },
                    backgroundColor: "white",
                    borderRadius: "20px",
                  }}
                  displayEmpty
                  defaultValue={0}
                  onChange={handleTripSelect}
                  MenuProps={{ style: { marginTop: "10px" } }}
                >
                  {cars &&
                    cars.map((_, index) => (
                      <MenuItem key={index} value={index}>
                        {`Viagem ${index + 1}`}
                      </MenuItem>
                    ))}
                </Select>
              </FormControl>
            )}
          </Box>
          <Box display="flex" gap={1} justifyContent="flex-end" flexGrow={1}>
            <Button
              variant="contained"
              sx={{
                backgroundColor: "grey",
                borderRadius: "20px",
                "&:hover": {
                  backgroundColor: "#23C1F1",
                },
              }}
              onClick={() => 
                dispatch(loadCarsPath({ placa, startDate, endDate }))
              }
            >
              Fazer Pesquisa
            </Button>
          </Box>
        </Card>
      </Grid>
      <Slide
        direction="up"
        in={selectedTrip}
        mountOnEnter
        // unmountOnExit
        timeout={1000}
      >
        <Grid item xs={4}>
          <Card
            sx={{
              backgroundColor: "black",
              height: "70vh",
              position: "relative",
            }}
          >
            <LeftSideComponent />
          </Card>
        </Grid>
      </Slide>
      <Grid item xs={selectedTrip ? 8 : 12}>
        <Card
          sx={{ borderRadius: "20px", height: "70vh", position: "relative" }}
        >
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
              mapStyle="mapbox://styles/mapbox/streets-v12"
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
                        <strong>{key === "index" ? "índice" : key}: </strong>
                        {key === "index"
                          ? Number(hoverInfo.object.properties[key]) + 1
                          : hoverInfo.object.properties[key]}
                      </div>
                    ))}
                </div>
              </div>
            )}
          </DeckGL>
          <Fab
            size="medium"
            aria-label="zoom in"
            sx={{
              color: "white",
              position: "absolute",
              bottom: 77,
              right: 16,
            }}
            style={{ backgroundColor: "rgba(0, 0, 0, 0.9)" }}
            onClick={() =>
              setViewport((prevState) => ({
                ...prevState,
                zoom: prevState.zoom + 1,
              }))
            }
          >
            <AddIcon />
          </Fab>
          <Fab
            size="medium"
            aria-label="zoom out"
            sx={{
              color: "white",
              position: "absolute",
              bottom: 16,
              right: 16,
            }}
            style={{ backgroundColor: "rgba(0, 0, 0, 0.9)" }}
            onClick={() =>
              setViewport((prevState) => ({
                ...prevState,
                zoom: prevState.zoom - 1,
              }))
            }
          >
            <RemoveIcon />
          </Fab>
        </Card>
      </Grid>
    </Grid>
  );
};

export default CercoDigital;
