import { Avatar, Box, Button, Checkbox, Container, CssBaseline, FormControlLabel, Grid, Link, TextField, Typography } from '@mui/material';
import React, { useEffect, useState } from 'react';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { useDispatch } from 'react-redux';
import { login } from '../../redux/auth/actions';
import Loading from '../../utils/Loading';
import Error from '../../utils/Error';
import { CERCO_DIGITAL_UNDER_APP_BAR, HOME_UNDER_APP_BAR, setActiveUnderAppBar } from '../../redux/active/actions';

function Copyright() {
  return (
    <Typography variant="body2" color="white" align="center">
      {'Copyright © '}
      <Link color="inherit" target="_blank" href="https://www.dados.rio/">
        Escritório de Dados do Rio de Janeiro
      </Link>{' '}
      {new Date().getFullYear()}
      {'.'}
    </Typography>
  );
}


export default function Login({ loading, error, profile }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const dispatch = useDispatch();

  useEffect(() => {
    if (profile?.username) {
      dispatch(setActiveUnderAppBar(CERCO_DIGITAL_UNDER_APP_BAR))
    }
  }, [profile?.username])

  return (
    <Container component="main" maxWidth="xs">
      {loading && <Loading loading={loading} />}
      {error && <Error message={"Login ou senha inválido(s). Por favor, tente novamente!"} />}
      <CssBaseline />
      <div style={{
        marginTop: (8),
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}>
        <Avatar style={{
          margin: (1),
          backgroundColor: '#23C1F1'
        }}>
          <LockOutlinedIcon />
        </Avatar>
        <Typography sx={{ color: "white" }} component="h1" variant="h5">
          Sign in
        </Typography>
        <form style={{
          width: '100%', // Fix IE 11 issue.
          marginTop: (1)
        }} noValidate>
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            id="email"
            placeholder="Login"
            name="email"
            autoComplete="email"
            autoFocus
            sx={{
              "& fieldset": { border: 'none' },
              backgroundColor: 'white',
              borderRadius: '20px',

            }}
            value={username} onChange={(e) => setUsername(e.target.value)}
          />
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            name="password"
            placeholder="Senha"
            type="password"
            id="password"
            autoComplete="current-password"
            sx={{
              "& fieldset": { border: 'none' },
              backgroundColor: 'white',
              borderRadius: '20px',

            }}
            value={password} onChange={(e) => setPassword(e.target.value)}

          />

          <Button
            fullWidth
            variant="contained"
            color="primary"
            style={{ marginTop: 15 }}
            sx={{
              backgroundColor: "#23C1F1", borderRadius: "20px", '&:hover': {
                backgroundColor: '#23C1F1',
              },
              '&.Mui-disabled': { backgroundColor: 'gray' } // Adicionado aqui
            }}
            onClick={() => {
              dispatch(login({ username, password }));
            }}
            disabled={!username || !password}
          >
            Sign In
          </Button>

        </form>
      </div>
      <Box mt={8}>
        <Copyright />
      </Box>
    </Container>
  );
}