import React from 'react'
import { AppBar, Toolbar, Button, Typography, Divider } from '@mui/material';
import SportsSoccerIcon from '@mui/icons-material/SportsSoccer';
import { CAMERAS_UNDER_APP_BAR, HOME_UNDER_APP_BAR, MAPAS_UNDER_APP_BAR, PROTOCOLOS_UNDER_APP_BAR, CERCO_DIGITAL_UNDER_APP_BAR, LOGIN_UNDER_APP_BAR } from '../../redux/active/actions';
import civitas_icon from '../../assets/civitas_icon.png';
const AppBarNav = ({ setActiveUnderAppBar }) => {
  return (
    <AppBar style={{ backgroundColor: 'black' }}>  {/* <AppBar position="static"> */}
      <Toolbar>
        <img src={civitas_icon} alt="Logo" style={{ width: 'auto', height: '30px' }} />
        <Divider orientation="vertical" style={{ marginLeft: 40, marginRight: 40, height: '33px', width: '6px', backgroundColor: '#23C1F1' }} />
        <Typography variant="h6" style={{ color: 'white' }}>DISQUE DENÚNCIA</Typography>
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

