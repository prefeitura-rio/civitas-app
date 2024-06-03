import { Card, Grid, ThemeProvider } from '@mui/material'
import React from 'react'
import { theme } from '../..'

const Home = () => {
  return (
    <ThemeProvider theme={theme}>
      <Grid container spacing={3} style={{ marginTop: 50 }}>
        <Grid item xs={6}>
          <Card sx={{ height: "230px" }}>Card 1</Card>
        </Grid>
        <Grid item xs={3}>
          <Card sx={{ height: "230px" }}>Card 2</Card>
        </Grid>
        <Grid item xs={3}>
          <Card sx={{ height: "230px" }}>Card 3</Card>
        </Grid>
        <Grid item xs={12}>
          <Card sx={{ height: "230px" }} >Card 4</Card>
        </Grid>
      </Grid>
    </ThemeProvider>
  )
}

export default Home