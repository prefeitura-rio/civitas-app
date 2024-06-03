import { Card, Grid, Button, ButtonGroup, Box, ThemeProvider } from '@mui/material'
import React from 'react'
import { theme } from '../..'

const Cameras = () => {
  return (
    <Grid container spacing={3} style={{ marginTop: 50 }}>
      <Grid item xs={12}>
        <Card elevation={0} sx={{ backgroundColor:'transparent', height: "50px", display: 'flex', alignItems: 'center' }}>
          <Box display="flex" gap={2} justifyContent="flex-start">
            <Button variant="contained">Centro de Operações Rio</Button>
            <Button variant="contained">BRT</Button>
            <Button variant="contained">CET-RIO</Button>
            <Button variant="contained">Agentes externos</Button>
          </Box>
          <Box display="flex" justifyContent="flex-end" flexGrow={1}>
            <ButtonGroup size="small" aria-label="contained button group">
              <Button> 1</Button>
              <Button> 2</Button>
              <Button> 3</Button>
              <Button> 4</Button>
            </ButtonGroup>
          </Box>
        </Card>
      </Grid>
      <ThemeProvider theme={theme}>
      <Grid item xs={4}>
        <Card sx={{ height: "200px" }}>Card 1</Card>
      </Grid>
      <Grid item xs={4}>
        <Card sx={{ height: "200px" }}>Card 2</Card>
      </Grid>
      <Grid item xs={4}>
        <Card sx={{ height: "200px" }}>Card 3</Card>
      </Grid>
      <Grid item xs={4}>
        <Card sx={{ height: "200px" }} >Card 4</Card>
      </Grid>
      <Grid item xs={4}>
        <Card sx={{ height: "200px" }}>Card 5</Card>
      </Grid>
      <Grid item xs={4}>
        <Card sx={{ height: "200px" }}>Card 6</Card>
      </Grid>
      </ThemeProvider>
    </Grid>
  )
}

export default Cameras