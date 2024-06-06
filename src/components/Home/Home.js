import { Card, Grid, ThemeProvider } from '@mui/material'
import React from 'react'
import { theme } from '../..'

const Home = () => {
  return (
    <ThemeProvider theme={theme}>
      <Grid container spacing={3} style={{ marginTop: 50 }}>
        <Grid item xs={6}>
          <Card sx={{ height: "230px" }}>Em construção</Card>
        </Grid>
        <Grid item xs={3}>
          <Card sx={{ height: "230px" }}>Em construção</Card>
        </Grid>
        <Grid item xs={3}>
          <Card sx={{ height: "230px" }}>Em construção</Card>
        </Grid>
        <Grid item xs={12}>
          <Card sx={{ height: "230px" }} >Em construção</Card>
        </Grid>
      </Grid>
    </ThemeProvider>
  )
}

export default Home