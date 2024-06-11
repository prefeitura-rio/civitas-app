import React, { useState } from 'react'
import { AppBar, Toolbar, Button, Typography, Divider, Box, Avatar, Menu, MenuItem, IconButton, ListItemIcon } from '@mui/material';
import SportsSoccerIcon from '@mui/icons-material/SportsSoccer';
import { CAMERAS_UNDER_APP_BAR, HOME_UNDER_APP_BAR, MAPAS_UNDER_APP_BAR, PROTOCOLOS_UNDER_APP_BAR, CERCO_DIGITAL_UNDER_APP_BAR, LOGIN_UNDER_APP_BAR } from '../../redux/active/actions';
import civitas_icon from '../../assets/civitas_icon.png';
import prefeitura_icon from '../../assets/prefeitura_icon.png';
import logo_disque_denuncia from '../../assets/logo_disque_denuncia.png';
import { useDispatch } from 'react-redux';
import { logOut } from '../../redux/auth/actions';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
const AppBarNav = ({ setActiveUnderAppBar, activeUnderAppBar, profile }) => {

  const [anchorEl, setAnchorEl] = useState(null);

  const dispatch = useDispatch();

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const clearSession = () => {
    dispatch(logOut());
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("profile");
    setActiveUnderAppBar(LOGIN_UNDER_APP_BAR);
    setAnchorEl(false)
    setActiveUnderAppBar(LOGIN_UNDER_APP_BAR);
  }

  return (
    <AppBar style={{ backgroundColor: 'black' }}>  {/* <AppBar position="static"> */}
      <Toolbar>
        <img src={prefeitura_icon} alt="Logo" style={{ width: 'auto', height: '30px', paddingRight:"20px" }} />
        <img src={civitas_icon} alt="Logo" style={{ width: 'auto', height: '30px', paddingRight:"20px" }} />
        <img src={logo_disque_denuncia} alt="Logo" style={{ width: 'auto', height: '30px' }} />
        {/* <Divider orientation="vertical" style={{ marginLeft: 40, marginRight: 40, height: '33px', width: '6px', backgroundColor: '#23C1F1' }} />
        <Typography variant="h6" style={{ color: 'white' }}>DISQUE DENÚNCIA</Typography> */}
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center' }}>
          <Button
            style={activeUnderAppBar === HOME_UNDER_APP_BAR ? { backgroundColor: 'grey', borderRadius: '20px' } : {}}
            color="inherit"
            onClick={() => setActiveUnderAppBar(HOME_UNDER_APP_BAR)}
            sx={{ paddingLeft: "15px", paddingRight: "15px" }}
          >
            {activeUnderAppBar === HOME_UNDER_APP_BAR &&
              <Box sx={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#23C1F1', marginRight: 1 }} />}
            <Typography>HOME</Typography>
          </Button>
          {profile &&
            <Button
              style={activeUnderAppBar === CERCO_DIGITAL_UNDER_APP_BAR ? { backgroundColor: 'grey', borderRadius: '20px' } : {}}
              color="inherit"
              onClick={() => setActiveUnderAppBar(CERCO_DIGITAL_UNDER_APP_BAR)}
              sx={{ paddingLeft: "15px", paddingRight: "15px" }}
            >
              {activeUnderAppBar === CERCO_DIGITAL_UNDER_APP_BAR &&
                <Box sx={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#23C1F1', marginRight: 1 }} />}
              <Typography>Cerco Digital</Typography>
            </Button>
          }
          {profile ? (
            <div>
              <IconButton>
                <Avatar onClick={handleClick} />
              </IconButton>
              <Menu
                id="simple-menu"
                anchorEl={anchorEl}
                keepMounted
                open={Boolean(anchorEl)}
                onClose={() => setAnchorEl(null)}
                sx={{ marginTop: '10px', borderRadius: '20px' }}
                PaperProps={{ style: { borderRadius: '20px' } }}
              >
                <Typography sx={{ padding: '6px 16px', fontWeight: 'bold' }}>Bem vindo, {profile.username}!</Typography>
                <Divider />
                <MenuItem onClick={clearSession}>
                  <ListItemIcon>
                    <ExitToAppIcon sx={{ color: "black" }} fontSize="small" />
                  </ListItemIcon>
                  Sair
                </MenuItem>
              </Menu>
            </div>
          ) : (
            <Button
              style={activeUnderAppBar === LOGIN_UNDER_APP_BAR ? { backgroundColor: 'grey', borderRadius: '20px' } : {}}
              color="inherit"
              onClick={() => setActiveUnderAppBar(LOGIN_UNDER_APP_BAR)}
              sx={{ paddingLeft: "15px", paddingRight: "15px" }}
            >
              {activeUnderAppBar === LOGIN_UNDER_APP_BAR &&
                <Box sx={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#23C1F1', marginRight: 1 }} />}
              <Typography>Entrar</Typography>
            </Button>
          )}
        </div>
      </Toolbar>
    </AppBar>
  )
}

export default AppBarNav