import { Card, Grid, Button, ButtonGroup, Box, ThemeProvider, TextField, FormControl, InputLabel } from '@mui/material'
import React, { useEffect, useRef, useState } from 'react'
import { theme } from '../..'
import { useDispatch } from 'react-redux';
import { login } from '../../redux/auth/actions';

const Login = () => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const dispatch = useDispatch();
  return (
    <ThemeProvider theme={theme}>
      <Grid container spacing={3} style={{ marginTop: 50 }}>
        {/* Build me a form that gets username and password and then logs in */}
        <Grid item xs={12}>
          <Card style={{ padding: 20 }}>
            <h1>Login</h1>
            <TextField size="small" label="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
            <TextField size="small" label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
            <Button variant="contained" onClick={() => dispatch(login({ username, password }))} >Login</Button>
          </Card>
        </Grid>
      </Grid>
    </ThemeProvider>
  )
}

export default Login