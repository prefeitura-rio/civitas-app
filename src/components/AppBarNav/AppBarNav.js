import React from 'react'
import { AppBar, Toolbar, Button, Typography } from '@mui/material';
import SportsSoccerIcon from '@mui/icons-material/SportsSoccer';
import { CAMERAS_UNDER_APP_BAR, HOME_UNDER_APP_BAR, MAPAS_UNDER_APP_BAR, PROTOCOLOS_UNDER_APP_BAR, CERCO_DIGITAL_UNDER_APP_BAR, LOGIN_UNDER_APP_BAR } from '../../redux/active/actions';

const AppBarNav = ({setActiveUnderAppBar}) => {
  return (
    <AppBar >  {/* <AppBar position="static"> */}
        <Toolbar>
            <SportsSoccerIcon />
            <Typography variant="h6" style={{ marginLeft: 10 }}>CIVITAS</Typography>
          <div style={{ marginLeft: 'auto' }}>
            {/* <Button color="inherit" onClick={() => setActiveUnderAppBar(HOME_UNDER_APP_BAR)}>Home</Button>
            <Button color="inherit" onClick={() => setActiveUnderAppBar(CAMERAS_UNDER_APP_BAR)}>Câmeras</Button>
            <Button color="inherit" onClick={() => setActiveUnderAppBar(MAPAS_UNDER_APP_BAR)}>Mapas</Button>
            <Button color="inherit" onClick={() => setActiveUnderAppBar(PROTOCOLOS_UNDER_APP_BAR)}>Protocolos</Button> */}
            <Button color="inherit" onClick={() => setActiveUnderAppBar(CERCO_DIGITAL_UNDER_APP_BAR)}>Cerco Digital</Button>
            <Button color="inherit" onClick={() => setActiveUnderAppBar(LOGIN_UNDER_APP_BAR)}>Login</Button>
          </div>
        </Toolbar>
      </AppBar>
  )
}

export default AppBarNav

