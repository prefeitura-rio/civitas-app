import React from 'react'
import { AppBar, Toolbar, Button, Typography, Divider, Box } from '@mui/material';
import SportsSoccerIcon from '@mui/icons-material/SportsSoccer';
import { CAMERAS_UNDER_APP_BAR, HOME_UNDER_APP_BAR, MAPAS_UNDER_APP_BAR, PROTOCOLOS_UNDER_APP_BAR, CERCO_DIGITAL_UNDER_APP_BAR, LOGIN_UNDER_APP_BAR } from '../../redux/active/actions';
import civitas_icon from '../../assets/civitas_icon.png';
const AppBarNav = ({ setActiveUnderAppBar, activeUnderAppBar }) => {
  return (
    <AppBar style={{ backgroundColor: 'black' }}>  {/* <AppBar position="static"> */}
      <Toolbar>
        <img src={civitas_icon} alt="Logo" style={{ width: 'auto', height: '30px' }} />
        <Divider orientation="vertical" style={{ marginLeft: 40, marginRight: 40, height: '33px', width: '6px', backgroundColor: '#23C1F1' }} />
        <Typography variant="h6" style={{ color: 'white' }}>DISQUE DENÚNCIA</Typography>
        <div style={{ marginLeft: 'auto' }}>
          <Button
            style={activeUnderAppBar === CERCO_DIGITAL_UNDER_APP_BAR ? { backgroundColor: 'grey', borderRadius: '20px' } : {}}
            color="inherit"
            onClick={() => setActiveUnderAppBar(CERCO_DIGITAL_UNDER_APP_BAR)}
            sx={{ paddingLeft:"15px",paddingRight:"15px"}}
          >
            {activeUnderAppBar === CERCO_DIGITAL_UNDER_APP_BAR &&
              <Box sx={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#23C1F1', marginRight: 1 }} />}
            <Typography>Cerco Digital</Typography>
          </Button>
          <Button
            style={activeUnderAppBar === LOGIN_UNDER_APP_BAR ? { backgroundColor: 'grey', borderRadius: '20px' } : {}}
            color="inherit"
            onClick={() => setActiveUnderAppBar(LOGIN_UNDER_APP_BAR)}
            sx={{ paddingLeft:"15px",paddingRight:"15px"}}
          >
            {activeUnderAppBar === LOGIN_UNDER_APP_BAR &&
              <Box sx={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#23C1F1', marginRight: 1 }} />}
            <Typography>Login</Typography>
          </Button>
        </div>
      </Toolbar>
    </AppBar>
  )
}

export default AppBarNav

