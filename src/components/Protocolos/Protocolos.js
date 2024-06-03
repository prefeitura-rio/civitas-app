import { Box, Button, Card, Grid, TextField, ThemeProvider } from '@mui/material'
import React from 'react'
import { theme } from '../..'

const Protocolos = () => {
  return (
    <Grid container spacing={2} style={{ marginTop: 50 }}>
      <Grid item xs={12}>
        <Card elevation={0} sx={{ backgroundColor: "transparent", height: "50px", display: 'flex', alignItems: "center" }}>
          <Box justifyContent="flex-start">
            <TextField size="small" label="Pesquisar Protocolos..." />
          </Box>
          <Box display="flex" gap={1} justifyContent="flex-end" flexGrow={1}>
            <Button variant="contained"> Editar</Button>
            <Button variant="contained">Compartilhar</Button>
            <Button variant="contained">Deletar</Button>
          </Box>
        </Card>
      </Grid>
      <ThemeProvider theme={theme}>
      <Grid item xs={12}>
        <Card sx={{ height: "460px" }}>Card 2</Card>
      </Grid>
      </ThemeProvider>
    </Grid>
  )
}

export default Protocolos