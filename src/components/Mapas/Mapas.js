import { Box, Button, Card, Grid, TextField, ThemeProvider } from '@mui/material'
import React from 'react'
import { theme } from '../..'

const Mapas = () => {
  return (
    <Grid container spacing={3} style={{ marginTop: 50 }}>
      <Grid item xs={9}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card elevation={0} sx={{ backgroundColor: "transparent", height: "50px", display: 'flex', alignItems: "flex-start" }}>
              <Box justifyContent="flex-start">
                <TextField size="small" label="Pesquisar Protocolos..." />
              </Box>
              <Box display="flex" gap={1} justifyContent="flex-end" flexGrow={1}>
                <Button variant="contained"> Protocolos</Button>
                <Button variant="contained">Cerco Digital</Button>
                <Button variant="contained">Guarda Municipal</Button>
                <Button variant="contained"> CET-RIO</Button>
                <Button variant="contained"> Fogo Cruzado</Button>
                <Button variant="contained"> Trânsito</Button>
              </Box>
            </Card>
          </Grid>
          <ThemeProvider theme={theme}>
            <Grid item xs={12}>
              <Card sx={{ height: "426px" }}>Card 2</Card>
            </Grid>
          </ThemeProvider>
        </Grid>
      </Grid>
      <ThemeProvider theme={theme}>
        <Grid item xs={3}>
          <Card sx={{ height: "500px" }}>Card 3</Card>
        </Grid>
      </ThemeProvider>
    </Grid>
  )
}

export default Mapas